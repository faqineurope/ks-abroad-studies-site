import { promises as fs } from "fs";
import path from "path";
import { runtimeDataDir } from "@/lib/runtime-data-dir";
import { EMPTY_PROFILE, type PublicStudent, type StudentRecord } from "@/lib/student-types";

const DATA_DIR = runtimeDataDir();
const DATA_PATH = path.join(DATA_DIR, "students.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]\n", "utf8");
  }
}

export async function getStudents(): Promise<StudentRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as StudentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStudents(rows: StudentRecord[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2) + "\n", "utf8");
}

export async function getStudentByEmail(email: string) {
  const needle = email.trim().toLowerCase();
  const rows = await getStudents();
  return rows.find((s) => s.email === needle);
}

export async function getStudentById(id: string) {
  const rows = await getStudents();
  return rows.find((s) => s.id === id);
}

export async function upsertStudent(next: StudentRecord) {
  const rows = await getStudents();
  const index = rows.findIndex((s) => s.id === next.id);
  if (index === -1) rows.push(next);
  else rows[index] = next;
  await saveStudents(rows);
  return next;
}

export function toPublic(student: StudentRecord): PublicStudent {
  const { passwordHash: _omit, ...rest } = student;
  void _omit;
  return {
    ...rest,
    profile: { ...EMPTY_PROFILE, ...student.profile },
    documents: student.documents ?? [],
  };
}
