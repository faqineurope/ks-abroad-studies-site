import type { Metadata } from "next";
import Link from "next/link";
import { ProgramExplorer } from "@/components/program-explorer";
import { getMeta, getPrograms } from "@/lib/data";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Master's Programs in English",
  description:
    "English-taught master's programs at Italian public universities with direct program or admission portal links.",
};

export default async function MasterProgramsPage() {
  const [programs, meta] = await Promise.all([getPrograms("master"), getMeta()]);

  return (
    <div className="site-shell page-hero pb-12 md:pb-16">
      <Link href="/" className="text-sm font-semibold text-[var(--sea-deep)] hover:underline">
        â† Home
      </Link>
      <p className="eyebrow mt-6">Intake {meta.intake}</p>
      <h1 className="display mt-3 text-4xl md:text-6xl max-w-4xl">
        Master&apos;s programmes in English
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-[var(--ink-soft)] leading-relaxed">
        {meta.masterCount} English master programs listed for international
        applicants. Open a program page or jump to the university admission
        portal from the university profile.
      </p>
      <div className="mt-10">
        <ProgramExplorer programs={programs} levelLabel="Master's" />
      </div>
    </div>
  );
}
