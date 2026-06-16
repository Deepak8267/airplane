import { notFound } from "next/navigation";
import { ExperienceRenderer } from "@/features/renderer/experience-renderer";
import { getPublicExperienceBySlug } from "@/features/renderer/public-experience-service";

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPublicExperienceBySlug(slug);

  if (!payload) {
    notFound();
  }

  return <ExperienceRenderer payload={payload} />;
}
