import type {
  AppData,
  Book,
  BookRecommendation,
  ChildProfile,
  ReadingLog
} from "./types";
import { localArCatalog, type LocalCatalogBook } from "./localArCatalog";

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function splitTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function formatTags(tags: string[]) {
  return tags.join(", ");
}

export function getPacificDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return date.toLocaleDateString("en-CA");
  return `${year}-${month}-${day}`;
}

export function getReadCountByBook(logs: ReadingLog[], childId?: string) {
  return logs.reduce<Record<string, number>>((acc, log) => {
    if (childId && log.childId !== childId) return acc;
    acc[log.bookId] = (acc[log.bookId] ?? 0) + 1;
    return acc;
  }, {});
}

export function calculateRecentAverageAr(logs: ReadingLog[], books: Book[], childId: string) {
  const bookById = new Map(books.map((book) => [book.id, book]));
  const levels = logs
    .filter((log) => log.childId === childId)
    .sort((a, b) => getLogSortTime(b) - getLogSortTime(a))
    .slice(0, 10)
    .map((log) => bookById.get(log.bookId)?.arLevel)
    .filter((level): level is number => typeof level === "number");

  if (!levels.length) return undefined;
  return roundOne(levels.reduce((sum, level) => sum + level, 0) / levels.length);
}

export function getRecommendedRange(child: ChildProfile, logs: ReadingLog[], books: Book[]) {
  const recentAverage = calculateRecentAverageAr(logs, books, child.id);
  const lastFive = logs
    .filter((log) => log.childId === child.id)
    .sort((a, b) => getLogSortTime(b) - getLogSortTime(a))
    .slice(0, 5);

  const tooHardCount = lastFive.filter((log) => log.difficulty === "too_hard").length;
  const tooEasyCount = lastFive.filter((log) => log.difficulty === "too_easy").length;
  const adjustment = tooHardCount >= 3 ? -0.2 : tooEasyCount >= 3 ? 0.2 : 0;
  const comfortMin = Math.max(0, child.currentComfortArMin + adjustment);
  const comfortMax = Math.max(comfortMin, child.currentComfortArMax + adjustment);

  return {
    recentAverage,
    adjustment,
    comfort: {
      min: roundOne(comfortMin),
      max: roundOne(comfortMax)
    },
    nextStep: {
      min: roundOne(comfortMax + 0.1),
      max: roundOne(comfortMax + 0.3)
    }
  };
}

