import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/config/brand.config";
import { AppProviders } from "@/components/layout/AppProviders";

export const metadata: Metadata = {
  title: brand.metadata.title,
  description: brand.metadata.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="text-white selection:bg-accent/30 antialiased"
        style={{ backgroundColor: brand.colors.page }}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
