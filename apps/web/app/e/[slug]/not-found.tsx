import Link from "next/link";

export default function ExperienceNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fff7fb] px-4 py-5 text-[#101828] sm:px-6">
      <section className="w-full max-w-[430px] rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-pink-500/10 backdrop-blur">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ec0e68] text-xl font-black text-white">A</div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#ec0e68]">AIRPLANE</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">This experience is not available.</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          The link may be incorrect, unpublished, or archived by its creator.
        </p>
        <Link className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#ec0e68] px-5 font-black text-white shadow-lg shadow-pink-500/20" href="/">
          Go home
        </Link>
      </section>
    </main>
  );
}
