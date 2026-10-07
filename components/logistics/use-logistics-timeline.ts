"use client";

import { useLayoutEffect, type MutableRefObject, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface TimelineOptions {
  rootRef: RefObject<HTMLElement | null>;
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

export function useLogisticsTimeline({
  rootRef,
  progressRef,
  reducedMotion,
}: TimelineOptions) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) {
      progressRef.current = 0;
      document.documentElement.style.setProperty("--journey-progress", "0");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const playhead = { progress: 0 };
      gsap.to(playhead, {
        progress: 1,
        ease: "none",
        onUpdate: () => {
          progressRef.current = playhead.progress;
          document.documentElement.style.setProperty(
            "--journey-progress",
            `${playhead.progress}`,
          );
        },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      const reveals = gsap
        .utils
        .toArray<HTMLElement>("[data-reveal]", root)
        .filter((element) => !element.closest(".hero-zone"));
      reveals.forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0.18, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top 92%",
              end: "top 63%",
              scrub: 0.22,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, root);

    return () => {
      context.revert();
      progressRef.current = 0;
      document.documentElement.style.removeProperty("--journey-progress");
    };
  }, [progressRef, reducedMotion, rootRef]);
}
