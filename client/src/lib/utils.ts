import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function displayDate(dateValue: string | Date): string {
  if (dateValue instanceof Date) {
    const y = dateValue.getFullYear();
    const m = String(dateValue.getMonth() + 1).padStart(2, "0");
    const d = String(dateValue.getDate()).padStart(2, "0");
    return new Date(`${y}-${m}-${d}T12:00:00`).toLocaleDateString();
  }
  const str = String(dateValue).slice(0, 10);
  return new Date(str + "T12:00:00").toLocaleDateString();
}

export function displayDateTime(dateValue: string | Date): string {
  const d = new Date(String(dateValue));
  if (isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
