import { FeatureGuard } from "@/components/layout/FeatureGuard";
import SocialPayoutsPage from "@/features/premium-social/pages/SocialPayoutsPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-social">
      <SocialPayoutsPage />
    </FeatureGuard>
  );
}
