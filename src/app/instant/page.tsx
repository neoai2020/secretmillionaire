import { FeatureGuard } from "@/components/layout/FeatureGuard";
import InstantPage from "@/features/premium-instant/pages/InstantPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-instant">
      <InstantPage />
    </FeatureGuard>
  );
}
