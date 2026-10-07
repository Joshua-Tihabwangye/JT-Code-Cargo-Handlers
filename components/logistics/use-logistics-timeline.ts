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
    if (!root) return;

    const header = document.querySelector<HTMLElement>(".site-header");
    const railProgress = document.querySelector<HTMLElement>(".journey-rail__track i");

    if (reducedMotion) {
      progressRef.current = 0;
      if (railProgress) railProgress.style.transform = "scaleY(0)";
      root.querySelectorAll<HTMLElement>("[data-zone-copy], [data-reveal]").forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
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
          if (railProgress) railProgress.style.transform = `scaleY(${playhead.progress})`;
        },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.22,
          invalidateOnRefresh: true,
        },
      });

      const zones = gsap.utils.toArray<HTMLElement>(".story-zone", root);
      zones.forEach((zone) => {
        const copy = zone.querySelector<HTMLElement>("[data-zone-copy]");
        if (!copy) return;

        const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]", copy);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top 82%",
            end: "bottom 18%",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(
            copy,
            { autoAlpha: 0.04, y: 54, scale: 0.985 },
            { autoAlpha: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.23 },
          )
          .fromTo(
            revealItems,
            { autoAlpha: 0.2, y: 22 },
            { autoAlpha: 1, y: 0, stagger: 0.025, ease: "power2.out", duration: 0.16 },
            0.07,
          )
          .to(copy, { autoAlpha: 1, y: 0, duration: 0.48 })
          .to(copy, { autoAlpha: 0.05, y: -46, scale: 0.99, ease: "power2.in", duration: 0.23 });

        const chapter = zone.dataset.chapter;
        if (chapter) {
          ScrollTrigger.create({
            trigger: zone,
            start: "top center",
            end: "bottom center",
            onEnter: () => header?.setAttribute("data-active", chapter),
            onEnterBack: () => header?.setAttribute("data-active", chapter),
          });
        }
      });
    }, root);

    return () => {
      context.revert();
      progressRef.current = 0;
      header?.removeAttribute("data-active");
      railProgress?.style.removeProperty("transform");
    };
  }, [progressRef, reducedMotion, rootRef]);
}
