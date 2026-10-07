"use client";

import { useEffect, useRef, useState } from "react";
import {
  AboutSection,
  Footer,
  HeroSection,
  PortTransferSection,
  SiteHeader,
  TransitSection,
  WarehouseSection,
} from "./sections";
import { FrameSequence } from "./frame-sequence";
import { useLogisticsTimeline } from "./use-logistics-timeline";

export function LogisticsExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useLogisticsTimeline({ rootRef, reducedMotion });

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <div className="scene-layer">
        {/* Server-rendered first frame: paints with the text, before any JS runs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="frame-poster" src="/frames-webp/frame-0001.webp" alt="" fetchPriority="high" />
        <FrameSequence storyRef={rootRef} reducedMotion={reducedMotion} />
        <div className="scene-shade scene-shade--left" aria-hidden="true" />
        <div className="scene-shade scene-shade--right" aria-hidden="true" />
        <div className="scene-shade scene-shade--floor" aria-hidden="true" />
      </div>
      <main id="main-content" ref={rootRef} className="logistics-story">
        <HeroSection />
        <PortTransferSection />
        <TransitSection />
        <WarehouseSection />
        <AboutSection />
        <Footer />
      </main>
    </>
  );
}
