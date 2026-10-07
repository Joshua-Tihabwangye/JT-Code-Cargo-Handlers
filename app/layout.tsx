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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
