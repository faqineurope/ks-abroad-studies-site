import type { Metadata } from "next";
import { PortalDesk } from "@/components/portal-desk";

export const metadata: Metadata = {
  title: "Student portal",
  description: "Your KS Abroad Studies profile, documents, and programme matches.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <div className="site-shell py-12 md:py-16">
      <p className="eyebrow">Your desk</p>
      <h1 className="display mt-3 text-4xl md:text-6xl max-w-3xl">Student portal</h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed">
        Fill your information, upload documents, then let the portal analyse your file and suggest the top 10 programmes from our live catalogue that fit your requirements.
      </p>
      <div className="mt-10">
        <PortalDesk />
      </div>
    </div>
  );
}
