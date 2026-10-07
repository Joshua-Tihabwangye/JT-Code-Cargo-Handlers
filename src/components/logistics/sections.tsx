import { Fragment } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Menu } from "lucide-react";
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
      JT
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="JT-Code Cargo home">
        <BrandMark />
        <span className="brand__text">
          <strong>JT-Code</strong>
          <small>Cargo Systems</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => (
          <a key={item.href} data-section={item.key} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="button button--solid header-cta" href="#estimate">
        Plan a shipment <ArrowRight aria-hidden="true" size={16} />
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

/**
 * Headlines speak in three voices, always in this order of emphasis:
 * white fill, orange fill, then orange contour with no fill.
 */
type Tone = "white" | "orange" | "outline";
type HeadlineLine = Array<[text: string, tone: Tone]>;

function Headline({
  as: Tag = "h2",
  id,
  lines,
  className = "",
  reveal = true,
}: {
  as?: "h1" | "h2";
  id?: string;
  lines: HeadlineLine[];
  className?: string;
  reveal?: boolean;
}) {
  return (
    <Tag id={id} className={`headline ${className}`} data-reveal={reveal ? "" : undefined}>
      {lines.map((segments, lineIndex) => (
        <span key={lineIndex} className="headline__line">
          {segments.map(([text, tone], index) => (
            <Fragment key={text}>
              {index > 0 ? " " : null}
              <span className={`tone-${tone}`}>{text}</span>
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}

function ChapterTag({ name, note }: { name: string; note: string }) {
  return (
    <div className="chapter-tag" data-reveal>
      <span className="chapter-tag__name">{name}</span>
      <span className="chapter-tag__note">{note}</span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="story-zone hero-zone"
      id="top"
      data-frame="0"
      data-chapter="top"
      data-side="left"
      aria-labelledby="hero-title"
    >
      <div className="zone-copy hero-copy" data-zone-copy>
        <div className="hero-lead">
          <p className="hero-route">
            <span>Port</span><i /><span>Road</span><i /><span>Warehouse</span>
          </p>
          <Headline
            as="h1"
            id="hero-title"
            className="headline--hero"
            reveal={false}
            lines={[[["Cargo in motion.", "white"]], [["Clarity at", "orange"]], [["every mile.", "outline"]]]}
          />
        </div>
        <div className="hero-body">
          <p className="hero-aside">One connected logistics system.</p>
          <p className="ruled-text">
            JT-Code Cargo coordinates port operations, live road visibility and secure
            warehousing as one continuous, accountable journey.
          </p>
          <div className="hero-actions">
            <a className="button button--solid" href="#estimate">
              Plan a shipment <ArrowRight aria-hidden="true" size={16} />
            </a>
            <a className="text-link" href="#operations">
              Explore operations <ArrowDown aria-hidden="true" size={15} />
            </a>
          </div>
          <ul className="hero-signals" aria-label="Service highlights">
            <li>Live visibility</li>
            <li>Verified custody</li>
            <li>Connected handoffs</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const operations = [
  {
    title: "Orchestrated offloading",
    copy:
      "Vessel slots, crane cycles and ground crews work from one berth plan. Containers come off the ship in the order the yard and trucks need them, so cranes don't sit idle and boxes aren't moved twice.",
  },
  {
    title: "Controlled port flow",
    copy:
      "Every container passes through set milestones — discharge, yard, customs, gate-out — and each one is confirmed by a scan. Nobody has to guess where a box is, and trucks are booked only for cargo that is actually ready.",
  },
  {
    title: "Faster exception response",
    copy:
      "Customs holds, broken seals and missed gate slots raise an alert the moment they're logged. Teams still have time to rebook a truck or re-sequence a lift instead of finding the problem at the gate.",
  },
];

export function PortTransferSection() {
  return (
    <section
      className="story-zone operations-zone"
      id="operations"
      data-frame="38"
      data-chapter="operations"
      data-side="left"
      aria-labelledby="operations-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--left" data-zone-copy>
        <ChapterTag name="Operations" note="Berth · Quay · Yard" />
        <Headline
          id="operations-title"
          lines={[[["Every lift has", "white"]], [["a next", "orange"], ["move.", "outline"]]]}
        />
        <p className="lede" data-reveal>
          Cargo moves faster when the ship, quay, yard and truck share the same operational picture.
        </p>
        <ol className="operations-list">
          {operations.map(({ title, copy }, index) => (
            <li key={title} data-reveal>
              <span className="operations-list__no">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TransitSection() {
  return (
    <section
      className="story-zone tracking-zone"
      id="tracking"
      data-frame="109"
      data-chapter="tracking"
      data-side="right"
      aria-labelledby="tracking-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--right" data-zone-copy>
        <ChapterTag name="Tracking" note="Mombasa → Kampala" />
        <Headline
          id="tracking-title"
          lines={[[["Know where it is.", "white"]], [["Know what’s", "orange"], ["next.", "outline"]]]}
        />
        <p className="lede" data-reveal>
          Position, route and custody signals turn every movement into a clear, traceable story.
        </p>
        <TelemetryCard />
        <dl className="proof-points" data-reveal>
          <div>
            <dt>Chain of custody</dt>
            <dd>Validated by scan at every handoff, from the quay to the dock door.</dd>
          </div>
          <div>
            <dt>Exception awareness</dt>
            <dd>Delays and stops show up on the route, with the context to act on them.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

const capabilities = [
  "Secure handling",
  "Inventory visibility",
  "Scan-led receiving",
  "Controlled access",
  "End-to-end traceability",
];

export function WarehouseSection() {
  return (
    <section
      className="story-zone warehouse-zone"
      id="warehousing"
      data-frame="173"
      data-chapter="warehousing"
      data-side="left"
      aria-labelledby="warehouse-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--wide warehouse-copy" data-zone-copy>
        <div className="warehouse-copy__text">
          <ChapterTag name="Warehousing" note="Dock · Scan · Store" />
          <Headline
            id="warehouse-title"
            lines={[[["Received with proof.", "white"]], [["Released with", "orange"], ["confidence.", "outline"]]]}
          />
          <p className="lede" data-reveal>
            Dock assignment, scan validation and inventory handover run as one controlled workflow.
          </p>
          <ul className="capability-list" data-reveal>
            {capabilities.map((label) => <li key={label}>{label}</li>)}
          </ul>
        </div>
        <div id="estimate" className="estimate-anchor" data-reveal>
          <TrackingCalculator />
        </div>
      </div>
    </section>
  );
}

const principles = [
  { title: "See the whole journey", copy: "Shared milestones from port to warehouse." },
  { title: "Protect every transfer", copy: "Clear custody across every operational team." },
  { title: "Prepare the next move", copy: "Decisions made with the route in view." },
];

export function AboutSection() {
  return (
    <section
      className="story-zone about-zone"
      id="about"
      data-frame="230"
      data-chapter="about"
      data-side="right"
      aria-labelledby="about-title"
    >
      <div className="zone-copy chapter-copy chapter-copy--right about-copy" data-zone-copy>
        <ChapterTag name="About us" note="How we work" />
        <Headline
          id="about-title"
          lines={[[["Physical cargo.", "white"]], [["Digital", "orange"], ["clarity.", "outline"]]]}
        />
        <blockquote className="about-quote" data-reveal>
          <p>
            One standard: every movement visible, every handoff accountable, and every
            arrival ready for what comes next.
          </p>
        </blockquote>
        <ol className="principles" data-reveal>
          {principles.map(({ title, copy }) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{copy}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <Headline
          reveal={false}
          lines={[[["Move with complete", "white"]], [["operational", "orange"], ["clarity.", "outline"]]]}
        />
        <a className="button button--solid" href="#estimate">
          Plan a shipment <ArrowRight aria-hidden="true" size={16} />
        </a>
      </div>
      <div className="footer-grid">
        <div className="brand brand--footer">
          <BrandMark />
          <span className="brand__text"><strong>JT-Code</strong><small>Cargo Systems</small></span>
        </div>
        <div>
          <h3>Journey</h3>
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </div>
        <div>
          <h3>Network desk</h3>
          <p>Port-to-warehouse coordination</p>
          <p>Route planning and shipment visibility</p>
        </div>
        <div>
          <h3>Status</h3>
          <p className="footer-online"><i /> Cargo systems online</p>
          <p>Secure planning environment</p>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 JT-Code Cargo</span>
        <a href="#top">Back to the start <ArrowUpRight aria-hidden="true" size={14} /></a>
      </div>
    </footer>
  );
}
