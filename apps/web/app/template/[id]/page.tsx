import Link from "next/link";
import { templateFixtures } from "@/features/templates/template-fixtures";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = templateFixtures.find((item) => item.slug === id || item.id === id) ?? getFallbackTemplate();

  return (
    <main className="min-h-dvh px-5 py-8" style={{ background: template.defaultTheme.background, color: template.defaultTheme.foreground }}>
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col justify-center gap-5">
        <p className="text-sm font-black uppercase" style={{ color: template.defaultTheme.accent }}>
          {template.category}
        </p>
        <h1 className="text-5xl font-black leading-tight tracking-normal">{template.name}</h1>
        <p className="text-lg leading-8">{template.description}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {template.defaultPages.map((page, index) => (
            <div key={`${page.pageType}-${index}`} className="rounded-lg border border-black/10 bg-white/70 p-4">
              <p className="text-xs font-black uppercase opacity-70">{page.pageType}</p>
              <p className="mt-2 font-black">{page.title}</p>
            </div>
          ))}
        </div>
        <Link href="/e/DEMO01" className="w-fit rounded-lg px-5 py-3 font-black text-white" style={{ background: template.defaultTheme.accent }}>
          Open renderer demo
        </Link>
      </section>
    </main>
  );
}

function getFallbackTemplate() {
  const template = templateFixtures[0];

  if (!template) {
    throw new Error("Template fixtures are empty.");
  }

  return template;
}
