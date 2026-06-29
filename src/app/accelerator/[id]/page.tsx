import { FeatureGuard } from "@/components/layout/FeatureGuard";
import AcceleratorPreviewPage from "@/features/premium-accelerator/pages/AcceleratorPreviewPage";

type RouteParams = { params: Promise<{ id: string }> };

export default async function Page({ params }: RouteParams) {
  const { id } = await params;
  return (
    <FeatureGuard feature="premium-accelerator">
      <AcceleratorPreviewPage id={Number(id)} />
    </FeatureGuard>
  );
}
