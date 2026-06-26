import { FeatureGuard } from "@/components/layout/FeatureGuard";
import ScaleTrainingPage from "@/features/scale-upsell/pages/ScaleTrainingPage";

export default function Page() {
  return (
    <FeatureGuard feature="scale-upsell">
      <ScaleTrainingPage />
    </FeatureGuard>
  );
}
