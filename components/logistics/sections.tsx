import {
  Activity,
  Anchor,
  Boxes,
  Check,
  CircleDot,
  Fingerprint,
  Gauge,
  LockKeyhole,
  MapPinned,
  Menu,
  RadioTower,
  ScanLine,
  ShieldCheck,
  ShipWheel,
  Sparkles,
  Warehouse as WarehouseIcon,
  Waypoints,
  Zap,
} from "lucide-react";
import { GlassCard } from "./glass-card";
import { TelemetryCard } from "./telemetry-card";
import { TrackingCalculator } from "./tracking-calculator";

const navigation = [
  { href: "#operations", label: "Operations" },
  { href: "#tracking", label: "Tracking" },
  { href: "#warehousing", label: "Warehousing" },
  { href: "#about", label: "About us" },
];

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
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <a className="button button--compact header-cta" href="#estimate">
        Plan a shipment
      </a>
      <details className="mobile-menu">
        <summary aria-label="Open navigation"><Menu aria-hidden="true" size={20} /></summary>
        <div>
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
          <a href="#estimate">Plan a shipment</a>
        </div>
      </details>
    </header>
  );
}

export function HeroSection() {
  return (
    <section className="story-zone hero-zone" id="top" aria-labelledby="hero-title">
      <div className="zone-copy hero-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <span className="signal-line" /> Global cargo, one connected journey
        </div>
        <h1 id="hero-title" data-reveal>
          From open water to <em>final handoff.</em>
        </h1>
        <p className="hero-lede" data-reveal>
          Port operations, live tracking and secure warehousing—coordinated through one
          accountable cargo system.
        </p>
        <div className="hero-actions" data-reveal>
          <a className="button button--primary" href="#estimate">Plan a shipment</a>
          <a className="text-link" href="#operations">Explore the journey</a>
        </div>
        <div className="hero-signals" data-reveal aria-label="Service highlights">
          <span><RadioTower aria-hidden="true" size={17} /> Live visibility</span>
          <span><ShieldCheck aria-hidden="true" size={17} /> Verified handling</span>
          <span><Waypoints aria-hidden="true" size={17} /> Connected handoffs</span>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll to move cargo</span><i />
      </div>
      <div className="zone-id" aria-hidden="true">00 / ARRIVAL</div>
    </section>
  );
}

const operationCards = [
  {
    icon: Gauge,
    title: "Coordinated offloading",
    copy: "Vessel slots, crane movements and ground crews stay aligned through one operating view.",
  },
  {
    icon: ShipWheel,
    title: "Port flow control",
    copy: "Cargo moves from quay to assigned transport with clear milestones and fewer blind handoffs.",
  },
  {
    icon: Zap,
    title: "Exception response",
    copy: "Operational alerts surface delays early so teams can respond before the route is disrupted.",
  },
];

export function PortTransferSection() {
  return (
    <section className="story-zone operations-zone" id="operations" aria-labelledby="operations-title">
      <div className="zone-copy operations-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <Anchor aria-hidden="true" size={15} /> Operations / Port intelligence
        </div>
        <h2 id="operations-title" data-reveal>
          Every lift, <em>orchestrated.</em>
        </h2>
        <p className="section-intro" data-reveal>
          We connect the ship, crane, yard and truck into a single operational sequence from
          berth arrival to gate release.
        </p>
        <div className="operation-cards">
          {operationCards.map(({ icon: Icon, title, copy }, index) => (
            <GlassCard key={title} className="operation-card" data-reveal>
              <span className="card-index">0{index + 1}</span>
              <span className="icon-frame"><Icon aria-hidden="true" size={20} /></span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </GlassCard>
          ))}
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">01 / OPERATIONS</div>
    </section>
  );
}

