import type { MetadataRoute } from "next";
import { brand } from "@/config/brand.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.productName,
    short_name: "SMS",
    description: brand.metadata.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#070D0D",
    theme_color: "#070D0D",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
