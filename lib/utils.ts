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
  const readCounts = getReadCountByBook(data.logs, child.id);
  const range = getRecommendedRange(child, data.logs, data.books);
  const profileThemes = new Set(child.favoriteThemes.map((theme) => theme.toLowerCase()));
  const profileSeries = new Set(child.favoriteSeries.map((series) => series.toLowerCase()));
  const wishlistBooksWithAr = data.books.filter(
    (book) => book.shelf === "wishlist" && typeof book.arLevel === "number" && (readCounts[book.id] ?? 0) === 0
  );
  const savedBookKeys = new Set(data.books.map((book) => getBookKey(book.title, book.author)));

  const scoreBook = (book: Book, kind: "comfort" | "next_step", allowNearest = false): BookRecommendation | undefined => {
    if (typeof book.arLevel !== "number") return undefined;
    if (book.shelf !== "wishlist") return undefined;
    const readCount = readCounts[book.id] ?? 0;
    if (readCount > 0) return undefined;

    const target = kind === "comfort" ? range.comfort : range.nextStep;
    const distance = distanceFromRange(book.arLevel, target.min, target.max);
    const isInRange = book.arLevel >= target.min && book.arLevel <= target.max;
    if (!isInRange && !allowNearest) return undefined;

    const matchedThemes = book.themes.filter((theme) => profileThemes.has(theme.toLowerCase()));
    const seriesMatch = book.series ? profileSeries.has(book.series.toLowerCase()) : false;
    let score = 10;
    score -= distance * 3;
    score += matchedThemes.length * 4;
    score += seriesMatch ? 6 : 0;

    const reasonBits = [
      seriesMatch ? `liked ${book.series}` : undefined,
      matchedThemes.length ? `liked ${matchedThemes.join(" and ")} books` : undefined,
      "this is from the wish list with a verified AR/ATOS value",
      isInRange
        ? kind === "next_step"
          ? "this is a gentle next step"
          : "this sits in the current reading range"
        : `this is the closest unread match near AR ${target.min.toFixed(1)}-${target.max.toFixed(1)}`
    ].filter(Boolean);

    return {
      book,
      kind,
      score,
      reason: `Recommended because ${child.name} ${reasonBits.join(" and ")}.`
    };
  };

  const recommendations = data.books
    .flatMap((book) => [scoreBook(book, "comfort"), scoreBook(book, "next_step")])
    .filter((rec): rec is BookRecommendation => Boolean(rec))
    .sort((a, b) => b.score - a.score);
  const localCatalogRecommendations = localArCatalog
    .filter((book) => !savedBookKeys.has(getBookKey(book.title, book.author)))
    .flatMap((book) => [scoreLocalCatalogBook(book, "comfort"), scoreLocalCatalogBook(book, "next_step")])
    .filter((rec): rec is BookRecommendation => Boolean(rec));
  const combinedRecommendations = [...recommendations, ...localCatalogRecommendations].sort((a, b) => b.score - a.score);
  const comfortReads = combinedRecommendations.filter((rec) => rec.kind === "comfort");
  const nextStepBooks = combinedRecommendations.filter((rec) => rec.kind === "next_step");
  const fallbackComfortReads = comfortReads.length
    ? []
    : wishlistBooksWithAr
        .filter((book) => !nextStepBooks.some((rec) => rec.book.id === book.id))
        .filter((book) => distanceFromRange(book.arLevel as number, range.comfort.min, range.comfort.max) <= 0.3)
        .map((book) => scoreBook(book, "comfort", true))
        .filter((rec): rec is BookRecommendation => Boolean(rec))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
  const fallbackNextStepBooks = nextStepBooks.length
    ? []
    : wishlistBooksWithAr
        .filter((book) => !fallbackComfortReads.some((rec) => rec.book.id === book.id))
        .map((book) => scoreBook(book, "next_step", true))
        .filter((rec): rec is BookRecommendation => Boolean(rec))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

  const repeatFavorites = data.books
    .filter((book) => (readCounts[book.id] ?? 0) > 0)
    .map((book): BookRecommendation => {
      const bookLogs = data.logs.filter((log) => log.childId === child.id && log.bookId === book.id);
      const avgLiked = bookLogs.reduce((sum, log) => sum + log.likedScore, 0) / bookLogs.length;
      return {
        book,
        kind: "repeat",
        score: avgLiked + (readCounts[book.id] ?? 0),
        reason: `${child.name} has read this ${readCounts[book.id]} time${readCounts[book.id] === 1 ? "" : "s"} and rated it highly.`
      };
    })
    .filter((rec) => rec.score >= 5)
    .sort((a, b) => b.score - a.score);

  return {
    range,
    comfortReads: comfortReads.length ? comfortReads : fallbackComfortReads,
    nextStepBooks: nextStepBooks.length ? nextStepBooks : fallbackNextStepBooks,
    repeatFavorites
  };

  function scoreLocalCatalogBook(book: LocalCatalogBook, kind: "comfort" | "next_step"): BookRecommendation | undefined {
    const target = kind === "comfort" ? range.comfort : range.nextStep;
    const overlapsRange = book.arRangeMin <= target.max && book.arRangeMax >= target.min;
    if (!overlapsRange) return undefined;

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
      reason: `Recommended because this local catalog book overlaps the ${kind === "comfort" ? "comfort" : "next step"} range and ${child.name} likes ${matchedThemes.length ? matchedThemes.join(" and ") : "similar early-reader"} books. ${book.arRangeMin === book.arRangeMax ? "This imported AR value should still be verified before logging it." : "Verify the exact AR/ATOS before logging it."}`
    };
  }
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function distanceFromRange(value: number, min: number, max: number) {
  if (value >= min && value <= max) return 0;
  return value < min ? min - value : value - max;
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
  return date.toISOString().slice(0, 10);
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
  const value = log.createdAt ?? `${log.readDate}T00:00:00`;
  const time = new Date(value).getTime();
  if (!Number.isNaN(time)) return time;

  const fallback = new Date(`${log.readDate}T00:00:00`).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}
