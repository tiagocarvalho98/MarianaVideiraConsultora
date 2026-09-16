import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${brand.fullName} | ${brand.role}`,
    template: `%s | ${brand.fullName}`,
  },
  description: brand.tagline,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${brand.fullName} | ${brand.role}`,
    description: brand.tagline,
    type: "website",
    locale: "pt_PT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${sans.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
