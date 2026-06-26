import { FeatureGuard } from "@/components/layout/FeatureGuard";
import TrainingPage from "@/features/training/pages/TrainingPage";

export default function Page() {
  return (
    <FeatureGuard feature="training">
      <TrainingPage />
    </FeatureGuard>
  );
}
