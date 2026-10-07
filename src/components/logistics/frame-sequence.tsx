"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

const FRAME_COUNT = 240;
// Native size of every frame in each set. The canvas backing store matches it
// exactly so each draw is a 1:1 copy; CSS (object-fit: cover) scales it to the
// screen on the compositor. Scaling inside drawImage costs 50-300 ms per frame
// when Chrome has no GPU acceleration, which is what stalled the footage.
// Portrait screens fill the screen with a full-height centre crop of each
// frame: as sharp as the full frame where it is seen, under half the download,
// and each decoded bitmap is under half the memory, so it gets a longer
// lookahead. See scripts/prepare-frame-sequence.mjs.
const PORTRAIT = "(max-aspect-ratio: 1/1)";
const FRAME_SETS = {
  landscape: { directory: "frames-webp", width: 1280, height: 720, cacheSize: 20 },
  portrait: { directory: "frames-webp-portrait", width: 576, height: 720, cacheSize: 40 },
};

function subscribeToPortrait(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const FETCH_CONCURRENCY = 6;
// Download order: the next NEAR_FETCH frames at full rate, then a coarse pass
// over the whole sequence, then the in-betweens.
const NEAR_FETCH = 24;
const COARSE_STEP = 4;
const MAX_ATTEMPTS = 3;
// Scroll stops feeding new values while the wheel/touch is still settling;
// after this long we round to a whole frame so a resting image is never a blend.
const IDLE_SNAP_MS = 140;

function frameUrl(directory: string, index: number) {
  return `/${directory}/frame-${String(index + 1).padStart(4, "0")}.webp`;
}

interface Stop {
  y: number;
  frame: number;
}

interface FrameSequenceProps {
  storyRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

/**
 * Scroll-scrubbed image sequence.
 *
 * Compressed frames (~11 MB, ~5 MB in portrait) are all kept as Blobs. Decoded
 * bitmaps are expensive (1280x720x4 = 3.7 MB each, plus a GPU copy once drawn), so only a
 * small window around the playhead is kept decoded. The window is biased
 * towards the direction of travel and refilled on every animation frame —
 * never only after scrolling stops — which is what keeps a small cache smooth.
 */
export function FrameSequence({ storyRef, reducedMotion }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Rotating the phone restarts the sequence with the other frame set.
  const portrait = useSyncExternalStore(
    subscribeToPortrait,
    () => window.matchMedia(PORTRAIT).matches,
    () => false,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const story = storyRef.current;
    if (!canvas || !story) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    // Hard memory ceiling: ~75 MB of bitmaps on desktop, ~66 MB on phones.
    // A bigger cache crashed tabs on machines that were already short on RAM.
    // Phones' shorter page covers more frames per swipe, so the portrait set's
    // cheaper bitmaps go into a longer lookahead rather than a lower ceiling.
    const frameSet = portrait ? FRAME_SETS.portrait : FRAME_SETS.landscape;
    const { directory, width: frameWidth, height: frameHeight, cacheSize } = frameSet;
    // createImageBitmap decodes off the main thread; use the cores we have.
    const decodeConcurrency = Math.min(4, Math.max(2, (navigator.hardwareConcurrency || 4) - 1));
    const ahead = Math.round(cacheSize * 0.7);
    const behind = cacheSize - ahead - 1;

    const blobs: Array<Blob | undefined> = new Array(FRAME_COUNT);
    const attempts = new Uint8Array(FRAME_COUNT);
    const fetching = new Set<number>();
    const decoded = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    let disposed = false;

    let stops: Stop[] = [{ y: 0, frame: 0 }, { y: 1, frame: FRAME_COUNT - 1 }];

    let displayed = 0; // smoothed, fractional playhead
    let previousDisplayed = 0;
    let speed = 0; // frames per second, smoothed
    let refreshSeconds = 1 / 60; // measured, smoothed
    // Decode every Nth frame ahead when moving fast: at that speed each screen
    // refresh skips frames anyway, so decoding the in-betweens only falls behind.
    let stride = 1;
    let lastDrawnIndex = -1;
    let decodeMs = 20; // measured, smoothed
    let direction = 1;
    let lastScrollY = -1;
    let lastScrollTime = 0;
    let lastDrawKey = "";
    let previousTime = performance.now();
    let animationFrame = 0;

    const measure = () => {
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      const sections = [...story.querySelectorAll<HTMLElement>("[data-frame]")];
      const next: Stop[] = [];
      sections.forEach((section, index) => {
        const top = section.getBoundingClientRect().top + scrollTop;
        // The cut lands while the new chapter's copy is rising into view.
        const y = index === 0 ? 0 : Math.max(0, top - vh * 0.4);
        if (!next.length || y > next[next.length - 1].y) {
          next.push({ y, frame: Number(section.dataset.frame) });
        }
        if (index === sections.length - 1) {
          const end = Math.max(y + 1, top + section.offsetHeight - vh);
          next.push({ y: end, frame: FRAME_COUNT - 1 });
        }
      });
      if (next.length > 1) stops = next;
    };

    const frameAt = (y: number) => {
      if (y <= stops[0].y) return stops[0].frame;
      for (let i = 1; i < stops.length; i += 1) {
        const a = stops[i - 1];
        const b = stops[i];
        if (y <= b.y) {
          if (reducedMotion) return a.frame;
          return a.frame + ((b.frame - a.frame) * (y - a.y)) / (b.y - a.y);
        }
      }
      return stops[stops.length - 1].frame;
    };


    // ---- network -------------------------------------------------------

    const needsFetch = (index: number) =>
      index >= 0 && index < FRAME_COUNT && !blobs[index] && !fetching.has(index) && attempts[index] < MAX_ATTEMPTS;

    const nextFetchIndex = () => {
      // Follow the playhead in the direction of travel for the next stretch...
      const center = Math.round(displayed);
      for (let distance = 0; distance <= NEAR_FETCH; distance += 1) {
        if (needsFetch(center + distance * direction)) return center + distance * direction;
        if (distance <= 6 && needsFetch(center - distance * direction)) return center - distance * direction;
      }
      // ...then every COARSE_STEP-th frame of the rest, so scrolling into
      // footage that hasn't fully arrived still finds a nearby frame instead
      // of freezing on the last one (what made the first scroll feel stuck)...
      for (let distance = 0; distance < FRAME_COUNT; distance += 1) {
        const index = center + distance * direction;
        if (index % COARSE_STEP === 0 && needsFetch(index)) return index;
      }
      for (let index = 0; index < FRAME_COUNT; index += COARSE_STEP) {
        if (needsFetch(index)) return index;
      }
      // ...then fill in the gaps, nearest the playhead first.
      for (let distance = 0; distance < FRAME_COUNT; distance += 1) {
        if (needsFetch(center + distance * direction)) return center + distance * direction;
        if (needsFetch(center - distance * direction)) return center - distance * direction;
      }
      for (let index = 0; index < FRAME_COUNT; index += 1) {
        if (needsFetch(index)) return index;
      }
      return -1;
    };

    const fetchWorker = async () => {
      while (!disposed) {
        const index = nextFetchIndex();
        if (index < 0) return;
        fetching.add(index);
        attempts[index] += 1;
        try {
          const response = await fetch(frameUrl(directory, index), { cache: "force-cache" });
          if (!response.ok) throw new Error(`Frame ${index + 1} returned ${response.status}`);
          blobs[index] = await response.blob();
        } catch (error) {
          console.warn(error);
          await new Promise((resolve) => setTimeout(resolve, 600));
        } finally {
          fetching.delete(index);
        }
      }
    };

    // ---- decoding ------------------------------------------------------

    // Frames worth holding: a few behind the playhead (for small reversals) and,
    // ahead of it, the ones on the stride grid. The grid is anchored to absolute
    // indices so it doesn't shift, and evict what was just decoded, every tick.
    const isWanted = (index: number, center: number) => {
      const offset = (index - center) * direction;
      if (offset < -behind || offset > ahead * stride) return false;
      return offset <= 1 || index % stride === 0;
    };

    const evict = (center: number) => {
      if (decoded.size <= cacheSize) return;
      const base = Math.floor(displayed);
      const onScreen = new Set([lastDrawnIndex, base, base + 1]);
      const victims = [...decoded.keys()]
        .filter((index) => !onScreen.has(index))
        .sort((a, b) => {
          const unwanted = Number(!isWanted(b, center)) - Number(!isWanted(a, center));
          return unwanted || Math.abs(b - center) - Math.abs(a - center);
        });
      for (const index of victims) {
        if (decoded.size <= cacheSize) break;
        decoded.get(index)?.close();
        decoded.delete(index);
      }
    };

    const startDecode = (index: number) => {
      const blob = blobs[index];
      if (!blob) return;
      decoding.add(index);
      const started = performance.now();
      createImageBitmap(blob)
        .then((bitmap) => {
          decodeMs += (performance.now() - started - decodeMs) * 0.2;
          if (disposed) {
            bitmap.close();
            return;
          }
          decoded.set(index, bitmap);
          evict(Math.round(displayed));
        })
        .catch((error) => console.warn(error))
        .finally(() => decoding.delete(index));
    };

    const scheduleDecodes = (center: number) => {
      if (decoding.size >= decodeConcurrency) return;
      const reach = ahead * stride;
      // A decode started now lands this many frames further on; anything
      // nearer will already have been passed, so start the search there.
      const lead = Math.min(reach, Math.round((speed * decodeMs * 1.5) / 1000));
      const tryDecode = (index: number) => {
        if (index < 0 || index >= FRAME_COUNT || !isWanted(index, center)) return;
        if (decoded.has(index) || decoding.has(index) || !blobs[index]) return;
        startDecode(index);
      };
      for (let distance = 0; distance <= reach && decoding.size < decodeConcurrency; distance += 1) {
        const forward = lead + distance;
        if (forward <= reach) tryDecode(center + forward * direction);
        else if (forward - reach - 1 < lead) tryDecode(center + (forward - reach - 1) * direction);
        if (distance <= behind) tryDecode(center - distance * direction);
      }
    };

    // ---- drawing -------------------------------------------------------

    const drawFrame = (bitmap: ImageBitmap) => {
      context.drawImage(bitmap, 0, 0, frameWidth, frameHeight);
    };

    const nearestDecoded = (index: number) => {
      if (decoded.has(index)) return index;
      // Prefer holding a frame we have already passed: a brief hold reads as
      // the footage slowing down, a jump ahead reads as a glitch.
      for (let distance = 1; distance <= Math.max(12, stride * 2); distance += 1) {
        const back = index - distance * direction;
        if (decoded.has(back)) return back;
        const forward = index + distance * direction;
        if (decoded.has(forward)) return forward;
      }
      // Moving faster than frames decode: show the furthest-along frame we
      // have between the last one drawn and the playhead, so the picture keeps
      // travelling instead of freezing.
      let best = -1;
      for (const candidate of decoded.keys()) {
        const progress = (candidate - lastDrawnIndex) * direction;
        const remaining = (index - candidate) * direction;
        if (progress > 0 && remaining >= 0 && (best < 0 || remaining < (index - best) * direction)) best = candidate;
      }
      return best;
    };

    const draw = () => {
      const base = Math.floor(displayed);
      const mix = displayed - base;
      const exact = decoded.has(base);
      const drawIndex = exact ? base : nearestDecoded(base);
      if (drawIndex < 0) return;

      // Blend into the next frame while moving so scrubbing reads as footage
      // rather than a slideshow of stills.
      const blendNext = exact && mix > 0.04 && decoded.has(base + 1);
      const key = blendNext ? `${base}:${Math.round(mix * 24)}` : `${drawIndex}`;
      if (key === lastDrawKey) return;

      context.globalAlpha = 1;
      drawFrame(decoded.get(drawIndex)!);
      if (blendNext) {
        context.globalAlpha = mix;
        drawFrame(decoded.get(base + 1)!);
        context.globalAlpha = 1;
      }
      lastDrawKey = key;
      lastDrawnIndex = drawIndex;
      // The SSR poster sits underneath until the canvas has real pixels.
      if (!canvas.dataset.live) canvas.dataset.live = "true";
    };

    // ---- loop ----------------------------------------------------------

    const tick = (time: number) => {
      const elapsed = Math.min(0.064, (time - previousTime) / 1000);
      previousTime = time;

      const scrollY = window.scrollY;
      if (scrollY !== lastScrollY) {
        if (lastScrollY >= 0) direction = scrollY > lastScrollY ? 1 : -1;
        lastScrollY = scrollY;
        lastScrollTime = time;
      }

      const target = frameAt(scrollY);
      const goal = reducedMotion || time - lastScrollTime > IDLE_SNAP_MS ? Math.round(target) : target;
      if (reducedMotion) {
        displayed = goal;
      } else {
        // One light smoothing stage (~70 ms) turns discrete wheel steps into
        // continuous motion without visibly trailing the page.
        displayed += (goal - displayed) * (1 - Math.exp(-elapsed * 14));
        if (Math.abs(goal - displayed) < 0.002) displayed = goal;
      }
      displayed = Math.min(FRAME_COUNT - 1, Math.max(0, displayed));

      if (elapsed > 0) {
        speed += (Math.abs(displayed - previousDisplayed) / elapsed - speed) * 0.3;
        refreshSeconds += (elapsed - refreshSeconds) * 0.1;
      }
      previousDisplayed = displayed;
      // Frames the playhead covers per screen refresh = frames worth decoding.
      stride = Math.max(1, Math.min(12, Math.round(speed * refreshSeconds)));

      const center = Math.round(displayed);
      scheduleDecodes(center);
      draw();

      animationFrame = window.requestAnimationFrame(tick);
    };

    canvas.width = frameWidth;
    canvas.height = frameHeight;
    measure();
    displayed = Math.round(frameAt(window.scrollY));
    previousDisplayed = displayed;
    const observer = new ResizeObserver(measure);
    observer.observe(story);
    window.addEventListener("resize", measure, { passive: true });
    for (let worker = 0; worker < FETCH_CONCURRENCY; worker += 1) void fetchWorker();
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      decoded.forEach((bitmap) => bitmap.close());
      decoded.clear();
      // Resizing the canvas for the next frame set blanks it; show the poster until it draws.
      delete canvas.dataset.live;
    };
  }, [portrait, reducedMotion, storyRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="frame-canvas"
        role="img"
        aria-label="A container shipment travelling from the port, by road, into a secure warehouse"
      />
    </>
  );
}
