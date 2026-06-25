import Link from "next/link";

export default function ExperienceNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f6f7fb] px-5 py-6 text-[#101828]">
      <section className="w-full max-w-xl rounded-lg border border-[#eaecf0] bg-white p-6 shadow-xl shadow-black/5">
        <p className="text-sm font-black uppercase text-[#2563eb]">AIRPLANE</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">This experience is not available.</h1>
        <p className="mt-3 text-base leading-7 text-[#667085]">
          The link may be incorrect, unpublished, or archived by its creator.
        </p>
        <Link className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-[#101828] px-5 font-black text-white" href="/">
          Go home
        </Link>
      </section>
    </main>
  );
}
