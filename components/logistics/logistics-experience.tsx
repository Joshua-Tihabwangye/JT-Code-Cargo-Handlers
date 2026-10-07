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
  const progressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useLogisticsTimeline({ rootRef, progressRef, reducedMotion });

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <div className="scene-layer">
        <FrameSequence progressRef={progressRef} reducedMotion={reducedMotion} />
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-grain" aria-hidden="true" />
      </div>
      <div className="journey-rail" aria-hidden="true">
        <span>VESSEL</span>
        <div className="journey-rail__track">
          <i />
        </div>
        <span>SECURE</span>
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
