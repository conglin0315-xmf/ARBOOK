"use client";

import { seedData } from "./seed";
import { isSupabaseConfigured, supabaseRequest } from "./supabase";
import type { AppData, Book, ChildProfile, ReadingLog } from "./types";

type ChildProfileRow = {
  id: string;
  name: string;
  age: number | null;
  grade: string | null;
  current_comfort_ar_min: number | null;
  current_comfort_ar_max: number | null;
  favorite_themes: string[] | null;
  favorite_series: string[] | null;
};

type BookRow = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  series: string | null;
  ar_level: number | null;
  interest_level: string | null;
  lexile: string | null;
  ar_points: number | null;
  cover_url: string | null;
  themes: string[] | null;
  shelf: "reading" | "wishlist" | "archive" | null;
};

type ReadingLogRow = {
  id: string;
  child_id: string;
  book_id: string;
  read_date: string;
  created_at: string | null;
  reading_mode: ReadingLog["readingMode"];
  liked_score: ReadingLog["likedScore"] | null;
  difficulty: ReadingLog["difficulty"] | null;
  quiz_completed: boolean | null;
  quiz_score: number | null;
  notes: string | null;
};

export async function loadSupabaseData(accessToken: string): Promise<AppData> {
  if (!isSupabaseConfigured) return seedData;

  const [childrenResult, booksResult, logsResult] = await Promise.all([
    supabaseRequest<ChildProfileRow[]>("child_profiles?select=*&order=created_at.asc", { accessToken }),
    supabaseRequest<BookRow[]>("books?select=*&order=title.asc", { accessToken }),
    supabaseRequest<ReadingLogRow[]>("reading_logs?select=*&order=created_at.asc", { accessToken })
  ]);

  const children = childrenResult.map(fromChildRow);
  const books = booksResult.map(fromBookRow);
  const logs = logsResult.map(fromLogRow);

  if (children.length === 0 && books.length === 0 && logs.length === 0) {
    await replaceSupabaseData(seedData, accessToken);
    return seedData;
  }

  return {
    children,
    books,
    logs,
    selectedChildId: children[0]?.id
  };
}

export async function claimUnownedSupabaseData(accessToken: string) {
  if (!isSupabaseConfigured) return;
  await supabaseRequest("rpc/claim_unowned_reading_tracker_data", {
    method: "POST",
    accessToken,
    body: JSON.stringify({})
  });
}

export async function upsertSupabaseChild(child: ChildProfile, accessToken: string) {
  await upsertRows("child_profiles", [toChildRow(child)], accessToken);
}

export async function upsertSupabaseBook(book: Book, accessToken: string) {
  await upsertRows("books", [toBookRow(book)], accessToken);
}

export async function removeSupabaseBook(bookId: string, accessToken: string) {
  await deleteById("books", bookId, accessToken);
}

export async function addSupabaseLog(log: ReadingLog, accessToken: string) {
  await insertRows("reading_logs", [toLogRow(log)], accessToken);
}

export async function upsertSupabaseLog(log: ReadingLog, accessToken: string) {
  await upsertRows("reading_logs", [toLogRow(log)], accessToken);
}

export async function removeSupabaseLog(logId: string, accessToken: string) {
  await deleteById("reading_logs", logId, accessToken);
}

export async function replaceSupabaseData(data: AppData, accessToken: string) {
  if (!isSupabaseConfigured) return;

  await deleteAllRows("reading_logs", accessToken);
  await deleteAllRows("books", accessToken);
  await deleteAllRows("child_profiles", accessToken);

  if (data.children.length) {
    await insertRows("child_profiles", data.children.map(toChildRow), accessToken);
  }

  if (data.books.length) {
    await insertRows("books", data.books.map(toBookRow), accessToken);
  }

  if (data.logs.length) {
    await insertRows("reading_logs", data.logs.map(toLogRow), accessToken);
  }
}

function toChildRow(child: ChildProfile): ChildProfileRow {
  return {
    id: child.id,
    name: child.name,
    age: child.age,
    grade: child.grade,
    current_comfort_ar_min: child.currentComfortArMin,
    current_comfort_ar_max: child.currentComfortArMax,
    favorite_themes: child.favoriteThemes,
    favorite_series: child.favoriteSeries
  };
}

function fromChildRow(row: ChildProfileRow): ChildProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? 0,
    grade: row.grade ?? "",
    currentComfortArMin: row.current_comfort_ar_min ?? 0,
    currentComfortArMax: row.current_comfort_ar_max ?? 0,
    favoriteThemes: row.favorite_themes ?? [],
    favoriteSeries: row.favorite_series ?? []
  };
}

function toBookRow(book: Book): BookRow {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? null,
    series: book.series ?? null,
    ar_level: book.arLevel ?? null,
    interest_level: book.interestLevel ?? null,
    lexile: book.lexile ?? null,
    ar_points: book.arPoints ?? null,
    cover_url: book.coverUrl ?? null,
    themes: book.themes,
    shelf: book.shelf ?? "reading"
  };
}

function fromBookRow(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    isbn: row.isbn ?? undefined,
    series: row.series ?? undefined,
    arLevel: row.ar_level ?? undefined,
    interestLevel: row.interest_level ?? undefined,
    lexile: row.lexile ?? undefined,
    arPoints: row.ar_points ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    themes: row.themes ?? [],
    shelf: row.shelf ?? "reading"
  };
}

function toLogRow(log: ReadingLog): ReadingLogRow {
  return {
    id: log.id,
    child_id: log.childId,
    book_id: log.bookId,
    read_date: log.readDate,
    created_at: log.createdAt ?? new Date().toISOString(),
    reading_mode: log.readingMode,
    liked_score: log.likedScore,
    difficulty: log.difficulty,
    quiz_completed: log.quizCompleted,
    quiz_score: log.quizScore ?? null,
    notes: log.notes ?? null
  };
}

function fromLogRow(row: ReadingLogRow): ReadingLog {
  return {
    id: row.id,
    childId: row.child_id,
    bookId: row.book_id,
    createdAt: row.created_at ?? undefined,
    readDate: row.read_date,
    readingMode: row.reading_mode,
    likedScore: row.liked_score ?? 3,
    difficulty: row.difficulty ?? "just_right",
    quizCompleted: row.quiz_completed ?? false,
    quizScore: row.quiz_score ?? undefined,
    notes: row.notes ?? undefined
  };
}

async function insertRows(table: string, rows: unknown[], accessToken: string) {
  if (!isSupabaseConfigured || rows.length === 0) return;
  await supabaseRequest(table, {
    method: "POST",
    accessToken,
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(rows)
  });
}

async function upsertRows(table: string, rows: unknown[], accessToken: string) {
  if (!isSupabaseConfigured || rows.length === 0) return;
  await supabaseRequest(`${table}?on_conflict=id`, {
    method: "POST",
    accessToken,
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows)
  });
}

async function deleteById(table: string, id: string, accessToken: string) {
  if (!isSupabaseConfigured) return;
  await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    accessToken
  });
}

async function deleteAllRows(table: string, accessToken: string) {
  if (!isSupabaseConfigured) return;
  await supabaseRequest(`${table}?id=neq.${encodeURIComponent("")}`, {
    method: "DELETE",
    accessToken
  });
}
