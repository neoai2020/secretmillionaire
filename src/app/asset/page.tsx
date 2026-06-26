import { FeatureGuard } from "@/components/layout/FeatureGuard";
import AssetCommandPage from "@/features/blog-builder/pages/AssetCommandPage";

export default function Page() {
  return (
    <FeatureGuard feature="blog-builder">
      <AssetCommandPage />
    </FeatureGuard>
  );
}
