import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFee(fee: number | null): string {
  if (fee === null) return "Check portal";
  if (fee === 0) return "No fee";
  return `€${fee}`;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Open";
    case "soon":
      return "Opening soon";
    case "closed":
      return "Closed";
    case "tba":
      return "Check portal";
    default:
      return "Check portal";
  }
}

/** Formats ISO dates (2026-11-30) or keeps human estimates readable. */
export function formatAdmissionDate(
  value: string | null | undefined,
  options?: { status?: string; emptyLabel?: string },
): string {
  if (!value) {
    if (options?.emptyLabel) return options.emptyLabel;
    if (options?.status === "open") return "Now open";
    return "Check portal";
  }
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00Z`);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (value.toLowerCase().startsWith("estimated ")) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

export function regionLabel(region: string): string {
  switch (region) {
    case "lazio":
      return "Lazio";
    case "south":
      return "South";
    case "centre":
      return "Centre";
    case "north":
      return "North";
    default:
      return region;
  }
}