export function calculateChildStats(data: AppData, childId: string) {
  const childLogs = data.logs.filter((log) => log.childId === childId);
  const bookById = new Map(data.books.map((book) => [book.id, book]));
  const thirtyDayAnchorDate = getLatestLogDate(childLogs) ?? new Date();
  const thirtyDayLogs = childLogs.filter((log) => isWithinLastDays(log.readDate, 30, thirtyDayAnchorDate));
  const priorThirtyDayLogs = childLogs.filter((log) => isWithinDayRange(log.readDate, 60, 31, thirtyDayAnchorDate));
  const readCounts = getReadCountByBook(data.logs, childId);
  const thirtyDayReadCounts = getReadCountByBook(thirtyDayLogs);
  const priorThirtyDayReadCounts = getReadCountByBook(priorThirtyDayLogs);
  const completedBooks = Object.keys(readCounts).length;
  const arLevels = childLogs
    .map((log) => bookById.get(log.bookId)?.arLevel)
    .filter((level): level is number => typeof level === "number");
  const averageArLevel = arLevels.length
    ? roundOne(arLevels.reduce((sum, level) => sum + level, 0) / arLevels.length)
    : undefined;
  const thirtyDayArLevels = thirtyDayLogs
    .map((log) => bookById.get(log.bookId)?.arLevel)
    .filter((level): level is number => typeof level === "number");
  const thirtyDayAverageArLevel = thirtyDayArLevels.length
    ? roundOne(thirtyDayArLevels.reduce((sum, level) => sum + level, 0) / thirtyDayArLevels.length)
    : undefined;
  const priorThirtyDayArLevels = priorThirtyDayLogs
    .map((log) => bookById.get(log.bookId)?.arLevel)
    .filter((level): level is number => typeof level === "number");
  const priorThirtyDayAverageArLevel = priorThirtyDayArLevels.length
    ? roundOne(priorThirtyDayArLevels.reduce((sum, level) => sum + level, 0) / priorThirtyDayArLevels.length)
    : undefined;
  const thirtyDayAverageWeeklySessions = roundOne((thirtyDayLogs.length / 30) * 7);
  const priorThirtyDayAverageWeeklySessions = roundOne((priorThirtyDayLogs.length / 30) * 7);
  const thirtyDayBooksRead = Object.keys(thirtyDayReadCounts).length;
  const priorThirtyDayBooksRead = Object.keys(priorThirtyDayReadCounts).length;

  const mostReadEntry = Object.entries(readCounts).sort((a, b) => b[1] - a[1])[0];
  const mostReadBook = mostReadEntry ? bookById.get(mostReadEntry[0]) : undefined;

  const seriesScores = childLogs.reduce<Record<string, { score: number; count: number }>>((acc, log) => {
    const book = bookById.get(log.bookId);
    if (!book?.series) return acc;
    acc[book.series] = acc[book.series] ?? { score: 0, count: 0 };
    acc[book.series].score += log.likedScore;
    acc[book.series].count += 1;
    return acc;
  }, {});
  const favoriteSeries = Object.entries(seriesScores)
    .sort((a, b) => b[1].score + b[1].count - (a[1].score + a[1].count))
    .map(([series]) => series)[0];

  return {
    totalBooksRead: completedBooks,
    totalReadingSessions: childLogs.length,
    averageArLevel,
    thirtyDayBooksRead,
    thirtyDayReadingSessions: thirtyDayLogs.length,
    thirtyDayAverageWeeklySessions,
    thirtyDayAverageArLevel,
    thirtyDayComparisons: {
      booksRead: getPercentComparison(thirtyDayBooksRead, priorThirtyDayBooksRead),
      averageWeeklySessions: getPercentComparison(thirtyDayAverageWeeklySessions, priorThirtyDayAverageWeeklySessions),
      averageArLevel:
        typeof thirtyDayAverageArLevel === "number" && typeof priorThirtyDayAverageArLevel === "number"
          ? getPercentComparison(thirtyDayAverageArLevel, priorThirtyDayAverageArLevel)
          : undefined
    },
    thirtyDayRangeEnd: formatDateOnly(thirtyDayAnchorDate),
    mostReadBook,
    favoriteSeries,
    recentLogs: childLogs.sort((a, b) => getLogSortTime(b) - getLogSortTime(a)).slice(0, 5)
  };
}

