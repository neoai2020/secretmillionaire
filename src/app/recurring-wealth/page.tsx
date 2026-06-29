import { FeatureGuard } from "@/components/layout/FeatureGuard";
import RecurringWealthPage from "@/features/premium-recurring/pages/RecurringWealthPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-recurring">
      <RecurringWealthPage />
    </FeatureGuard>
  );
}
