"use client";

import { useEffect, useState } from "react";
import type { TelemetryDatum } from "./types";

const baseTelemetry: TelemetryDatum[] = [
  { label: "Speed", value: "72 km/h" },
  { label: "Route efficiency", value: "94%" },
  { label: "ETA", value: "14:42 UTC" },
  { label: "Status", value: "In transit", accent: true },
];

export function TelemetryCard() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulse((current) => (current + 1) % 3);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  const data = baseTelemetry.map((datum, index) => {
    if (index === 0) return { ...datum, value: `${72 + pulse} km/h` };
    if (index === 1) return { ...datum, value: `${94 + (pulse % 2)}%` };
    return datum;
  });

  return (
    <div className="instrument" data-reveal>
      <div className="instrument__head">
        <span>JT-08 · East corridor</span>
        <span className="instrument__live" aria-label="Live telemetry active">Live</span>
      </div>
      <div className="route-strip" aria-hidden="true">
        <span className="route-strip__stop">MBA</span>
        <span className="route-strip__line"><i style={{ left: "61%" }} /></span>
        <span className="route-strip__stop">KLA</span>
      </div>
      <dl className="instrument__grid">
        {data.map((datum) => (
          <div key={datum.label}>
            <dt>{datum.label}</dt>
            <dd className={datum.accent ? "is-accent" : ""}>{datum.value}</dd>
          </div>
        ))}
      </dl>
      <p className="instrument__foot">Last position fix 8 s ago</p>
    </div>
  );
}
