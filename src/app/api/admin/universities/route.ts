import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDataset, saveDataset } from "@/lib/data";
import type { AdmissionStatus, University } from "@/lib/types";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (row.count >= MAX_PER_WINDOW) return false;
  row.count += 1;
  return true;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // still compare to reduce timing leak shape
    timingSafeEqual(left, Buffer.alloc(left.length));
    return false;
  }
  return timingSafeEqual(left, right);
}

function authorized(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";
  const expected =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "ksabroad2027");
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

export async function GET(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dataset = await getDataset();
  return NextResponse.json(dataset);
}

export async function PUT(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    status?: AdmissionStatus;
    estimatedOpenDate?: string | null;
    deadline?: string | null;
    applicationFeeEuro?: number | null;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing university id" }, { status: 400 });
  }

  const dataset = await getDataset();
  const index = dataset.universities.findIndex((u) => u.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "University not found" }, { status: 404 });
  }

  const current: University = dataset.universities[index];
  const nextNotes =
    typeof body.notes === "string" ? body.notes.slice(0, 4000) : current.notes;

  dataset.universities[index] = {
    ...current,
    status: body.status ?? current.status,
    estimatedOpenDate:
      body.estimatedOpenDate !== undefined
        ? body.estimatedOpenDate
        : current.estimatedOpenDate,
    deadline: body.deadline !== undefined ? body.deadline : current.deadline,
    applicationFeeEuro:
      body.applicationFeeEuro !== undefined
        ? body.applicationFeeEuro
        : current.applicationFeeEuro,
    notes: nextNotes,
  };
  dataset.lastUpdated = new Date().toISOString().slice(0, 10);

  await saveDataset(dataset);
  return NextResponse.json({ ok: true, university: dataset.universities[index] });
}
