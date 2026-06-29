import { FeatureGuard } from "@/components/layout/FeatureGuard";
import AcceleratorPage from "@/features/premium-accelerator/pages/AcceleratorPage";

export default function Page() {
  return (
    <FeatureGuard feature="premium-accelerator">
      <AcceleratorPage />
    </FeatureGuard>
  );
}