export function TransitSection() {
  return (
    <section className="story-zone tracking-zone" id="tracking" aria-labelledby="tracking-title">
      <div className="zone-copy tracking-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <MapPinned aria-hidden="true" size={15} /> Tracking / Connected corridor
        </div>
        <h2 id="tracking-title" data-reveal>
          Visibility that <em>moves with cargo.</em>
        </h2>
        <p className="section-intro" data-reveal>
          Position, condition and custody signals turn every kilometre into a traceable event.
        </p>
        <TelemetryCard />
        <div className="tracking-proof" data-reveal>
          <div><Fingerprint aria-hidden="true" size={19} /><span><strong>Chain of custody</strong>Validated at each handoff</span></div>
          <div><Activity aria-hidden="true" size={19} /><span><strong>Exception monitoring</strong>Signals reviewed in context</span></div>
        </div>
      </div>
      <div className="zone-id" aria-hidden="true">02 / TRACKING</div>
    </section>
  );
}

const capabilities = [
  { icon: ShieldCheck, label: "Secure cargo handling" },
  { icon: Boxes, label: "Inventory visibility" },
  { icon: ScanLine, label: "Scan-led processing" },
  { icon: LockKeyhole, label: "Controlled access" },
  { icon: Waypoints, label: "End-to-end traceability" },
];

export function WarehouseSection() {
  return (
    <section className="story-zone warehouse-zone" id="warehousing" aria-labelledby="warehouse-title">
      <div className="zone-copy warehouse-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <WarehouseIcon aria-hidden="true" size={15} /> Warehousing / Secure processing
        </div>
        <div className="warehouse-heading-row">
          <div>
            <h2 id="warehouse-title" data-reveal>
              Received. Verified. <em>Ready.</em>
            </h2>
            <p className="section-intro" data-reveal>
              The final approach becomes a controlled warehouse workflow—from dock assignment
              and scan validation to inventory-ready handover.
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
              <span className="capability-icon"><Icon aria-hidden="true" size={18} /></span>
              <span>{label}</span>
              <Check aria-hidden="true" className="capability-check" size={16} />
            </div>
          ))}
        </div>
        <div id="estimate" className="estimate-anchor"><TrackingCalculator /></div>
      </div>
      <div className="zone-id" aria-hidden="true">03 / WAREHOUSING</div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="story-zone about-zone" id="about" aria-labelledby="about-title">
      <div className="zone-copy about-copy" data-zone-copy>
        <div className="section-kicker" data-reveal>
          <Sparkles aria-hidden="true" size={15} /> About us / One standard throughout
        </div>
        <GlassCard className="about-panel" data-reveal>
          <div className="about-panel__lead">
            <h2 id="about-title">Cargo is physical. <em>Clarity is digital.</em></h2>
            <p>
              JT-Code Cargo is built around a simple operating principle: every movement should
              be visible, every handoff accountable, and every arrival prepared for what comes next.
            </p>
          </div>
          <div className="about-values" aria-label="Our operating principles">
            <div><CircleDot aria-hidden="true" size={18} /><span><strong>See the journey</strong>Shared milestones from port to warehouse</span></div>
            <div><ShieldCheck aria-hidden="true" size={18} /><span><strong>Protect the handoff</strong>Clear custody at every transfer</span></div>
            <div><Waypoints aria-hidden="true" size={18} /><span><strong>Coordinate the next move</strong>Operations planned as one connected route</span></div>
          </div>
        </GlassCard>
      </div>
      <div className="zone-id" aria-hidden="true">04 / ABOUT US</div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <div className="brand brand--footer">
          <BrandMark />
          <span className="brand__text"><strong>JT-CODE</strong><small>CARGO SYSTEMS</small></span>
        </div>
        <div>
          <span className="section-kicker">Your cargo. One clear route.</span>
          <h2>Ready to move with confidence?</h2>
        </div>
        <a className="button button--primary" href="#estimate">Plan a shipment</a>
      </div>
      <div className="footer-grid">
        <div>
          <span>Journey</span>
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <div>
          <span>Network desk</span>
          <p>Port-to-warehouse coordination</p>
          <p>Route planning and shipment visibility</p>
        </div>
        <div>
          <span>Operations status</span>
          <p className="footer-online"><i /> Cargo systems online</p>
          <p>Secure planning environment</p>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 JT-Code Cargo</span>
        <a href="#top">Return to start</a>
      </div>
    </footer>
  );
}
