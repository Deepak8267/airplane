export default function ExperienceLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fff7fb] px-5 py-6 text-[#101828]">
      <div className="flex w-full max-w-xl flex-col gap-5">
        <div className="h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#ec0e68]" />
        </div>
        <div className="rounded-lg border border-pink-200 bg-white p-5 shadow-xl shadow-pink-500/10">
          <p className="text-sm font-black uppercase text-[#ec0e68]">AIRPLANE</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Loading your experience.</h1>
          <p className="mt-3 text-base leading-7 text-[#667085]">Getting the pages ready for this link.</p>
        </div>
      </div>
    </main>
  );
}
