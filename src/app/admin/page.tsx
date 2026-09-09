"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdmissionStatus, UniversitiesDataset, University } from "@/lib/types";

const STORAGE_KEY = "ks-admin-password";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [dataset, setDataset] = useState<UniversitiesDataset | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<AdmissionStatus>("tba");
  const [estimatedOpenDate, setEstimatedOpenDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");

  const selected = useMemo(
    () => dataset?.universities.find((u) => u.id === selectedId) || null,
    [dataset, selectedId],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      void loadData(saved);
    }
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setEstimatedOpenDate(selected.estimatedOpenDate || "");
    setDeadline(selected.deadline || "");
    setFee(
      selected.applicationFeeEuro === null
        ? ""
        : String(selected.applicationFeeEuro),
    );
    setNotes(selected.notes || "");
  }, [selected]);

  async function loadData(pwd: string) {
    setMessage("");
    const res = await fetch("/api/admin/universities", {
      headers: { "x-admin-password": pwd },
    });
    if (!res.ok) {
      setAuthed(false);
      setMessage("Wrong password or API error.");
      return;
    }
    const data = (await res.json()) as UniversitiesDataset;
    setDataset(data);
    setAuthed(true);
    window.localStorage.setItem(STORAGE_KEY, pwd);
    if (!selectedId && data.universities[0]) {
      setSelectedId(data.universities[0].id);
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/universities", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        id: selected.id,
        status,
        estimatedOpenDate: estimatedOpenDate || null,
        deadline: deadline || null,
        applicationFeeEuro: fee === "" ? null : Number(fee),
        notes,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Save failed.");
      return;
    }
    const json = (await res.json()) as { university: University };
    setDataset((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lastUpdated: new Date().toISOString().slice(0, 10),
        universities: prev.universities.map((u) =>
          u.id === json.university.id ? json.university : u,
        ),
      };
    });
    setMessage("Saved. Public list will show updated dates after refresh.");
  }

  if (!authed) {
    return (
      <div className="site-shell py-16 max-w-lg">
        <p className="eyebrow">Team only</p>
        <h1 className="display mt-3 text-4xl">Admin panel</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Update open dates, deadlines, fees, and status each intake season.
        </p>
        <form
          className="mt-6 panel rounded-3xl p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const pwd = String(fd.get("password") || password);
            setPassword(pwd);
            void loadData(pwd);
          }}
        >
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-sea">
            Unlock
          </button>
          {message && <p className="text-sm text-[var(--coral)]">{message}</p>}
          <p className="text-xs text-[var(--ink-soft)]">
            Local/dev default: <code>ksabroad2027</code>. Production requires{" "}
            <code>ADMIN_PASSWORD</code>.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="site-shell py-12 md:py-16">
      <p className="eyebrow">Seasonal updates</p>
      <h1 className="display mt-3 text-4xl md:text-5xl">Admin · university dates</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        Intake {dataset?.intake} · last updated {dataset?.lastUpdated}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel rounded-3xl p-5">
          <label className="eyebrow">University</label>
          <select
            className="select mt-2"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {dataset?.universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {selected && (
            <div className="mt-4 text-sm text-[var(--ink-soft)] space-y-2">
              <div>
                Portal:{" "}
                <a
                  href={selected.admissionPortal}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--sea-deep)]"
                >
                  open
                </a>
              </div>
              <div>{selected.programs.length} English programs listed</div>
            </div>
          )}
        </div>

        <div className="panel rounded-3xl p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="eyebrow">Status</span>
              <select
                className="select mt-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as AdmissionStatus)}
              >
                <option value="open">Open</option>
                <option value="soon">Opening soon</option>
                <option value="closed">Closed</option>
                <option value="tba">Check portal</option>
              </select>
            </label>
            <label className="block">
              <span className="eyebrow">Application fee (€)</span>
              <input
                className="input mt-2"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0 for no fee"
              />
            </label>
            <label className="block">
              <span className="eyebrow">Estimated open date</span>
              <input
                className="input mt-2"
                value={estimatedOpenDate}
                onChange={(e) => setEstimatedOpenDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="eyebrow">Deadline</span>
              <input
                className="input mt-2"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow">Notes</span>
            <textarea
              className="textarea mt-2 min-h-28"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn-sea"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save university dates"}
          </button>
          {message && <p className="text-sm font-semibold text-[var(--sea-deep)]">{message}</p>}
        </div>
      </div>
    </div>
  );
}
