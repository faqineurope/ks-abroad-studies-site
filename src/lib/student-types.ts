export const CONSENT_POLICY_VERSION =
  process.env.CONSENT_POLICY_VERSION?.trim() || "2026-09-20";

export type StudentConsent = {
  /** Privacy Policy accepted */
  privacyAcceptedAt: string;
  /** Terms / consultancy agreement accepted */
  termsAcceptedAt: string;
  /** Version string of policies at acceptance time */
  policyVersion: string;
  /** Optional marketing / WhatsApp updates */
  marketingOptIn: boolean;
  marketingOptInAt?: string;
  /** IP captured at registration (abuse + accountability) */
  acceptedFromIp?: string;
  /** User-agent snapshot (truncated) */
  acceptedUserAgent?: string;
};

export type StudyLevel = "bachelor" | "master" | "single-cycle" | "phd";

export type DocumentKind =
  | "passport"
  | "transcript"
  | "degree"
  | "english"
  | "other";

export type StudentProfile = {
  studyLevel: StudyLevel | "";
  field: string;
  cgpa: string;
  englishProof: string;
  cityPreference: string;
  regionPreference: "lazio" | "south" | "centre" | "north" | "";
  intake: string;
  notes: string;
};

export type StudentDocument = {
  id: string;
  kind: DocumentKind;
  originalName: string;
  storedName: string;
  uploadedAt: string;
};

export type StudentRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  createdAt: string;
  profile: StudentProfile;
  documents: StudentDocument[];
  /** Required for new accounts — lawful basis = consent */
  consent?: StudentConsent;
};

export type PublicStudent = Omit<StudentRecord, "passwordHash">;

export const EMPTY_PROFILE: StudentProfile = {
  studyLevel: "",
  field: "",
  cgpa: "",
  englishProof: "",
  cityPreference: "",
  regionPreference: "",
  intake: "",
  notes: "",
};

export const DOCUMENT_KINDS: Array<{ id: DocumentKind; label: string }> = [
  { id: "passport", label: "Passport" },
  { id: "transcript", label: "Transcripts" },
  { id: "degree", label: "Degree / HSSC" },
  { id: "english", label: "English proof (IELTS / MOI)" },
  { id: "other", label: "Other" },
];
