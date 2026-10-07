"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface TimelineOptions {
  rootRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

// Keep in sync with the compact @media block in globals.css: phones, and
// landscape phones / short windows where pinned copy can't fit on screen.
const COMPACT = "(max-width: 760px), (max-height: 560px)";
const WIDE = "(min-width: 761px) and (min-height: 561px)";

/**
 * Wide screens: chapter copy is pinned (sticky) and fades in and out with the
 * scroll position (scrub: true, so it moves in lockstep with the footage).
 * Compact screens: copy scrolls normally, fades in once and then stays fully
 * visible, so nothing is ever hidden while it is on screen.
 *
 * Either way the active chapter is written to <html data-chapter / data-side>
 * for the nav and scene shading.
 */
export function useLogisticsTimeline({ rootRef, reducedMotion }: TimelineOptions) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;

    gsap.registerPlugin(ScrollTrigger);

    const zones = gsap.utils.toArray<HTMLElement>(".story-zone", root);
    const media = gsap.matchMedia(root);

    media.add({ wide: WIDE, compact: COMPACT }, (context) => {
      const { wide } = context.conditions as { wide: boolean; compact: boolean };

      zones.forEach((zone) => {
        ScrollTrigger.create({
          trigger: zone,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: ({ isActive }) => {
            if (!isActive) return;
            html.dataset.chapter = zone.dataset.chapter ?? "";
            html.dataset.side = zone.dataset.side ?? "left";
          },
        });

        const copy = zone.querySelector<HTMLElement>("[data-zone-copy]");
        if (!copy || reducedMotion) return;
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", copy);
        const isHero = zone.classList.contains("hero-zone");

        if (!wide) {
          if (isHero) return;
          gsap.from(items, {
            autoAlpha: 0,
            y: 18,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: copy, start: "top 88%", once: true },
          });
          return;
        }

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: zone,
            start: isHero ? "top top" : "top 85%",
            // Fully faded before the next chapter (or the footer) takes over.
            end: "bottom 50%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // The hero is already on screen at load; it only needs to leave.
        if (!isHero) {
          timeline
            .fromTo(copy, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.22 })
            .fromTo(items, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.12 }, 0.06);
        }
        timeline
          .to(copy, { autoAlpha: 1, duration: isHero ? 0.55 : 0.5 })
          .to(copy, { autoAlpha: 0, y: -36, duration: 0.2 });
      });

      if (!wide) return;

      // Pinned copy taller than the window would have its end cut off. Pin it
      // by its bottom edge instead: it scrolls until its last line is on
      // screen, then holds.
      const copies = zones
        .map((zone) => zone.querySelector<HTMLElement>("[data-zone-copy]"))
        .filter((copy): copy is HTMLElement => Boolean(copy));
      const fitPinnedCopy = () => {
        copies.forEach((copy) => {
          copy.style.top = `${Math.min(0, window.innerHeight - copy.offsetHeight)}px`;
        });
      };
      fitPinnedCopy();
      const observer = new ResizeObserver(fitPinnedCopy);
      copies.forEach((copy) => observer.observe(copy));
      window.addEventListener("resize", fitPinnedCopy);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", fitPinnedCopy);
        copies.forEach((copy) => copy.style.removeProperty("top"));
      };
    });

    // Layout settles once the web fonts are in; re-measure trigger positions.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      media.revert();
      delete html.dataset.chapter;
      delete html.dataset.side;
    };
  }, [reducedMotion, rootRef]);
}
