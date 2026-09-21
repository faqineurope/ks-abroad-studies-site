"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DOCUMENT_KINDS, type PublicStudent } from "@/lib/student-types";
import type { MatchRow, ProfileAnalysis } from "@/lib/match-student";
import { ConsultancyPanel } from "@/components/consultancy-panel";
import { ApplyHub } from "@/components/apply-hub";
import { StatusBadge } from "@/components/status-badge";
import type { AdmissionStatus } from "@/lib/types";

type Payload = {
  student: PublicStudent;
  analysis: ProfileAnalysis;
  matches: MatchRow[];
};

export function PortalDesk() {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return (await res.json()) as Payload;
      })
      .then((json) => {
        if (json?.student) setData(json);
      })
      .catch(() => setError("Could not load portal."));
  }, [router]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          phone: String(form.get("phone") || ""),
          studyLevel: String(form.get("studyLevel") || ""),
          field: String(form.get("field") || ""),
          cgpa: String(form.get("cgpa") || ""),
          englishProof: String(form.get("englishProof") || ""),
          cityPreference: String(form.get("cityPreference") || ""),
          regionPreference: String(form.get("regionPreference") || ""),
          intake: String(form.get("intake") || ""),
          notes: String(form.get("notes") || ""),
        }),
      });
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not save.");
      setData(json);
      setMessage(
        `Profile saved. AI shortlist refreshed — top ${json.matches?.length ?? 0} programmes from our catalogue.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function reanalyze() {
    setAnalyzing(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/portal/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error || "Analysis failed.");
      setData(json);
      setMessage(
        `Analysis complete. Showing top ${json.matches.length} matches from ${json.analysis.catalogueScanned} catalogue entries.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");
    setMessage("");
    const form = e.currentTarget;
    const body = new FormData(form);
    try {
      const res = await fetch("/api/portal/documents", { method: "POST", body });
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok || !json.student) throw new Error(json.error || "Upload failed.");
      setData(json);
      form.reset();
      setMessage("Document uploaded. Suggestions refreshed with your new file.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function removeDoc(id: string) {
    setError("");
    const res = await fetch("/api/portal/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = (await res.json()) as Payload & { error?: string };
    if (!res.ok || !json.student) {
      setError(json.error || "Could not delete.");
      return;
    }
    setData(json);
  }

  if (!data) {
    return <p className="text-[var(--ink-soft)]">Loading your portal…</p>;
  }

  const { student, matches, analysis } = data;
  const p = student.profile;

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-sm font-semibold text-[var(--coral)]">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm font-semibold text-[var(--sea-deep)]">{message}</p>
      ) : null}

      <form onSubmit={saveProfile} className="panel rounded-3xl p-6 md:p-8 space-y-4">
        <div>
          <p className="eyebrow">Step 1 · Profile</p>
          <h2 className="display mt-2 text-3xl">Your study information</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Level, field, CGPA and location drive the top-10 programme shortlist from our live list.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" name="name" defaultValue={student.name} required placeholder="Full name" />
          <input className="input" name="phone" defaultValue={student.phone} placeholder="WhatsApp" />
          <select className="select" name="studyLevel" defaultValue={p.studyLevel} required>
            <option value="">Study level *</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s</option>
            <option value="single-cycle">Medicine / single-cycle</option>
            <option value="phd">PhD</option>
          </select>
          <input
            className="input"
            name="field"
            defaultValue={p.field}
            required
            placeholder="Field * (e.g. Computer Science)"
          />
          <input className="input" name="cgpa" defaultValue={p.cgpa} placeholder="CGPA / percentage *" />
          <input
            className="input"
            name="englishProof"
            defaultValue={p.englishProof}
            placeholder="English proof (IELTS 6.5 / MOI…)"
          />
          <input
            className="input"
            name="cityPreference"
            defaultValue={p.cityPreference}
            placeholder="Preferred city (Rome, Naples…)"
          />
          <select className="select" name="regionPreference" defaultValue={p.regionPreference}>
            <option value="">Preferred region</option>
            <option value="lazio">Lazio</option>
            <option value="south">South</option>
            <option value="centre">Centre</option>
            <option value="north">North</option>
          </select>
          <input
            className="input sm:col-span-2"
            name="intake"
            defaultValue={p.intake}
            placeholder="Target intake (e.g. 2026/27)"
          />
        </div>
        <textarea
          className="textarea min-h-24"
          name="notes"
          defaultValue={p.notes}
          placeholder="Goals, budget, test plans (CEnT-S / IMAT), anything KS Abroad should weigh"
        />
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-sea" type="submit" disabled={saving}>
            {saving ? "Saving & analysing…" : "Save & analyse profile"}
          </button>
          <button
            className="btn btn-outline"
            type="button"
            disabled={analyzing}
            onClick={() => void reanalyze()}
          >
            {analyzing ? "Analysing…" : "Re-run AI shortlist"}
          </button>
        </div>
      </form>

      <div className="panel rounded-3xl p-6 md:p-8 space-y-4">
        <div>
          <p className="eyebrow">Step 2 · Documents</p>
          <h2 className="display mt-2 text-3xl">Upload documents</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Passport, transcripts, degree/HSSC, English proof — PDF/JPG/PNG/WebP · max 8 MB. Uploads refresh your shortlist.
          </p>
        </div>
        <form onSubmit={upload} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select className="select" name="kind" defaultValue="passport">
            {DOCUMENT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="file"
            name="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
          />
          <button className="btn btn-sea" type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
        <ul className="space-y-2">
          {student.documents.length === 0 ? (
            <li className="text-sm text-[var(--ink-soft)]">No documents yet.</li>
          ) : (
            student.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{doc.originalName}</div>
                  <div className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                    {doc.kind} · {doc.uploadedAt.slice(0, 10)}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--coral)]"
                  onClick={() => void removeDoc(doc.id)}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="panel rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Step 3 · AI analysis</p>
            <h2 className="display mt-2 text-3xl">{analysis.headline}</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">{analysis.summary}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              analysis.readiness === "ready"
                ? "bg-[rgba(15,106,111,0.15)] text-[var(--sea-deep)]"
                : analysis.readiness === "almost"
                  ? "bg-[rgba(220,199,164,0.45)] text-[var(--ink)]"
                  : "bg-[rgba(194,85,61,0.12)] text-[var(--coral)]"
            }`}
          >
            {analysis.readiness}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] p-4">
            <div className="eyebrow mb-2">Strengths</div>
            <ul className="space-y-1.5 text-sm">
              {analysis.strengths.length ? (
                analysis.strengths.map((s) => <li key={s}>· {s}</li>)
              ) : (
                <li className="text-[var(--ink-soft)]">Add profile details first.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--line)] p-4">
            <div className="eyebrow mb-2">Gaps to improve matches</div>
            <ul className="space-y-1.5 text-sm">
              {analysis.gaps.length ? (
                analysis.gaps.map((g) => <li key={g}>· {g}</li>)
              ) : (
                <li className="text-[var(--ink-soft)]">No major gaps detected.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel rounded-3xl p-6 md:p-8 space-y-4">
        <div>
          <p className="eyebrow">Top 10 · Our programme list</p>
          <h2 className="display mt-2 text-3xl">Suggested programmes for you</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Ranked against your requirements from KS Abroad&apos;s live catalogue (not the open web). Always re-check the university portal before applying.
          </p>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">
            Save study level + field (and ideally CGPA / city) then click{" "}
            <strong>Save &amp; analyse profile</strong>.
          </p>
        ) : (
          <ol className="grid gap-3">
            {matches.map((row) => (
              <li key={`${row.rank}-${row.href}-${row.title}`}>
                <Link
                  href={row.href}
                  className="block rounded-2xl border border-[var(--line)] px-4 py-4 hover:border-[rgba(15,106,111,0.35)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(15,106,111,0.12)] text-sm font-bold text-[var(--sea-deep)]">
                      {row.rank}
                    </span>
                    <span className="display text-xl">{row.title}</span>
                    {row.status ? <StatusBadge status={row.status as AdmissionStatus} /> : null}
                    <span className="ml-auto text-xs font-bold uppercase tracking-wide text-[var(--sea-deep)]">
                      Fit {row.fitScore}%
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-[var(--ink-soft)]">{row.subtitle}</div>
                  {row.field ? (
                    <div className="mt-1 text-xs font-semibold text-[var(--ink-soft)]">{row.field}</div>
                  ) : null}
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--sea-deep)]">
                    {row.why}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="panel rounded-3xl p-6 md:p-8 space-y-4">
        <div>
          <p className="eyebrow">Privacy · Your data rights</p>
          <h2 className="display mt-2 text-3xl">Consent &amp; controls</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Policy version: {student.consent?.policyVersion ?? "legacy"}. We process your
            data based on the consent you gave at registration.{" "}
            <Link href="/privacy" className="font-semibold text-[var(--sea-deep)] hover:underline">
              Read Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              const res = await fetch("/api/portal/privacy");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ks-abroad-my-data.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export my data
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              const next = !(student.consent?.marketingOptIn ?? false);
              const res = await fetch("/api/portal/privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marketingOptIn: next }),
              });
              const json = (await res.json()) as {
                student?: PublicStudent;
                error?: string;
              };
              if (!res.ok || !json.student) {
                setError(json.error || "Could not update marketing preference.");
                return;
              }
              setData((prev) => (prev ? { ...prev, student: json.student! } : prev));
              setMessage(
                next
                  ? "Marketing updates enabled."
                  : "Marketing updates turned off.",
              );
            }}
          >
            {student.consent?.marketingOptIn
              ? "Turn off marketing updates"
              : "Allow marketing updates"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              if (
                !window.confirm(
                  "Delete your account and uploaded documents permanently?",
                )
              ) {
                return;
              }
              const res = await fetch("/api/portal/privacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete" }),
              });
              if (!res.ok) {
                setError("Could not delete account.");
                return;
              }
              router.push("/");
              router.refresh();
            }}
          >
            Delete my account
          </button>
        </div>
      </div>

      <div id="consultancy">
        <ConsultancyPanel />
      </div>
      <ApplyHub />
    </div>
  );
}
