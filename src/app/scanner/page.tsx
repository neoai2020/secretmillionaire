import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ScannerPage from "@/features/extraction-workflow/pages/ScannerPage";

export default function Page() {
  return (
    <FeatureGuard feature="extraction-workflow">
      <ScannerPage />
    </FeatureGuard>
  );
}
