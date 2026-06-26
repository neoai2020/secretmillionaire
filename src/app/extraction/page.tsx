import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ExtractionPage from "@/features/extraction-workflow/pages/ExtractionPage";

export default function Page() {
  return (
    <FeatureGuard feature="extraction-workflow">
      <ExtractionPage />
    </FeatureGuard>
  );
}
