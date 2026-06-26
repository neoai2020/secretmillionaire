import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ChooseTerritoryPage from "@/features/blog-builder/pages/ChooseTerritoryPage";

export default function Page() {
  return (
    <FeatureGuard feature="blog-builder">
      <ChooseTerritoryPage />
    </FeatureGuard>
  );
}
