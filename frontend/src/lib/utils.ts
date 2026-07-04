import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function scoreBand(score: number) {
  if (score >= 90) return { label: "Excellent", color: "#16a34a" };
  if (score >= 80) return { label: "Very Good", color: "#22c55e" };
  if (score >= 70) return { label: "Good", color: "#3b82f6" };
  if (score >= 55) return { label: "Average", color: "#f59e0b" };
  return { label: "Low", color: "#ef4444" };
}
