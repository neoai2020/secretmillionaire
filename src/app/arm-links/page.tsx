import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ArmLinksPage from "@/features/blog-builder/pages/ArmLinksPage";

export default function Page() {
  return (
    <FeatureGuard feature="blog-builder">
      <ArmLinksPage />
    </FeatureGuard>
  );
}
