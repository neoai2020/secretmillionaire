import { FeatureGuard } from "@/components/layout/FeatureGuard";
import WealthProtectorPage from "@/features/premium-protector/pages/WealthProtectorPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-protector">
      <WealthProtectorPage />
    </FeatureGuard>
  );
}
