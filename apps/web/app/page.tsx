import Link from "next/link";

const productCards = [
  { title: "Date Proposal", label: "Love", tone: "bg-[#fff0f6]" },
  { title: "Birthday Surprise", label: "Birthday", tone: "bg-[#f0f9ff]" },
  { title: "Friendship Quiz", label: "Friends", tone: "bg-[#f0fdf4]" }
];

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#fff7fb] px-4 py-5 text-[#101828] sm:px-6">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl items-center gap-8 py-8 lg:grid-cols-[1fr_430px]">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-pink-100 bg-white px-4 py-2 shadow-sm shadow-pink-500/10">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#ec0e68] text-sm font-black text-white">A</span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ec0e68]">AIRPLANE</span>
            <span className="hidden text-xs font-bold text-slate-500 sm:inline">Create moments that fly</span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Interactive experiences, shared as a link.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Build a personal flow in the Expo app, publish it, and send a web link that opens instantly for the recipient.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex h-12 items-center rounded-2xl bg-[#ec0e68] px-5 font-black text-white shadow-lg shadow-pink-500/20" href="/e/DEMO01">
              Open demo experience
            </Link>
            <Link className="inline-flex h-12 items-center rounded-2xl border border-pink-200 bg-white px-5 font-black text-slate-950" href="/template/marriage-proposal">
              View proposal template
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px]">
          <div className="rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-pink-500/10 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ec0e68]">Templates</p>
                <h2 className="mt-1 text-2xl font-black">Start with a moment</h2>
              </div>
              <span className="rounded-full bg-[#fff0f6] px-3 py-1 text-xs font-black text-[#ec0e68]">MVP</span>
            </div>
            <div className="grid gap-3">
              {productCards.map((card) => (
                <div key={card.title} className={`rounded-2xl border border-black/5 ${card.tone} p-4`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
                  <p className="mt-2 text-lg font-black">{card.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[#101828] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-200">Recipient flow</p>
              <p className="mt-2 text-2xl font-black">Open link. Tap through. Complete.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
