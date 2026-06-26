import { FeatureGuard } from "@/components/layout/FeatureGuard";
import DeployAssetPage from "@/features/blog-builder/pages/DeployAssetPage";

export default function Page() {
  return (
    <FeatureGuard feature="blog-builder">
      <DeployAssetPage />
    </FeatureGuard>
  );
}
