"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";

const FRAME_COUNT = 150;

const FRAME_STOPS = [
  { progress: 0, frame: 0 },
  { progress: 0.15, frame: 18 },
  { progress: 0.33, frame: 55 },
  { progress: 0.52, frame: 118 },
  { progress: 0.75, frame: 145 },
  { progress: 1, frame: FRAME_COUNT - 1 },
];

function frameUrl(index: number) {
  return `/frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
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
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;

  context.clearRect(0, 0, width, height);
  context.drawImage(
    image,
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

interface FrameSequenceProps {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

export function FrameSequence({ progressRef, reducedMotion }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameLabelRef = useRef<HTMLSpanElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const images: HTMLImageElement[] = [];
    let loaded = 0;
    let animationFrame = 0;
    let lastDrawnFrame = -1;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let disposed = false;

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(viewportWidth * dpr);
      canvas.height = Math.round(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnFrame = -1;
    };

    const nearestLoadedFrame = (target: number) => {
      if (images[target]?.complete && images[target].naturalWidth) return target;
      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const before = target - distance;
        const after = target + distance;
        if (before >= 0 && images[before]?.complete && images[before].naturalWidth) return before;
        if (after < FRAME_COUNT && images[after]?.complete && images[after].naturalWidth) return after;
      }
      return -1;
    };

    const render = () => {
      const target = reducedMotion
        ? 0
        : progressToFrame(progressRef.current);
      const drawable = nearestLoadedFrame(target);

      if (drawable >= 0 && drawable !== lastDrawnFrame) {
        drawCover(context, images[drawable], viewportWidth, viewportHeight);
        lastDrawnFrame = drawable;
        if (frameLabelRef.current) {
          frameLabelRef.current.textContent = `${String(target + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
        }
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (disposed) return;
        loaded += 1;
        setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
        if (index === 0) {
          setReady(true);
          lastDrawnFrame = -1;
        }
      };
      image.src = frameUrl(index);
      images.push(image);
    }

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [progressRef, reducedMotion]);

  return (
    <div className={`frame-sequence ${ready ? "is-ready" : ""}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A cargo shipment travelling from port operations to secure warehousing"
      />
      <div className="sequence-meta" aria-hidden="true">
        <span>SCROLL SEQUENCE</span>
        <span ref={frameLabelRef}>001 / {FRAME_COUNT}</span>
      </div>
      {!ready ? (
        <div className="sequence-loader" role="status" aria-live="polite">
          <span>Preparing the cargo journey</span>
          <div><i style={{ transform: `scaleX(${loadProgress / 100})` }} /></div>
          <strong>{loadProgress}%</strong>
        </div>
      ) : null}
    </div>
  );
}
