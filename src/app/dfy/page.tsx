import { FeatureGuard } from "@/components/layout/FeatureGuard";
import DfyPage from "@/features/premium-dfy/pages/DfyPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-dfy">
      <DfyPage />
    </FeatureGuard>
  );
}
