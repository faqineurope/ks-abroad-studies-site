import { NextRequest, NextResponse } from "next/server";
import { clean, sessionIdFromRequest } from "@/lib/auth";
import { analyzeAndMatchStudent } from "@/lib/match-student";
import {
  assertTrustedOrigin,
  clientIp,
  forbiddenOrigin,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/security";
import { EMPTY_PROFILE, type StudyLevel } from "@/lib/student-types";
import { getStudentById, toPublic, upsertStudent } from "@/lib/students";

const LEVELS: StudyLevel[] = ["bachelor", "master", "single-cycle", "phd"];
const REGIONS = ["lazio", "south", "centre", "north"] as const;

async function payloadFor(id: string) {
  const student = await getStudentById(id);
  if (!student) return null;
  const pub = toPublic(student);
  const result = await analyzeAndMatchStudent(pub);
  return { student: pub, ...result };
}

export async function GET(req: NextRequest) {
  if (!rateLimit(`portal-get:${clientIp(req)}`, 40)) return rateLimitedResponse();
  const id = sessionIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const payload = await payloadFor(id);
  if (!payload) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  return NextResponse.json(payload);
}

export async function PUT(req: NextRequest) {
  if (!assertTrustedOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`portal-put:${clientIp(req)}`, 20)) return rateLimitedResponse();
  const id = sessionIdFromRequest(req);
  if (!id) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const current = await getStudentById(id);
  if (!current) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const studyLevelRaw = clean(body.studyLevel, 20);
  const regionRaw = clean(body.regionPreference, 20);

  current.name = clean(body.name, 80) || current.name;
  current.phone = clean(body.phone, 30);
  current.profile = {
    ...EMPTY_PROFILE,
    ...current.profile,
    studyLevel: LEVELS.includes(studyLevelRaw as StudyLevel)
      ? (studyLevelRaw as StudyLevel)
      : "",
    field: clean(body.field, 80),
    cgpa: clean(body.cgpa, 20),
    englishProof: clean(body.englishProof, 80),
    cityPreference: clean(body.cityPreference, 80),
    regionPreference: REGIONS.includes(regionRaw as (typeof REGIONS)[number])
      ? (regionRaw as (typeof REGIONS)[number])
      : "",
    intake: clean(body.intake, 40),
    notes: clean(body.notes, 2000),
  };

  await upsertStudent(current);
  const payload = await payloadFor(id);
  return NextResponse.json({ ok: true, ...payload });
}
