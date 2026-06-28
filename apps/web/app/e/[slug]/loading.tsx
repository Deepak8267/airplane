export default function ExperienceLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fff7fb] px-4 py-5 text-[#101828] sm:px-6">
      <div className="flex w-full max-w-[430px] flex-col gap-4">
        <div className="rounded-full border border-white/70 bg-white/65 px-3 py-3 shadow-lg shadow-black/5 backdrop-blur">
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#ec0e68]" />
          </div>
        </div>
        <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-pink-500/10 backdrop-blur">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ec0e68] text-xl font-black text-white">A</div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#ec0e68]">AIRPLANE</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Loading your experience.</h1>
          <p className="mt-3 text-base leading-7 text-[#667085]">Getting the pages ready for this link.</p>
        </div>
      </div>
    </main>
  );
}
