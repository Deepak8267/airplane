import Link from "next/link";

export default function ExperienceNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fff7fb] px-5 py-6 text-[#101828]">
      <section className="w-full max-w-xl rounded-lg border border-pink-200 bg-white p-6 shadow-xl shadow-pink-500/10">
        <p className="text-sm font-black uppercase text-[#ec0e68]">AIRPLANE</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">This experience is not available.</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          The link may be incorrect, unpublished, or archived by its creator.
        </p>
        <Link className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-[#ec0e68] px-5 font-black text-white shadow-lg shadow-pink-500/20" href="/">
          Go home
        </Link>
      </section>
    </main>
  );
}
