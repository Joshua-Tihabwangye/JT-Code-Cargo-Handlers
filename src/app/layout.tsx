import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JT-Code Cargo — Next-Generation Cargo Logistics",
  description:
    "JT-Code Cargo delivers precision cargo handling, smart intermodal tracking and secure warehousing through technology-driven logistics.",
  openGraph: {
    title: "JT-Code Cargo — Next-Generation Cargo Logistics",
    description:
      "Precision cargo handling, smart intermodal tracking and secure warehousing through technology-driven logistics.",
    type: "website",
    siteName: "JT-Code Cargo",
  },
  twitter: {
    card: "summary",
    title: "JT-Code Cargo — Next-Generation Cargo Logistics",
    description:
      "Precision cargo handling, smart intermodal tracking and secure warehousing.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

// Footage and text appear in the same paint: hold the page until the first
// frame and the headline fonts are decoded (cached visits: instant), never
// longer than 0.8 s: past that, a blank page costs more than a font swap.
const firstPaintGate = `(function () {
  var root = document.documentElement;
  var done = function () { root.dataset.ready = "true"; };
  var poster = new Image();
  poster.src = "/frames-webp/frame-0001.webp";
  var fonts = document.fonts
    ? Promise.all([
        document.fonts.load('800 1em "Barlow Condensed"'),
        document.fonts.load('400 1em "IBM Plex Sans"'),
      ])
    : Promise.resolve();
  Promise.all([poster.decode(), fonts]).then(done, done);
  setTimeout(done, 800);
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-ready is set by the inline script below, before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/frames-webp/frame-0001.webp" fetchPriority="high" />
        {/* Fonts are self-hosted (globals.css); fetch the two the first paint waits on early. */}
        <link rel="preload" as="font" type="font/woff2" href="/fonts/barlow-condensed-800-latin.woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/ibm-plex-sans-latin.woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: firstPaintGate }} />
        <noscript>
          <style>{`.site-header,.logistics-story,.scene-layer{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
