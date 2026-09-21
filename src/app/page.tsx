import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Landmark,
  Stethoscope,
  BookMarked,
  ScrollText,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { JsonLd } from "@/components/json-ld";
import { SocialLinks } from "@/components/social-links";
import { getMeta } from "@/lib/data";
import { SITE } from "@/lib/site";
import { faqJsonLd } from "@/lib/structured-data";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache";

export const revalidate = PUBLIC_REVALIDATE_SECONDS;

export default async function HomePage() {
  const [meta] = await Promise.all([getMeta()]);
  const faq = faqJsonLd([
    {
      question: "When is Universitaly pre-enrolment for non-EU students?",
      answer: `Universitaly pre-enrolment deadline on this site is ${meta.universitalyPreEnrolmentDeadline}. Always confirm embassy and university steps.`,
    },
    {
      question: "Does KS Abroad Studies help Pakistani students apply to Italy?",
      answer: `${SITE.name} is a Pakistan-based consultancy for Italian public universities: English programmes, portals, regional scholarships, DOV, and study visa guidance.`,
    },
    {
      question: "Where can I browse English master's and bachelor's programmes?",
      answer:
        "Use /programs/master for master's, /programs/bachelor for bachelor's (including CEnT-S), and /programs/single-cycle for medicine and related single-cycle degrees.",
    },
    {
      question: "How do I contact KS Abroad?",
      answer: `WhatsApp ${SITE.whatsappDisplay}, email ${SITE.email}, or the contact form at /contact. On-site KS Buddy can answer common questions.`,
    },
  ]);

  const paths = [
    {
      href: "/universities",
      title: "Universities",
      body: "Portals, fees, open / soon / closed",
      icon: Landmark,
    },
    {
      href: "/programs/master",
      title: "Master's",
      body: `${meta.masterCount}+ English master's programmes`,
      icon: GraduationCap,
    },
    {
      href: "/programs/bachelor",
      title: "Bachelor's",
      body: "English bachelor's + CEnT-S guide",
      icon: BookOpen,
    },
    {
      href: "/programs/single-cycle",
      title: "Single-cycle (Medicine)",
      body: "MBBS Â· Dentistry Â· Veterinary + IMAT",
      icon: Stethoscope,
    },
    {
      href: "/phd",
      title: "PhD",
      body: "Dottorato Â· PICA Â· English courses",
      icon: BookMarked,
    },
    {
      href: "/guides",
      title: "Guides",
      body: "Docs Â· DOV Â· visa Â· scholarships",
      icon: ScrollText,
    },
  ];

  return (
    <>
      <JsonLd data={faq} />
      <section className="hero-plane">
        <div className="site-shell relative z-10 flex min-h-[min(88vh,760px)] flex-col justify-end pb-14 pt-24">
          <div className="rise flex items-center gap-4">
            <BrandLogo size={84} priority className="shadow-lg ring-2 ring-white/15" />
            <p className="eyebrow text-[#d9c4a1]">Pakistan · Study Abroad Consultancy</p>
          </div>
          <h1 className="display mt-5 max-w-4xl text-[clamp(3rem,8.5vw,6.4rem)] rise rise-delay-1">
            KS Abroad Studies
          </h1>
          <p className="mt-3 text-[#dcc7a4] font-semibold rise rise-delay-1">
            {SITE.tagline}
          </p>
          <p className="mt-5 max-w-xl text-base md:text-xl text-[#e8e1d3] leading-relaxed rise rise-delay-2">
            Italy admissions, portals, scholarships, and visa steps — clear and
            ready for students. Focus: Lazio & South first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 rise rise-delay-3">
            <Link href="/universities" className="btn btn-primary">
              Browse universities <ArrowUpRight size={18} />
            </Link>
            <Link href="/scholarships" className="btn btn-ghost">
              Regional scholarships
            </Link>
          </div>
        </div>
      </section>

      <section className="site-shell -mt-8 relative z-20 pb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="panel panel-hover rounded-3xl p-5"
            >
              <item.icon className="text-[var(--sea)]" size={22} />
              <div className="mt-3 font-bold text-lg">{item.title}</div>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Universities",
              value: `${meta.universityCount}+`,
              detail: `${meta.openCount} open Â· ${meta.soonCount} soon Â· ${meta.closedCount} closed`,
            },
            {
              label: "English programs",
              value: `${meta.programCount}+`,
              detail: `${meta.bachelorCount} bachelor Â· ${meta.masterCount} master Â· ${meta.singleCycleCount} single-cycle`,
            },
            {
              label: "Universitaly",
              value: "30 Nov",
              detail: `Pre-enrolment deadline ${meta.universitalyPreEnrolmentDeadline}`,
            },
          ].map((item) => (
            <div key={item.label} className="panel rounded-3xl p-6">
              <div className="eyebrow">{item.label}</div>
              <div className="display mt-3 text-5xl text-[var(--sea-deep)]">
                {item.value}
              </div>
              <p className="mt-3 text-[var(--ink-soft)]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-stretch">
          <div className="panel rounded-3xl p-6 md:p-8">
            <p className="eyebrow">Student desk</p>
            <h2 className="display mt-3 text-4xl md:text-5xl max-w-xl">
              Find the portal. Check the deadline. Apply with confidence.
            </h2>
            <p className="mt-5 max-w-2xl text-[var(--ink-soft)] text-lg leading-relaxed">
              Official university links, region scholarships, and process steps
              in one place â€” built for Pakistani students targeting Italy.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-sea">
                Contact Us
              </Link>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </div>
            <div className="mt-7">
              <p className="eyebrow mb-3">Follow Â· {SITE.founderHandle}</p>
              <SocialLinks compact groups={["company", "channels"]} />
            </div>
          </div>

          <div className="panel rounded-3xl p-6 md:p-8">
            <p className="eyebrow mb-2">Quick jumps</p>
            <Link href="/universities" className="link-row">
              Universities list <ArrowUpRight size={18} />
            </Link>
            <Link href="/programs/master" className="link-row">
              Master&apos;s in English <ArrowUpRight size={18} />
            </Link>
            <Link href="/programs/bachelor" className="link-row">
              Bachelor&apos;s + CEnT-S <ArrowUpRight size={18} />
            </Link>
            <Link href="/programs/single-cycle" className="link-row">
              Medicine Â· Dentistry Â· IMAT <ArrowUpRight size={18} />
            </Link>
            <Link href="/phd" className="link-row">
              PhD / Dottorato <ArrowUpRight size={18} />
            </Link>
            <Link href="/guides" className="link-row">
              Pakistan guides <ArrowUpRight size={18} />
            </Link>
            <Link href="/scholarships" className="link-row">
              Regional scholarships <ArrowUpRight size={18} />
            </Link>
            <Link href="/erasmus" className="link-row">
              Erasmus Mundus 2027 <ArrowUpRight size={18} />
            </Link>
            <Link href="/process" className="link-row">
              Full process Â· tests <ArrowUpRight size={18} />
            </Link>
            <Link href="/about" className="link-row">
              Company registration <ArrowUpRight size={18} />
            </Link>
            <Link href="/agreement" className="link-row">
              Consultancy agreement <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
