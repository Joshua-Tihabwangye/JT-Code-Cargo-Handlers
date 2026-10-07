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
  { href: "#operations", label: "Operations", key: "operations" },
  { href: "#tracking", label: "Tracking", key: "tracking" },
  { href: "#warehousing", label: "Warehousing", key: "warehousing" },
  { href: "#about", label: "About us", key: "about" },
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
          <a key={item.href} data-section={item.key} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <a className="button button--compact header-cta" href="#estimate">Plan a shipment</a>
      <details className="mobile-menu">
        <summary aria-label="Open navigation"><Menu aria-hidden="true" size={21} /></summary>
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
        <div className="hero-heading-block" data-reveal>
          <div className="section-kicker"><span className="signal-line" /> Port to warehouse</div>
          <h1 id="hero-title">Cargo in motion.<br /><em>Clarity at every mile.</em></h1>
        </div>
        <GlassCard className="hero-detail-card" data-reveal>
          <span className="eyebrow">One connected logistics system</span>
          <p>
            JT-Code Cargo coordinates port operations, live road visibility and secure
            warehousing as one continuous, accountable journey.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#estimate">Plan a shipment</a>
            <a className="button button--ghost" href="#operations">Explore operations</a>
          </div>
          <div className="hero-signals" aria-label="Service highlights">
            <span><RadioTower aria-hidden="true" size={17} /> Live visibility</span>
            <span><ShieldCheck aria-hidden="true" size={17} /> Verified custody</span>
            <span><Waypoints aria-hidden="true" size={17} /> Connected handoffs</span>
          </div>
        </GlassCard>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span>Scroll to move cargo</span><i /></div>
      <div className="zone-id" aria-hidden="true">00 / DEPARTURE</div>
    </section>
  );
}

const operationCards = [
  {
    icon: Gauge,
    title: "Orchestrated offloading",
    copy: "Vessel slots, crane movements and ground crews work from one coordinated sequence.",
  },
  {
    icon: ShipWheel,
    title: "Controlled port flow",
    copy: "Every container advances through a defined milestone from berth to assigned transport.",
  },
  {
    icon: Zap,
    title: "Faster exception response",
    copy: "Teams see delays and handling issues early enough to protect the next movement.",
  },
];

