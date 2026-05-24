"use client";

import { seedData } from "./seed";
import type { AppData } from "./types";

export const STORAGE_KEY = "ar-reading-tracker-v1";

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveData(seedData);
    return seedData;
  }

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    saveData(seedData);
    return seedData;
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data: AppData) {
  return JSON.stringify(data, null, 2);
}

export function importData(raw: string): AppData {
  const parsed = JSON.parse(raw) as AppData;
  if (!Array.isArray(parsed.children) || !Array.isArray(parsed.books) || !Array.isArray(parsed.logs)) {
    throw new Error("Backup must include children, books, and logs arrays.");
  }
  return parsed;
}
