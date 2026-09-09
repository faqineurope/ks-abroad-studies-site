export type AdmissionStatus = "open" | "soon" | "closed" | "tba";

export type ApplyLinkType = "portal" | "tutorial" | "universitaly";

export type ProgramLevel = "bachelor" | "master" | "single-cycle";

export interface ApplyLink {
  label: string;
  url: string;
  type: ApplyLinkType;
}

export interface Program {
  name: string;
  level: ProgramLevel;
  applyUrl: string | null;
  field: string;
  /** e.g. CEnT-S, IMAT, TIL-I — confirm each call */
  admissionTest?: string | null;
}

export type ItalyRegion = "lazio" | "south" | "centre" | "north";

export interface University {
  id: string;
  name: string;
  city: string;
  region: ItalyRegion;
  priority: number;
  website: string;
  admissionPortal: string;
  applicationFeeEuro: number | null;
  englishRequirement: string;
  cgpaRequirement: string;
  requiresCimea: boolean;
  status: AdmissionStatus;
  estimatedOpenDate: string | null;
  deadline: string | null;
  notes: string;
  applyLinks: ApplyLink[];
  programs: Program[];
}

export interface UniversitiesDataset {
  intake: string;
  lastUpdated: string;
  sourceNote: string;
  /** ISO date — MUR / Universitaly pre-enrolment deadline for non-EU students */
  universitalyPreEnrolmentDeadline?: string;
  universities: University[];
}
