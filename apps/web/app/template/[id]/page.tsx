import Link from "next/link";
import { templateFixtures } from "@/features/templates/template-fixtures";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = templateFixtures.find((item) => item.slug === id || item.id === id) ?? getFallbackTemplate();

  return (
    <main className="min-h-dvh px-4 py-5 sm:px-6" style={{ background: template.defaultTheme.background, color: template.defaultTheme.foreground }}>
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl items-center gap-8 py-8 lg:grid-cols-[1fr_430px]">
        <div className="max-w-2xl">
          <Link className="mb-8 inline-flex h-10 items-center rounded-full border border-current/10 bg-white/70 px-4 text-sm font-black shadow-sm shadow-black/5" href="/">
            AIRPLANE
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: template.defaultTheme.accent }}>
            {template.category} template
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-black leading-tight tracking-normal sm:text-6xl">{template.name}</h1>
            {template.isPremium ? (
              <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: template.defaultTheme.accent }}>
                Premium
              </span>
            ) : null}
          </div>
          <p className="mt-5 max-w-xl text-lg leading-8 opacity-75">{template.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex h-12 items-center rounded-2xl px-5 font-black text-white shadow-lg shadow-black/10" href="/e/DEMO01" style={{ background: template.defaultTheme.accent }}>
              Open renderer demo
            </Link>
            <Link className="inline-flex h-12 items-center rounded-2xl border border-current/10 bg-white/70 px-5 font-black" href="/">
              Back home
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-black/10 backdrop-blur">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] opacity-55">Flow pages</p>
            <h2 className="mt-1 text-2xl font-black">Recipient journey</h2>
          </div>
          <div className="grid gap-3">
            {template.defaultPages.map((page, index) => (
              <div key={`${page.pageType}-${index}`} className="flex gap-3 rounded-2xl border border-black/5 bg-white/70 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: template.defaultTheme.accent }}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] opacity-55">{page.pageType}</p>
                  <p className="mt-1 font-black">{page.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
