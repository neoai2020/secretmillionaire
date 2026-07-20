import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/config/brand.config";
import { AppProviders } from "@/components/layout/AppProviders";

export const metadata: Metadata = {
  title: brand.metadata.title,
  description: brand.metadata.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: brand.productName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-text-primary selection:bg-accent/30 antialiased min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
