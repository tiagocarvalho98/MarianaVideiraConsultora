import type { Metadata } from "next";
import { brand } from "@/config/brand";
import "./globals.css";

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
    <html lang="pt-PT">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