export function PortTransferSection() {
  return (
    <section
      className="story-zone operations-zone"
      id="operations"
      data-chapter="operations"
      aria-labelledby="operations-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--left" data-zone-copy>
        <GlassCard className="chapter-panel">
          <div className="chapter-heading" data-reveal>
            <span className="chapter-number">01</span>
            <div>
              <div className="section-kicker"><Anchor aria-hidden="true" size={15} /> Operations</div>
              <h2 id="operations-title">Every lift has a <em>next move.</em></h2>
              <p className="section-intro">
                Cargo moves faster when the ship, quay, yard and truck share the same operational picture.
              </p>
            </div>
          </div>
          <div className="operation-cards">
            {operationCards.map(({ icon: Icon, title, copy }, index) => (
              <div key={title} className="operation-card" data-reveal>
                <span className="icon-frame"><Icon aria-hidden="true" size={19} /></span>
                <div><span className="card-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <div className="zone-id" aria-hidden="true">01 / OPERATIONS</div>
    </section>
  );
}

export function TransitSection() {
  return (
    <section
      className="story-zone tracking-zone"
      id="tracking"
      data-chapter="tracking"
      aria-labelledby="tracking-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--right" data-zone-copy>
        <GlassCard className="chapter-panel tracking-panel">
          <div className="chapter-heading" data-reveal>
            <span className="chapter-number">02</span>
            <div>
              <div className="section-kicker"><MapPinned aria-hidden="true" size={15} /> Tracking</div>
              <h2 id="tracking-title">Know where it is. <em>Know what is next.</em></h2>
              <p className="section-intro">
                Position, route and custody signals turn movement into a clear, traceable story.
              </p>
            </div>
          </div>
          <TelemetryCard />
          <div className="tracking-proof" data-reveal>
            <div><Fingerprint aria-hidden="true" size={19} /><span><strong>Chain of custody</strong>Validated at each handoff</span></div>
            <div><Activity aria-hidden="true" size={19} /><span><strong>Exception awareness</strong>Issues seen in route context</span></div>
          </div>
        </GlassCard>
      </div>
      <div className="zone-id" aria-hidden="true">02 / TRACKING</div>
    </section>
  );
}

const capabilities = [
  { icon: ShieldCheck, label: "Secure handling" },
  { icon: Boxes, label: "Inventory visibility" },
  { icon: ScanLine, label: "Scan-led receiving" },
  { icon: LockKeyhole, label: "Controlled access" },
  { icon: Waypoints, label: "End-to-end traceability" },
];

export function WarehouseSection() {
  return (
    <section
      className="story-zone warehouse-zone"
      id="warehousing"
      data-chapter="warehousing"
      aria-labelledby="warehouse-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--left chapter-copy--wide" data-zone-copy>
        <GlassCard className="chapter-panel warehouse-panel">
          <div className="warehouse-heading-row" data-reveal>
            <div className="chapter-heading">
              <span className="chapter-number">03</span>
              <div>
                <div className="section-kicker"><WarehouseIcon aria-hidden="true" size={15} /> Warehousing</div>
                <h2 id="warehouse-title">Received with proof. <em>Released with confidence.</em></h2>
                <p className="section-intro">
                  Dock assignment, scan validation and inventory handover become one controlled workflow.
                </p>
              </div>
            </div>
            <div className="processing-badge"><span className="processing-badge__beam" /><ScanLine aria-hidden="true" size={18} /> PROCESSING SECURE</div>
          </div>
          <div className="capability-grid" data-reveal>
            {capabilities.map(({ icon: Icon, label }) => (
              <div key={label}>
                <span className="capability-icon"><Icon aria-hidden="true" size={18} /></span>
                <span>{label}</span>
                <Check aria-hidden="true" className="capability-check" size={15} />
              </div>
            ))}
          </div>
          <div id="estimate" className="estimate-anchor"><TrackingCalculator /></div>
        </GlassCard>
      </div>
      <div className="zone-id" aria-hidden="true">03 / WAREHOUSING</div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section
      className="story-zone about-zone"
      id="about"
      data-chapter="about"
      aria-labelledby="about-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--right about-copy" data-zone-copy>
        <GlassCard className="chapter-panel about-panel">
          <div className="about-panel__lead" data-reveal>
            <span className="chapter-number">04</span>
            <div className="section-kicker"><Sparkles aria-hidden="true" size={15} /> About us</div>
            <h2 id="about-title">Physical cargo. <em>Digital clarity.</em></h2>
            <p>
              JT-Code Cargo is designed around one standard: every movement visible, every
              handoff accountable, and every arrival ready for what comes next.
            </p>
          </div>
          <div className="about-values" aria-label="Our operating principles" data-reveal>
            <div><CircleDot aria-hidden="true" size={18} /><span><strong>See the whole journey</strong>Shared milestones from port to warehouse</span></div>
            <div><ShieldCheck aria-hidden="true" size={18} /><span><strong>Protect every transfer</strong>Clear custody across operational teams</span></div>
            <div><Waypoints aria-hidden="true" size={18} /><span><strong>Prepare the next move</strong>Decisions made with route context</span></div>
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
        <div className="brand brand--footer"><BrandMark /><span className="brand__text"><strong>JT-CODE</strong><small>CARGO SYSTEMS</small></span></div>
        <div><span className="section-kicker">Your cargo. One clear route.</span><h2>Move with complete operational clarity.</h2></div>
        <a className="button button--primary" href="#estimate">Plan a shipment</a>
      </div>
      <div className="footer-grid">
        <div><span>Journey</span>{navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
        <div><span>Network desk</span><p>Port-to-warehouse coordination</p><p>Route planning and shipment visibility</p></div>
        <div><span>Operations status</span><p className="footer-online"><i /> Cargo systems online</p><p>Secure planning environment</p></div>
      </div>
      <div className="footer-base"><span>© 2026 JT-Code Cargo</span><a href="#top">Return to start</a></div>
    </footer>
  );
}
