import { promises as fs } from "fs";
import path from "path";

export type ConsultancyType = "one-to-one" | "private-case";
export type ConsultancyStatus = "open" | "in_progress" | "closed";

export type ConsultancyReply = {
  at: string;
  from: "student" | "staff";
  body: string;
};

export type ConsultancyCase = {
  id: string;
  studentId: string;
  type: ConsultancyType;
  topic: string;
  message: string;
  status: ConsultancyStatus;
  createdAt: string;
  replies: ConsultancyReply[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_PATH = path.join(DATA_DIR, "consultancy-cases.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]\n", "utf8");
  }
}

export async function getCases(): Promise<ConsultancyCase[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as ConsultancyCase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveCases(rows: ConsultancyCase[]) {
  await ensureStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

export async function getCasesForStudent(studentId: string) {
  const rows = await getCases();
  return rows
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCaseById(id: string) {
  const rows = await getCases();
  return rows.find((c) => c.id === id);
}

export async function createCase(input: {
  studentId: string;
  type: ConsultancyType;
  topic: string;
  message: string;
}): Promise<ConsultancyCase> {
  const row: ConsultancyCase = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    type: input.type,
    topic: input.topic,
    message: input.message,
    status: "open",
    createdAt: new Date().toISOString(),
    replies: [],
  };
  const rows = await getCases();
  rows.push(row);
  await saveCases(rows);
  return row;
}

export async function addStudentReply(caseId: string, studentId: string, body: string) {
  const rows = await getCases();
  const index = rows.findIndex((c) => c.id === caseId);
  if (index === -1) return null;
  const row = rows[index];
  if (row.studentId !== studentId) return null;
  row.replies.push({ at: new Date().toISOString(), from: "student", body });
  if (row.status === "closed") row.status = "open";
  rows[index] = row;
  await saveCases(rows);
  return row;
}

export async function addStaffReply(caseId: string, body: string) {
  const rows = await getCases();
  const index = rows.findIndex((c) => c.id === caseId);
  if (index === -1) return null;
  const row = rows[index];
  row.replies.push({ at: new Date().toISOString(), from: "staff", body });
  if (row.status === "open") row.status = "in_progress";
  rows[index] = row;
  await saveCases(rows);
  return row;
}

export async function updateCaseStatus(caseId: string, status: ConsultancyStatus) {
  const rows = await getCases();
  const index = rows.findIndex((c) => c.id === caseId);
  if (index === -1) return null;
  rows[index].status = status;
  await saveCases(rows);
  return rows[index];
}
