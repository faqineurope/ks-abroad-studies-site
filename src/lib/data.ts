import { promises as fs } from "fs";
import path from "path";
import { bustCacheTag, cachedJsonReader, CACHE_TAGS } from "@/lib/cache";
import type {
  Program,
  ProgramLevel,
  UniversitiesDataset,
  University,
} from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "src/data/universities.json");

async function readDatasetFromDisk(): Promise<UniversitiesDataset> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as UniversitiesDataset;
}

/** Cached catalogue read — safe for high-traffic public pages. */
export async function getDataset(): Promise<UniversitiesDataset> {
  return cachedJsonReader(CACHE_TAGS.universities, "universities-dataset", readDatasetFromDisk);
}

/** Uncached read for admin mutations. */
export async function getDatasetFresh(): Promise<UniversitiesDataset> {
  return readDatasetFromDisk();
}

export async function saveDataset(dataset: UniversitiesDataset): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(dataset, null, 2) + "\n", "utf8");
  bustCacheTag(CACHE_TAGS.universities);
}

export async function getUniversities(): Promise<University[]> {
  const dataset = await getDataset();
  return [...dataset.universities].sort((a, b) => {
    const pa = a.priority ?? 99;
    const pb = b.priority ?? 99;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });
}

export async function getUniversity(id: string): Promise<University | undefined> {
  const universities = await getUniversities();
  return universities.find((u) => u.id === id);
}

export async function getPrograms(level?: ProgramLevel): Promise<
  Array<Program & { universityId: string; universityName: string; city: string }>
> {
  const universities = await getUniversities();
  const rows: Array<
    Program & { universityId: string; universityName: string; city: string }
  > = [];

  for (const uni of universities) {
    for (const program of uni.programs) {
      if (level && program.level !== level) continue;
      rows.push({
        ...program,
        universityId: uni.id,
        universityName: uni.name,
        city: uni.city,
      });
    }
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMeta() {
  const dataset = await getDataset();
  const statusCounts = dataset.universities.reduce(
    (acc, u) => {
      acc[u.status] = (acc[u.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  return {
    intake: dataset.intake,
    lastUpdated: dataset.lastUpdated,
    sourceNote: dataset.sourceNote,
    nextFeeReview: dataset.nextFeeReview ?? null,
    universitalyPreEnrolmentDeadline:
      dataset.universitalyPreEnrolmentDeadline ?? "2026-11-30",
    universityCount: dataset.universities.length,
    programCount: dataset.universities.reduce(
      (sum, u) => sum + u.programs.length,
      0,
    ),
    bachelorCount: dataset.universities.reduce(
      (sum, u) => sum + u.programs.filter((p) => p.level === "bachelor").length,
      0,
    ),
    masterCount: dataset.universities.reduce(
      (sum, u) => sum + u.programs.filter((p) => p.level === "master").length,
      0,
    ),
    singleCycleCount: dataset.universities.reduce(
      (sum, u) =>
        sum + u.programs.filter((p) => p.level === "single-cycle").length,
      0,
    ),
    openCount: statusCounts.open ?? 0,
    soonCount: statusCounts.soon ?? 0,
    closedCount: statusCounts.closed ?? 0,
  };
}
