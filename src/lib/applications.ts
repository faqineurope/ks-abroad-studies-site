import { promises as fs } from "fs";
import path from "path";
import {
  APPLICATION_STATUSES,
  applicationStatusLabel,
  type ApplicationPack,
  type ApplicationStatus,
  type PackItem,
  type StudentApplication,
} from "@/lib/application-types";
import { getCasesForStudent } from "@/lib/consultancy";
import { getUniversities } from "@/lib/data";
import { runtimeDataDir } from "@/lib/runtime-data-dir";
import {
  DOCUMENT_KINDS,
  type DocumentKind,
  type PublicStudent,
  type StudyLevel,
} from "@/lib/student-types";

export type {
  ApplicationPack,
  ApplicationStatus,
  ApplicationStatusEvent,
  PackItem,
  StudentApplication,
} from "@/lib/application-types";
export { APPLICATION_STATUSES, applicationStatusLabel };

const DATA_DIR = runtimeDataDir();
const DATA_PATH = path.join(DATA_DIR, "applications.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]\n", "utf8");
  }
}

export async function getApplications(): Promise<StudentApplication[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as StudentApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveApplications(rows: StudentApplication[]) {
  await ensureStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

export async function getApplicationsForStudent(studentId: string) {
  const rows = await getApplications();
  return rows
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getApplicationById(id: string) {
  const rows = await getApplications();
  return rows.find((a) => a.id === id) ?? null;
}

/** Active consultancy unlocks the apply hub. */
export async function studentHasActiveConsultancy(studentId: string) {
  const cases = await getCasesForStudent(studentId);
  return cases.some((c) => c.status === "open" || c.status === "in_progress");
}

export function buildPackForStudent(student: PublicStudent): PackItem[] {
  const required: DocumentKind[] = ["passport", "transcript", "degree", "english"];
  return DOCUMENT_KINDS.map((kind) => {
    const docs = (student.documents ?? []).filter((d) => d.kind === kind.id);
    const latest = docs[docs.length - 1];
    return {
      kind: kind.id,
      label: kind.label,
      required: required.includes(kind.id),
      present: Boolean(latest),
      documentId: latest?.id,
      originalName: latest?.originalName,
    };
  });
}

export function packSummary(items: PackItem[]): Omit<ApplicationPack, "applicationId"> {
  const required = items.filter((i) => i.required);
  const readyCount = required.filter((i) => i.present).length;
  return {
    items,
    readyCount,
    requiredCount: required.length,
    complete: readyCount === required.length,
  };
}

export async function createApplication(input: {
  studentId: string;
  universityId: string;
  programName?: string;
  level?: StudyLevel | "";
  consultancyCaseId?: string | null;
}): Promise<{ ok: true; application: StudentApplication } | { ok: false; error: string }> {
  const unlocked = await studentHasActiveConsultancy(input.studentId);
  if (!unlocked) {
    return {
      ok: false,
      error:
        "Start consultancy first (Step 4). Apply hub unlocks after you open a case with KS Abroad.",
    };
  }

  const universities = await getUniversities();
  const uni = universities.find((u) => u.id === input.universityId);
  if (!uni) return { ok: false, error: "University not found in catalogue." };

  const programName = (input.programName || "").trim();
  if (programName) {
    const known = uni.programs.some(
      (p) => p.name.toLowerCase() === programName.toLowerCase(),
    );
    if (!known) {
      // Allow free-text programme names for assisted apply outside listed English set
    }
  }

  const now = new Date().toISOString();
  const application: StudentApplication = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    universityId: uni.id,
    universityName: uni.name,
    programName: programName || uni.programs[0]?.name || "Programme TBD",
    level: input.level || uni.programs[0]?.level || "",
    portalUrl: uni.admissionPortal,
    consultancyCaseId: input.consultancyCaseId || null,
    status: "requested",
    staffNote: "",
    createdAt: now,
    updatedAt: now,
    history: [
      {
        at: now,
        status: "requested",
        by: "student",
        note: "Student requested assisted apply via portal.",
      },
    ],
  };

  const rows = await getApplications();
  rows.push(application);
  await saveApplications(rows);
  return { ok: true, application };
}

export async function updateApplicationStatus(input: {
  id: string;
  status: ApplicationStatus;
  staffNote?: string;
}): Promise<StudentApplication | null> {
  const rows = await getApplications();
  const index = rows.findIndex((a) => a.id === input.id);
  if (index === -1) return null;
  const row = rows[index];
  const now = new Date().toISOString();
  row.status = input.status;
  if (input.staffNote !== undefined) row.staffNote = input.staffNote;
  row.updatedAt = now;
  row.history.push({
    at: now,
    status: input.status,
    by: "staff",
    note: input.staffNote?.trim() || undefined,
  });
  rows[index] = row;
  await saveApplications(rows);
  return row;
}
