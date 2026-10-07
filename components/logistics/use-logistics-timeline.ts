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
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const zoneCopies = gsap.utils.toArray<HTMLElement>("[data-zone-copy]", root);
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            document.documentElement.style.setProperty("--journey-progress", `${self.progress}`);
          },
        },
      });

      zoneCopies.forEach((zone, index) => {
        const cards = zone.querySelectorAll<HTMLElement>("[data-reveal]");
        const start = index * 1.05;
        timeline
          .fromTo(
            zone,
            { autoAlpha: index === 0 ? 1 : 0.08, yPercent: index === 0 ? 0 : 9 },
            { autoAlpha: 1, yPercent: 0, duration: 0.18 },
            start,
          )
          .fromTo(
            cards,
            { autoAlpha: 0, y: 22, scale: 0.985 },
            { autoAlpha: 1, y: 0, scale: 1, stagger: 0.045, duration: 0.16 },
            start + 0.08,
          );

        if (index < zoneCopies.length - 1) {
          timeline.to(
            zone,
            { autoAlpha: 0.12, yPercent: -7, duration: 0.2 },
            start + 0.78,
          );
        }
      });

      timeline.to({}, { duration: 0.35 });
    }, root);

    return () => {
      context.revert();
      progressRef.current = 0;
      document.documentElement.style.removeProperty("--journey-progress");
    };
  }, [progressRef, reducedMotion, rootRef]);
}
