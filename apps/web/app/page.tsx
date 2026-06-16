import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#f6f7fb] px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col justify-center gap-6">
        <p className="text-sm font-black uppercase text-blue-600">AIRPLANE</p>
        <h1 className="text-5xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
          Interactive experiences, shared as a link.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          The public renderer is ready for recipient links. Creators build and publish from the Expo app.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white" href="/e/DEMO01">
            Open demo experience
          </Link>
          <Link className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-950" href="/template/marriage-proposal">
            View proposal template
          </Link>
        </div>
      </section>
    </main>
  );
}
