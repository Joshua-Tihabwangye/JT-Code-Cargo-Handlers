"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";

const FRAME_COUNT = 240;
const ANCHOR_STRIDE = 1;
const FETCH_CONCURRENCY = 8;
const DECODE_CONCURRENCY = 2;

const FRAME_STOPS = [
  { progress: 0, frame: 0 },
  { progress: 0.14, frame: 25 },
  { progress: 0.34, frame: 90 },
  { progress: 0.54, frame: 205 },
  { progress: 0.76, frame: 228 },
  { progress: 1, frame: FRAME_COUNT - 1 },
];

interface DecodedFrame {
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}

function frameUrl(index: number) {
  return `/frames-webp/frame-${String(index + 1).padStart(4, "0")}.webp`;
}

function anchorUrl(index: number) {
  return `/frames-anchor/anchor-${String(index + 1).padStart(4, "0")}.webp`;
}

function progressToFrame(progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  const nextIndex = FRAME_STOPS.findIndex((stop) => stop.progress >= clamped);
  if (nextIndex <= 0) return FRAME_STOPS[0].frame;

  const previous = FRAME_STOPS[nextIndex - 1];
  const next = FRAME_STOPS[nextIndex];
  const localProgress = (clamped - previous.progress) / (next.progress - previous.progress);
  return Math.round(previous.frame + (next.frame - previous.frame) * localProgress);
}

