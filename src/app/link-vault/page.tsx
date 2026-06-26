import { FeatureGuard } from "@/components/layout/FeatureGuard";
import LinkVaultPage from "@/features/blog-builder/pages/LinkVaultPage";

export default function Page() {
  return (
    <FeatureGuard feature="blog-builder">
      <LinkVaultPage />
    </FeatureGuard>
  );
}
