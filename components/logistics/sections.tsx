import {
  Anchor,
  Boxes,
  Check,
  Fingerprint,
  Gauge,
  LockKeyhole,
  MapPinned,
  RadioTower,
  ScanLine,
  ShieldCheck,
  ShipWheel,
  Warehouse as WarehouseIcon,
  Waypoints,
  Zap,
} from "lucide-react";
import { GlassCard } from "./glass-card";
import { TelemetryCard } from "./telemetry-card";
import { TrackingCalculator } from "./tracking-calculator";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span>JT</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="JT-Code Cargo home">
        <BrandMark />
        <span className="brand__text">
          <strong>JT-CODE</strong>
          <small>CARGO SYSTEMS</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#offloading">Operations</a>
        <a href="#transit">Tracking</a>
        <a href="#warehouse">Warehousing</a>
      </nav>
      <a className="button button--compact" href="#estimate">
        Get a quote
      </a>
    </header>
  );
}

export function HeroSection() {
  return (
    <section className="story-zone hero-zone" id="top" aria-labelledby="hero-title">
      <div className="zone-copy hero-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <span className="signal-line" /> Global cargo command
        </div>
        <h1 id="hero-title" data-reveal>
          Next-Gen Cargo Logistics, <em>Engineered.</em>
        </h1>
        <p className="hero-lede" data-reveal>
          JT-Code Cargo bridges continents with automated precision handling and real-time
          execution tracking.
        </p>
        <div className="hero-actions" data-reveal>
          <a className="button button--primary" href="#estimate">
            Get a quote
          </a>
          <span className="route-status">
            <span className="status-beacon" /> Network operational
          </span>
        </div>
        <div className="hero-stats" data-reveal>
          <div className="hero-stat hero-stat--primary">
            <strong>99.9%</strong>
            <span>On-time completion</span>
          </div>
          <div className="hero-stat">
            <RadioTower aria-hidden="true" size={18} />
            <span>Real-time tracking</span>
          </div>
          <div className="hero-stat">
            <ShieldCheck aria-hidden="true" size={18} />
            <span>Secure handling</span>
          </div>
          <div className="hero-stat">
            <Waypoints aria-hidden="true" size={18} />
            <span>Global logistics</span>
          </div>
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">
        01 / MARITIME
      </div>
    </section>
  );
}

const offloadingCards = [
  {
    icon: Gauge,
    title: "Automated Cranes",
    copy: "Digitally coordinated lifting and transfer operations reduce handling delays and improve cargo flow.",
  },
  {
    icon: ShipWheel,
    title: "Vessel Optimization",
    copy: "Intelligent sequencing helps coordinate vessel unloading and downstream transportation.",
  },
  {
    icon: Zap,
    title: "Instant Clearing",
    copy: "Connected operational workflows provide faster visibility from arrival through transfer.",
  },
];

export function PortTransferSection() {
  return (
    <section className="story-zone offloading-zone" id="offloading" aria-labelledby="offloading-title">
      <div className="zone-copy offloading-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <Anchor aria-hidden="true" size={15} /> Port intelligence / Stage 02
        </div>
        <h2 id="offloading-title" data-reveal>
          Precision Maritime <em>Offloading</em>
        </h2>
        <p className="section-intro" data-reveal>
          Every lift is sequenced from vessel slot to waiting chassis—one connected transfer,
          zero blind handoffs.
        </p>
        <div className="offloading-cards">
          {offloadingCards.map(({ icon: Icon, title, copy }) => (
            <GlassCard key={title} className="operation-card" data-reveal>
              <span className="icon-frame">
                <Icon aria-hidden="true" size={20} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">
        02 / PORT TRANSFER
      </div>
    </section>
  );
}

export function TransitSection() {
  return (
    <section className="story-zone transit-zone" id="transit" aria-labelledby="transit-title">
      <div className="zone-copy transit-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <MapPinned aria-hidden="true" size={15} /> Intermodal corridor / Stage 03
        </div>
        <h2 id="transit-title" data-reveal>
          Intermodal Smart <em>Tracking</em>
        </h2>
        <p className="section-intro" data-reveal>
          Route telemetry turns every movement into an accountable event—from port gate to
          final approach.
        </p>
        <TelemetryCard />
        <div className="transit-proof" data-reveal>
          <div>
            <Fingerprint aria-hidden="true" size={18} />
            <span>
              <strong>Chain of custody</strong>
              Signed at every handoff
            </span>
          </div>
          <div>
            <RadioTower aria-hidden="true" size={18} />
            <span>
              <strong>Telemetry link</strong>
              Continuous exception monitoring
            </span>
          </div>
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">
        03 / SMART TRANSIT
      </div>
    </section>
  );
}

const capabilities = [
  { icon: ShieldCheck, label: "Secure cargo handling" },
  { icon: Boxes, label: "Real-time inventory visibility" },
  { icon: ScanLine, label: "Automated processing" },
  { icon: LockKeyhole, label: "Controlled warehouse access" },
  { icon: Waypoints, label: "End-to-end shipment traceability" },
];

export function WarehouseSection() {
  return (
    <section className="story-zone warehouse-zone" id="warehouse" aria-labelledby="warehouse-title">
      <div className="zone-copy warehouse-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <WarehouseIcon aria-hidden="true" size={15} /> Fulfilment control / Stage 04
        </div>
        <div className="warehouse-heading-row">
          <div>
            <h2 id="warehouse-title" data-reveal>
              Secure Warehousing <em>& Fulfilment</em>
            </h2>
            <p className="section-intro" data-reveal>
              Arrival triggers a verified processing chain—controlled access, scan validation,
              and inventory-ready handover.
            </p>
          </div>
          <div className="processing-badge" data-reveal>
            <span className="processing-badge__beam" />
            <ScanLine aria-hidden="true" size={18} /> SECURE PROCESSING
          </div>
        </div>

        <div className="capability-grid" data-reveal>
          {capabilities.map(({ icon: Icon, label }) => (
            <div key={label}>
              <span className="capability-icon">
                <Icon aria-hidden="true" size={18} />
              </span>
              <span>{label}</span>
              <Check aria-hidden="true" className="capability-check" size={16} />
            </div>
          ))}
        </div>
        <div id="estimate" className="estimate-anchor">
          <TrackingCalculator />
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">
        04 / SECURE PROCESSING
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <div className="brand brand--footer">
          <BrandMark />
          <span className="brand__text">
            <strong>JT-CODE</strong>
            <small>CARGO SYSTEMS</small>
          </span>
        </div>
        <h2>Move cargo with complete operational clarity.</h2>
        <a className="button button--primary" href="#estimate">
          Plan a shipment
        </a>
      </div>
      <div className="footer-grid">
        <div>
          <span>Operations</span>
          <a href="#offloading">Maritime offloading</a>
          <a href="#transit">Smart transit</a>
          <a href="#warehouse">Warehousing</a>
        </div>
        <div>
          <span>Network desk</span>
          <p>24/7 cargo coordination</p>
          <p>Operations shown in UTC</p>
        </div>
        <div>
          <span>System</span>
          <p className="footer-online"><i /> All routes monitored</p>
          <p>Secure planning environment</p>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 JT-Code Cargo</span>
        <span>Precision across every handoff.</span>
      </div>
    </footer>
  );
}