function drawCover(
  context: CanvasRenderingContext2D,
  frame: DecodedFrame,
  width: number,
  height: number,
) {
  const scale = Math.max(width / frame.width, height / frame.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (frame.width - sourceWidth) / 2;
  const sourceY = (frame.height - sourceHeight) / 2;

  context.clearRect(0, 0, width, height);
  context.drawImage(
    frame.source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
}

async function decodeBlob(blob: Blob): Promise<DecodedFrame> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(blob);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;
  await image.decode();
  URL.revokeObjectURL(objectUrl);
  return { source: image, width: image.naturalWidth, height: image.naturalHeight };
}

interface FrameSequenceProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

export function FrameSequence({ progressRef, reducedMotion }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameLabelRef = useRef<HTMLSpanElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [anchorsReady, setAnchorsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!context) return;

    const blobs: Array<Blob | undefined> = new Array(FRAME_COUNT);
    const fetchPromises = new Map<number, Promise<Blob>>();
    const decoded = new Map<number, DecodedFrame>();
    const decodedAnchors = new Map<number, DecodedFrame>();
    const lastUsed = new Map<number, number>();
    const decodePromises = new Map<number, Promise<void>>();
    const queuedForDecode = new Set<number>();
    const activeDecodes = new Set<number>();
    let decodeQueue: number[] = [];
    let fetchedCount = 0;
    let reportedProgress = -1;
    let backgroundCursor = 0;
    let animationFrame = 0;
    let lastDrawnKey = "";
    let targetFrame = 0;
    let previousTarget = 0;
    let lastTargetChangeTime = performance.now();
    let exactRequestedTarget = -1;
    let warmedTarget = -1;
    let smoothedProgress = 0;
    let previousTime = performance.now();
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let disposed = false;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const maxDecodedFrames = viewportWidth < 720 || deviceMemory <= 4 ? 12 : 20;
    const anchorIndices = Array.from(
      new Set([
        ...Array.from({ length: Math.ceil(FRAME_COUNT / ANCHOR_STRIDE) }, (_, index) => index * ANCHOR_STRIDE),
        FRAME_COUNT - 1,
      ]),
    ).filter((index) => index < FRAME_COUNT);

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      // The source is 1280x720, so oversized HiDPI backing stores add GPU work
      // without revealing more image detail.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(viewportWidth * dpr);
      canvas.height = Math.round(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnKey = "";
    };

    const reportFetched = () => {
      const percentage = Math.round((fetchedCount / FRAME_COUNT) * 100);
      if (percentage !== reportedProgress) {
        reportedProgress = percentage;
        setLoadProgress(percentage);
      }
    };

    const fetchFrame = (index: number) => {
      if (blobs[index]) return Promise.resolve(blobs[index]);
      const existing = fetchPromises.get(index);
      if (existing) return existing;

      const request = fetch(frameUrl(index), { cache: "force-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`Frame ${index + 1} failed to load.`);
          return response.blob();
        })
        .then((blob) => {
          blobs[index] = blob;
          fetchedCount += 1;
          reportFetched();
          return blob;
        })
        .finally(() => fetchPromises.delete(index));

      fetchPromises.set(index, request);
      return request;
    };

    const evictDecodedFrames = () => {
      if (decoded.size <= maxDecodedFrames) return;
      const protectedRadius = 7;
      const candidates = [...decoded.keys()]
        .filter((index) => Math.abs(index - targetFrame) > protectedRadius)
        .sort((a, b) => (lastUsed.get(a) ?? 0) - (lastUsed.get(b) ?? 0));

      while (decoded.size > maxDecodedFrames && candidates.length) {
        const index = candidates.shift();
        if (index === undefined) break;
        decoded.get(index)?.close?.();
        decoded.delete(index);
        lastUsed.delete(index);
      }
    };

    const decodeFrame = (index: number) => {
      if (decoded.has(index)) return Promise.resolve();
      const existing = decodePromises.get(index);
      if (existing) return existing;

      const request = fetchFrame(index)
        .then(decodeBlob)
        .then((frame) => {
          if (disposed) {
            frame.close?.();
            return;
          }
          decoded.set(index, frame);
          lastUsed.set(index, performance.now());
          evictDecodedFrames();
          if (index === 0) setReady(true);
        })
        .catch((error) => console.warn(error))
        .finally(() => decodePromises.delete(index));

      decodePromises.set(index, request);
      return request;
    };

    const pumpDecodeQueue = () => {
      decodeQueue.sort((a, b) => Math.abs(a - targetFrame) - Math.abs(b - targetFrame));
      while (activeDecodes.size < DECODE_CONCURRENCY && decodeQueue.length) {
        const index = decodeQueue.shift();
        if (index === undefined) break;
        queuedForDecode.delete(index);
        if (decoded.has(index) || activeDecodes.has(index)) continue;
        activeDecodes.add(index);
        void decodeFrame(index).finally(() => {
          activeDecodes.delete(index);
          pumpDecodeQueue();
        });
      }
    };

    const queueDecode = (index: number, urgent = false) => {
      if (index < 0 || index >= FRAME_COUNT || decoded.has(index) || activeDecodes.has(index) || queuedForDecode.has(index)) return;
      if (urgent) decodeQueue.unshift(index);
      else decodeQueue.push(index);
      queuedForDecode.add(index);
      if (decodeQueue.length > 72) {
        decodeQueue.sort((a, b) => Math.abs(a - targetFrame) - Math.abs(b - targetFrame));
        for (const removed of decodeQueue.splice(72)) queuedForDecode.delete(removed);
      }
      pumpDecodeQueue();
    };

    const warmAround = (center: number, direction: number) => {
      queueDecode(center, true);
      for (let distance = 1; distance <= 8; distance += 1) {
        queueDecode(center + distance * direction, distance < 5);
        queueDecode(center - distance * direction);
      }
    };

    const nearestDecodedFrame = (center: number) => {
      if (decoded.has(center)) {
        return { frame: decoded.get(center), index: center, key: `main-${center}` };
      }
      for (let distance = 1; distance <= 2; distance += 1) {
        const before = center - distance;
        const after = center + distance;
        if (before >= 0 && decoded.has(before)) {
          return { frame: decoded.get(before), index: before, key: `main-${before}` };
        }
        if (after < FRAME_COUNT && decoded.has(after)) {
          return { frame: decoded.get(after), index: after, key: `main-${after}` };
        }
      }

      const closestAnchor = center === FRAME_COUNT - 1
        ? FRAME_COUNT - 1
        : Math.min(FRAME_COUNT - 1, Math.round(center / ANCHOR_STRIDE) * ANCHOR_STRIDE);
      for (let distance = 0; distance < FRAME_COUNT; distance += ANCHOR_STRIDE) {
        const before = closestAnchor - distance;
        const after = closestAnchor + distance;
        if (before >= 0 && decodedAnchors.has(before)) {
          return { frame: decodedAnchors.get(before), index: before, key: `anchor-${before}` };
        }
        if (after < FRAME_COUNT && decodedAnchors.has(after)) {
          return { frame: decodedAnchors.get(after), index: after, key: `anchor-${after}` };
        }
      }

      for (let distance = 3; distance < FRAME_COUNT; distance += 1) {
        const before = center - distance;
        const after = center + distance;
        if (before >= 0 && decoded.has(before)) {
          return { frame: decoded.get(before), index: before, key: `main-${before}` };
        }
        if (after < FRAME_COUNT && decoded.has(after)) {
          return { frame: decoded.get(after), index: after, key: `main-${after}` };
        }
      }
      return null;
    };

    const render = (time: number) => {
      const elapsedSeconds = Math.min(0.05, (time - previousTime) / 1000);
      previousTime = time;
      const requestedProgress = reducedMotion ? 0 : progressRef.current;
      const smoothing = 1 - Math.exp(-elapsedSeconds * 15);
      smoothedProgress += (requestedProgress - smoothedProgress) * smoothing;
      if (Math.abs(requestedProgress - smoothedProgress) < 0.00005) smoothedProgress = requestedProgress;

      targetFrame = progressToFrame(smoothedProgress);
      const direction = targetFrame >= previousTarget ? 1 : -1;
      if (targetFrame !== previousTarget) {
        for (const index of decodeQueue) queuedForDecode.delete(index);
        decodeQueue = [];
        previousTarget = targetFrame;
        lastTargetChangeTime = time;
        exactRequestedTarget = -1;
        warmedTarget = -1;
      }

      const settledFor = time - lastTargetChangeTime;
      if (settledFor > 56 && exactRequestedTarget !== targetFrame) {
        queueDecode(targetFrame, true);
        exactRequestedTarget = targetFrame;
      }
      if (settledFor > 180 && warmedTarget !== targetFrame) {
        warmAround(targetFrame, direction);
        warmedTarget = targetFrame;
      }

      const drawable = nearestDecodedFrame(targetFrame);
      if (drawable?.frame && drawable.key !== lastDrawnKey) {
        drawCover(context, drawable.frame, viewportWidth, viewportHeight);
        if (drawable.key.startsWith("main")) lastUsed.set(drawable.index, time);
        lastDrawnKey = drawable.key;
        if (frameLabelRef.current) {
          frameLabelRef.current.textContent = `${String(targetFrame + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
        }
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const fetchWorker = async () => {
      while (!disposed && backgroundCursor < FRAME_COUNT) {
        const index = backgroundCursor;
        backgroundCursor += 1;
        try {
          await fetchFrame(index);
        } catch (error) {
          console.warn(error);
        }
      }
    };

    let anchorCursor = 0;
    const anchorWorker = async () => {
      while (!disposed && anchorCursor < anchorIndices.length) {
        const index = anchorIndices[anchorCursor];
        anchorCursor += 1;
        try {
          const response = await fetch(anchorUrl(index), { cache: "force-cache" });
          if (!response.ok) throw new Error(`Anchor frame ${index + 1} failed to load.`);
          const frame = await decodeBlob(await response.blob());
          if (disposed) frame.close?.();
          else decodedAnchors.set(index, frame);
        } catch (error) {
          console.warn(error);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    warmAround(0, 1);
    void Promise.all(Array.from({ length: FETCH_CONCURRENCY }, () => fetchWorker()));
    void Promise.all([anchorWorker(), anchorWorker(), anchorWorker(), anchorWorker()]).then(() => {
      if (!disposed) setAnchorsReady(true);
    });
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      decoded.forEach((frame) => frame.close?.());
      decodedAnchors.forEach((frame) => frame.close?.());
      decoded.clear();
      decodedAnchors.clear();
    };
  }, [progressRef, reducedMotion]);

  return (
    <div
      className={`frame-sequence ${ready ? "is-ready" : ""}`}
      data-anchors-ready={anchorsReady ? "true" : "false"}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A cargo shipment travelling from port operations to secure warehousing"
      />
      <div className="sequence-meta" aria-hidden="true">
        <span>SCROLL-DRIVEN JOURNEY</span>
        <span ref={frameLabelRef}>001 / {FRAME_COUNT}</span>
      </div>
      <div className={`sequence-buffer ${loadProgress === 100 ? "is-complete" : ""}`} aria-hidden="true">
        <span>Visual buffer</span>
        <i><b style={{ transform: `scaleX(${loadProgress / 100})` }} /></i>
        <strong>{loadProgress}%</strong>
      </div>
      {!ready ? (
        <div className="sequence-loader" role="status" aria-live="polite">
          <span>Preparing cinematic route</span>
          <div><i style={{ transform: `scaleX(${loadProgress / 100})` }} /></div>
          <strong>{loadProgress}%</strong>
        </div>
      ) : null}
    </div>
  );
}
