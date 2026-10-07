"use client";

import { useEffect, useState } from "react";
import { Activity, Navigation, Radio } from "lucide-react";
import { GlassCard } from "./glass-card";
import type { TelemetryDatum } from "./types";

const baseTelemetry: TelemetryDatum[] = [
  { label: "Speed", value: "72 km/h" },
  { label: "Route optimization", value: "94%", accent: true },
  { label: "Estimated arrival", value: "14:42 UTC" },
  { label: "Status", value: "IN TRANSIT", accent: true },
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
    <GlassCard className="telemetry-card" data-reveal>
      <div className="telemetry-card__header">
        <div>
          <span className="section-kicker">JT-08 / East corridor</span>
          <h3>LIVE TRANSIT</h3>
        </div>
        <span className="live-signal" aria-label="Live telemetry active">
          <Radio aria-hidden="true" size={16} /> Live
        </span>
      </div>
      <div className="telemetry-map" aria-hidden="true">
        <span className="telemetry-map__line" />
        <Navigation className="telemetry-map__truck" size={22} />
        <span className="telemetry-map__origin">MBA</span>
        <span className="telemetry-map__destination">KLA</span>
      </div>
      <dl className="telemetry-grid">
        {data.map((datum) => (
          <div key={datum.label}>
            <dt>{datum.label}</dt>
            <dd className={datum.accent ? "is-accent" : ""}>{datum.value}</dd>
          </div>
        ))}
      </dl>
      <div className="telemetry-card__footer">
        <Activity aria-hidden="true" size={16} />
        <span>Encrypted position update received 8 sec ago</span>
      </div>
    </GlassCard>
  );
}
