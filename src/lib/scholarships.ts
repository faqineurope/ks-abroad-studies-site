import { promises as fs } from "fs";
import path from "path";
import type {
  RegionalScholarship,
  ScholarshipsDataset,
} from "@/lib/scholarship-types";

const DATA_PATH = path.join(process.cwd(), "src/data/regional-scholarships.json");

export async function getScholarshipsDataset(): Promise<ScholarshipsDataset> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as ScholarshipsDataset;
}

export async function getScholarshipRegions(): Promise<RegionalScholarship[]> {
  const dataset = await getScholarshipsDataset();
  return [...dataset.regions].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.region.localeCompare(b.region);
  });
}

export async function getScholarshipRegion(
  id: string,
): Promise<RegionalScholarship | undefined> {
  const regions = await getScholarshipRegions();
  return regions.find((r) => r.id === id);
}
