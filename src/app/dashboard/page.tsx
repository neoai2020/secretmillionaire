import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ConnectDashboardPage from "@/features/extraction-workflow/pages/ConnectDashboardPage";

export default function Page() {
  return (
    <FeatureGuard feature="extraction-workflow">
      <ConnectDashboardPage />
    </FeatureGuard>
  );
}
