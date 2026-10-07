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
// longer than 1.5 s.
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
  setTimeout(done, 1500);
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: firstPaintGate }} />
        <noscript>
          <style>{`.site-header,.logistics-story,.scene-layer{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
