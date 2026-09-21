"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConsultancyCase } from "@/lib/consultancy-types";

export function ConsultancyPanel() {
  const [cases, setCases] = useState<ConsultancyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyBusy, setReplyBusy] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/consultancy");
      const json = (await res.json()) as { cases?: ConsultancyCase[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Could not load cases.");
      setCases(json.cases ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/consultancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: String(form.get("type") || ""),
          topic: String(form.get("topic") || ""),
          message: String(form.get("message") || ""),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not submit.");
      e.currentTarget.reset();
      setMessage("Request sent. KS Abroad team will reply by email or portal.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply(caseId: string) {
    const body = (replyText[caseId] || "").trim();
    if (!body) return;
    setReplyBusy(caseId);
    setError("");
    try {
      const res = await fetch(`/api/consultancy/${caseId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Could not send reply.");
      setReplyText((prev) => ({ ...prev, [caseId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reply.");
    } finally {
      setReplyBusy(null);
    }
  }

  return (
    <div className="panel rounded-3xl p-6 md:p-8 space-y-5">
      <div>
        <p className="eyebrow">Step 4 · Consultancy</p>
        <h2 className="display mt-2 text-3xl">1-to-1 or private case</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Request a counselling slot or open a private case. This unlocks the assisted
          apply hub (Step 5). KS Abroad is notified by email and updates your case here.
        </p>
      </div>

      {error ? <p className="text-sm font-semibold text-[var(--coral)]">{error}</p> : null}
      {message ? <p className="text-sm font-semibold text-[var(--sea-deep)]">{message}</p> : null}

      <form onSubmit={createCase} className="grid gap-3">
        <select className="select" name="type" defaultValue="one-to-one" required>
          <option value="one-to-one">1-to-1 counselling</option>
          <option value="private-case">Private case review</option>
        </select>
        <input className="input" name="topic" required placeholder="Topic (e.g. Rome master shortlist)" />
        <textarea
          className="textarea min-h-24"
          name="message"
          required
          placeholder="Describe your question, timeline, and documents ready…"
        />
        <button className="btn btn-sea w-fit" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Submit request"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="eyebrow">Your cases</div>
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No consultancy requests yet.</p>
        ) : (
          cases.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[var(--line)] p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c.topic}</span>
                <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                  {c.type.replace("-", " ")} · {c.status}
                </span>
                <span className="ml-auto text-xs text-[var(--ink-soft)]">
                  {c.createdAt.slice(0, 10)}
                </span>
              </div>
              <p className="text-sm text-[var(--ink-soft)]">{c.message}</p>
              {c.replies.length > 0 ? (
                <ul className="space-y-2 border-t border-[var(--line)] pt-3">
                  {c.replies.map((r, i) => (
                    <li key={`${r.at}-${i}`} className="text-sm">
                      <span className="font-semibold capitalize">{r.from}</span>
                      <span className="text-xs text-[var(--ink-soft)]"> · {r.at.slice(0, 16).replace("T", " ")}</span>
                      <div className="mt-1">{r.body}</div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {c.status !== "closed" ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <input
                    className="input flex-1 min-w-[12rem]"
                    value={replyText[c.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    placeholder="Add a follow-up message…"
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={replyBusy === c.id}
                    onClick={() => void sendReply(c.id)}
                  >
                    {replyBusy === c.id ? "Sending…" : "Reply"}
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