export function recommendBooks(data: AppData, child: ChildProfile) {
  const range = getRecommendedRange(child, data.logs, data.books);
  const profileThemes = new Set(child.favoriteThemes.map((theme) => theme.toLowerCase()));
  const profileSeries = new Set(child.favoriteSeries.map((series) => series.toLowerCase()));
  const savedBookKeys = new Set(data.books.map((book) => getBookKey(book.title, book.author)));

  const unsavedCatalogBooks = localArCatalog
    .filter((book) => !savedBookKeys.has(getBookKey(book.title, book.author)));
  const localCatalogRecommendations = unsavedCatalogBooks
    .flatMap((book) => [scoreLocalCatalogBook(book, "comfort"), scoreLocalCatalogBook(book, "next_step")])
    .filter((rec): rec is BookRecommendation => Boolean(rec));
  const sortedRecommendations = localCatalogRecommendations.sort((a, b) => b.score - a.score);
  const comfortReads = sortedRecommendations.filter((rec) => rec.kind === "comfort");
  const nextStepBooks = sortedRecommendations.filter((rec) => rec.kind === "next_step");
  const fallbackComfortReads = comfortReads.length
    ? []
    : unsavedCatalogBooks
        .map((book) => scoreLocalCatalogBook(book, "comfort", true))
        .filter((rec): rec is BookRecommendation => Boolean(rec))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
  const fallbackNextStepBooks = nextStepBooks.length
    ? []
    : unsavedCatalogBooks
        .filter((book) => !fallbackComfortReads.some((rec) => rec.book.id === book.id))
        .map((book) => scoreLocalCatalogBook(book, "next_step", true))
        .filter((rec): rec is BookRecommendation => Boolean(rec))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

  return {
    range,
    comfortReads: comfortReads.length ? comfortReads : fallbackComfortReads,
    nextStepBooks: nextStepBooks.length ? nextStepBooks : fallbackNextStepBooks
  };

  function scoreLocalCatalogBook(book: LocalCatalogBook, kind: "comfort" | "next_step", allowNearest = false): BookRecommendation | undefined {
    const target = kind === "comfort" ? range.comfort : range.nextStep;
    const overlapsRange = book.arRangeMin <= target.max && book.arRangeMax >= target.min;
    if (!overlapsRange && !allowNearest) return undefined;

    const matchedThemes = book.themes.filter((theme) => profileThemes.has(theme.toLowerCase()));
    const seriesMatch = book.series ? profileSeries.has(book.series.toLowerCase()) : false;
    let score = 7;
    score += matchedThemes.length * 4;
    score += seriesMatch ? 6 : 0;
    score -= distanceBetweenRanges(book.arRangeMin, book.arRangeMax, target.min, target.max) * 2;

    return {
      book,
      kind,
      score,
      sourceName: book.sourceName,
      sourceUrl: book.sourceUrl,
      sourceArRange:
        book.arRangeMin === book.arRangeMax
          ? `AR ${book.arRangeMin.toFixed(1)}`
          : `BL ${book.arRangeMin.toFixed(1)}-${book.arRangeMax.toFixed(1)}`,
      reason: `Recommended because this not-yet-saved local catalog book ${overlapsRange ? "overlaps" : "is near"} the ${kind === "comfort" ? "comfort" : "next level"} range and ${child.name} likes ${matchedThemes.length ? matchedThemes.join(" and ") : "similar early-reader"} books. ${book.arRangeMin === book.arRangeMax ? "This imported AR value should still be verified before logging it." : "Verify the exact AR/ATOS before logging it."}`
    };
  }
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function distanceBetweenRanges(aMin: number, aMax: number, bMin: number, bMax: number) {
  if (aMin <= bMax && aMax >= bMin) return 0;
  return aMax < bMin ? bMin - aMax : aMin - bMax;
}

function getBookKey(title: string, author: string) {
  return `${title} ${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isWithinLastDays(dateValue: string, days: number, anchorDate: Date) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const start = new Date(anchorDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const end = new Date(anchorDate);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
}

function isWithinDayRange(dateValue: string, startDaysAgo: number, endDaysAgo: number, anchorDate: Date) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const start = new Date(anchorDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (startDaysAgo - 1));

  const end = new Date(anchorDate);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - (endDaysAgo - 1));

  return date >= start && date <= end;
}

function getLatestLogDate(logs: ReadingLog[]) {
  const dates = logs
    .map((log) => new Date(`${log.readDate}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0];
}

function formatDateOnly(date: Date) {
  return getPacificDateInputValue(date);
}

function getPercentComparison(current: number, prior: number) {
  if (prior === 0) {
    if (current === 0) return { label: "0% vs prior 30 days", direction: "flat" as const };
    return { label: "No prior data", direction: "none" as const };
  }

  const percent = Math.round(((current - prior) / prior) * 100);
  const prefix = percent > 0 ? "+" : "";
  return {
    label: `${prefix}${percent}% vs prior 30 days`,
    direction: percent > 0 ? ("up" as const) : percent < 0 ? ("down" as const) : ("flat" as const)
  };
}

function getLogSortTime(log: ReadingLog) {
  const readDateTime = new Date(`${log.readDate}T00:00:00`).getTime();
  const dateTime = Number.isNaN(readDateTime) ? 0 : readDateTime;

  if (!log.createdAt) return dateTime;

  const createdAt = new Date(log.createdAt);
  if (Number.isNaN(createdAt.getTime())) return dateTime;

  const tieBreakerMs =
    createdAt.getUTCHours() * 60 * 60 * 1000 +
    createdAt.getUTCMinutes() * 60 * 1000 +
    createdAt.getUTCSeconds() * 1000 +
    createdAt.getUTCMilliseconds();

  return dateTime + tieBreakerMs;
}
