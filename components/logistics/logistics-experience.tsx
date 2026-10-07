"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Footer,
  HeroSection,
  PortTransferSection,
  SiteHeader,
  TransitSection,
  WarehouseSection,
} from "./sections";
import { useLogisticsTimeline } from "./use-logistics-timeline";

const CargoScene = dynamic(
  () => import("./cargo-scene").then((module) => module.CargoScene),
  {
    ssr: false,
    loading: () => <div className="scene-loading" aria-hidden="true" />,
  },
);

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
        <CargoScene progressRef={progressRef} reducedMotion={reducedMotion} />
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
        <Footer />
      </main>
    </>
  );
}
