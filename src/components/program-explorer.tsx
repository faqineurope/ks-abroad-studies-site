"use client";

import Link from "next/link";
import { ExternalLink, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Program } from "@/lib/types";

type ProgramRow = Program & {
  universityId: string;
  universityName: string;
  city: string;
};

export function ProgramExplorer({
  programs,
  levelLabel,
}: {
  programs: ProgramRow[];
  levelLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all");
  const [test, setTest] = useState("all");

  const fields = useMemo(() => {
    return Array.from(new Set(programs.map((p) => p.field).filter(Boolean))).sort();
  }, [programs]);

  const tests = useMemo(() => {
    return Array.from(
      new Set(
        programs
          .map((p) => p.admissionTest)
          .filter((t): t is string => Boolean(t)),
      ),
    ).sort();
  }, [programs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      if (field !== "all" && p.field !== field) return false;
      if (test !== "all" && (p.admissionTest || "") !== test) return false;
      if (!q) return true;
      return [p.name, p.universityName, p.city, p.field, p.admissionTest]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [programs, query, field, test]);

  const hasFilters = query || field !== "all" || test !== "all";

  return (
    <div className="space-y-5">
      <div
        className={`panel rounded-3xl p-4 md:p-5 grid gap-3 ${
          tests.length ? "md:grid-cols-[1.4fr_1fr_1fr]" : "md:grid-cols-[1.6fr_1fr]"
        }`}
      >
        <label className="relative block">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
          />
          <input
            className="input pl-10"
            placeholder={`Search ${levelLabel.toLowerCase()} programs…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          className="select"
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          <option value="all">All fields</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {tests.length > 0 && (
          <select
            className="select"
            value={test}
            onChange={(e) => setTest(e.target.value)}
          >
            <option value="all">All admission tests</option>
            {tests.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--ink-soft)] font-semibold">
          Showing {filtered.length} of {programs.length} {levelLabel.toLowerCase()} programs
        </div>
        {hasFilters && (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--sea-deep)]"
            onClick={() => {
              setQuery("");
              setField("all");
              setTest("all");
            }}
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((program, index) => (
          <article
            key={`${program.universityId}-${program.name}-${index}`}
            className="mobile-card space-y-2"
          >
            <div className="font-bold text-lg leading-tight">{program.name}</div>
            <div className="text-sm text-[var(--ink-soft)]">
              <Link
                href={`/universities/${program.universityId}`}
                className="font-semibold hover:text-[var(--sea)]"
              >
                {program.universityName}
              </Link>
              {" · "}
              {program.city}
              {program.field ? ` · ${program.field}` : ""}
              {program.admissionTest ? ` · Test: ${program.admissionTest}` : ""}
            </div>
            {program.applyUrl ? (
              <a
                href={program.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline text-sm py-2 px-3"
              >
                Program page <ExternalLink size={14} />
              </a>
            ) : (
              <Link
                href={`/universities/${program.universityId}`}
                className="btn btn-outline text-sm py-2 px-3"
              >
                University portal
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Program</th>
              <th>University</th>
              <th>City</th>
              <th>Field</th>
              <th>Test</th>
              <th>Apply / details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((program, index) => (
              <tr key={`${program.universityId}-${program.name}-${index}`}>
                <td className="text-[var(--ink-soft)]">{index + 1}</td>
                <td className="font-bold">{program.name}</td>
                <td>
                  <Link
                    href={`/universities/${program.universityId}`}
                    className="font-semibold hover:text-[var(--sea)]"
                  >
                    {program.universityName}
                  </Link>
                </td>
                <td>{program.city}</td>
                <td>{program.field || "—"}</td>
                <td>{program.admissionTest || "—"}</td>
                <td>
                  {program.applyUrl ? (
                    <a
                      href={program.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[var(--sea-deep)] hover:underline"
                    >
                      Program page <ExternalLink size={14} />
                    </a>
                  ) : (
                    <Link
                      href={`/universities/${program.universityId}`}
                      className="font-semibold text-[var(--sea-deep)] hover:underline"
                    >
                      See university portal
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
