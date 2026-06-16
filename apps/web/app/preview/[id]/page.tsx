import { ExperienceRenderer } from "@/features/renderer/experience-renderer";
import { getPreviewExperienceById } from "@/features/renderer/public-experience-service";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await getPreviewExperienceById(id);

  return <ExperienceRenderer payload={payload} preview />;
}
