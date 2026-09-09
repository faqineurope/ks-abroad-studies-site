import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "@/components/social-links";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact KS Abroad Studies for Study in Italy guidance — WhatsApp, email form, and social channels.",
};

export default function ContactPage() {
  return (
    <div className="site-shell py-12 md:py-16">
      <p className="eyebrow">KS Abroad Studies</p>
      <h1 className="display mt-3 text-4xl md:text-6xl max-w-3xl">
        Let&apos;s map your Italy intake
      </h1>
      <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)] leading-relaxed">
        Message {SITE.founder} ({SITE.founderHandle}). Form goes to{" "}
        {SITE.email}; WhatsApp is fastest for urgent replies.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="panel rounded-3xl p-6 md:p-8">
          <h2 className="display text-3xl">Send a message</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Fill the form — it arrives in our inbox at {SITE.email}.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="panel rounded-3xl p-6 space-y-4">
            <h2 className="display text-2xl">Direct</h2>
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sea w-full">
              WhatsApp {SITE.whatsappDisplay}
            </a>
            <a
              href={SITE.emailUrl}
              className="inline-flex items-center gap-2 font-semibold hover:text-[var(--sea)]"
            >
              <Mail size={18} /> {SITE.email}
            </a>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              {SITE.tagline}
            </p>
          </div>

          <div className="panel rounded-3xl p-6">
            <p className="eyebrow">Follow</p>
            <h2 className="display mt-2 text-2xl">Social</h2>
            <div className="mt-5">
              <SocialLinks />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
