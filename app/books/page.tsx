"use client";

import { useMemo, useState } from "react";
import { BookCard } from "@/components/BookCard";
import { ChildSelector } from "@/components/ChildSelector";
import { ReadingLogForm } from "@/components/ReadingLogForm";
import { useAppData } from "@/lib/AppContext";
import { getPacificDateInputValue, getReadCountByBook, makeId } from "@/lib/utils";
import type { Book, ReadingLog } from "@/lib/types";

type ReadStatus = "all" | "read" | "unread";

export default function BooksPage() {
  const { data, selectedChild, upsertBook, removeBook, addLog, removeLog } = useAppData();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("");
  const [readStatus, setReadStatus] = useState<ReadStatus>("all");
  const [sessionBook, setSessionBook] = useState<Book | undefined>();

  const readCounts = getReadCountByBook(data.logs, selectedChild?.id);
  const latestReadTimeByBook = useMemo(() => {
    return data.logs.reduce<Record<string, number>>((acc, log) => {
      if (selectedChild?.id && log.childId !== selectedChild.id) return acc;
      acc[log.bookId] = Math.max(acc[log.bookId] ?? 0, getLogSortTime(log));
      return acc;
    }, {});
  }, [data.logs, selectedChild?.id]);
  const themes = Array.from(new Set(data.books.flatMap((book) => book.themes))).sort();
  const filteredBooks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.books
      .filter((book) => {
        const readCount = readCounts[book.id] ?? 0;
        const text = [book.title, book.author, book.series, book.themes.join(" ")].join(" ").toLowerCase();
        const matchesText = !needle || text.includes(needle);
        const matchesTheme = !theme || book.themes.includes(theme);
        const matchesStatus =
          readStatus === "all" ||
          (readStatus === "read" && readCount > 0) ||
          (readStatus === "unread" && readCount === 0);

        return matchesText && matchesTheme && matchesStatus;
      })
      .sort((a, b) => {
        const aLatestRead = latestReadTimeByBook[a.id] ?? 0;
        const bLatestRead = latestReadTimeByBook[b.id] ?? 0;
        if (aLatestRead !== bLatestRead) return bLatestRead - aLatestRead;

        const aReads = readCounts[a.id] ?? 0;
        const bReads = readCounts[b.id] ?? 0;
        if (aReads !== bReads) return bReads - aReads;
        return a.title.localeCompare(b.title);
      });
  }, [data.books, latestReadTimeByBook, query, readCounts, readStatus, theme]);
  const readingBooks = filteredBooks.filter((book) => book.shelf !== "wishlist" && book.shelf !== "archive");
  const wishListBooks = filteredBooks.filter((book) => book.shelf === "wishlist");
  const archivedBooks = filteredBooks.filter((book) => book.shelf === "archive");

  const readBookTotal = data.books.filter((book) => (readCounts[book.id] ?? 0) > 0).length;
  const unreadBookTotal = data.books.length - readBookTotal;

  function quickAddRead(book: Book) {
    if (!selectedChild) return;

    if (book.shelf === "wishlist") {
      upsertBook({ ...book, shelf: "reading" });
    }

    addLog({
      id: makeId("log"),
      childId: selectedChild.id,
      bookId: book.id,
      createdAt: new Date().toISOString(),
      readDate: getPacificDateInputValue(),
      readingMode: "parent_assisted",
      likedScore: 4,
      difficulty: "just_right",
      quizCompleted: false,
      notes: "Quick read count update."
    });
  }

  function quickRemoveRead(book: Book) {
    if (!selectedChild) return;

    const latestLog = data.logs
      .filter((log) => log.childId === selectedChild.id && log.bookId === book.id)
      .sort((a, b) => getLogSortTime(b) - getLogSortTime(a))[0];

    if (latestLog) {
      removeLog(latestLog.id);
    }
  }

  function saveDetailedSession(book: Book, log: ReadingLog) {
    if (book.shelf === "wishlist") {
      upsertBook({ ...book, shelf: "reading" });
    }

    addLog(log);
    setSessionBook(undefined);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_320px] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-berry">Sessions</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Track today's reads</h1>
          <p className="mt-2 text-ink/65">
            Use + for a quick reread count, or add session details when you want difficulty, liked score, quiz, and notes.
          </p>
        </div>
        <ChildSelector />
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_260px]">
          <label>
            <span className="text-sm font-semibold text-ink/70">Search your shelf for today's read</span>
            <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Saved title, author, series, or theme" />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink/70">Theme</span>
            <select className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="">All themes</option>
              {themes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="text-sm font-semibold text-ink/70">Reading status</span>
            <div className="mt-1 grid grid-cols-3 rounded-lg border border-ink/15 bg-cream p-1">
              <StatusButton label="All" count={data.books.length} active={readStatus === "all"} onClick={() => setReadStatus("all")} />
              <StatusButton label="Read" count={readBookTotal} active={readStatus === "read"} onClick={() => setReadStatus("read")} />
              <StatusButton label="Unread" count={unreadBookTotal} active={readStatus === "unread"} onClick={() => setReadStatus("unread")} />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          This searches books already saved in your shelves. To add a new book first, go to the Recommendations tab. Books are ranked by most recent read date first, then read count, then alphabetically.
        </p>
      </section>

      <BookShelfSection
        title="Reading"
        helper="Books in the current reading rotation, ranked by most recent read date first."
        books={readingBooks}
        allBooks={data.books}
        readCounts={readCounts}
        onMarkRead={selectedChild ? setSessionBook : undefined}
        onQuickAddRead={selectedChild ? quickAddRead : undefined}
        onQuickRemoveRead={selectedChild ? quickRemoveRead : undefined}
        onUpdateSeries={(book, seriesValue) => upsertBook({ ...book, series: seriesValue })}
        onMoveToArchive={(book) => upsertBook({ ...book, shelf: "archive" })}
      />

      <BookShelfSection
        title="Wish List"
        helper="Books saved from recommendations. Enter and verify AR/ATOS so they can appear in Comfort Reads or Next Step Books."
        books={wishListBooks}
        allBooks={data.books}
        readCounts={readCounts}
        onMarkRead={selectedChild ? setSessionBook : undefined}
        onQuickAddRead={selectedChild ? quickAddRead : undefined}
        onQuickRemoveRead={selectedChild ? quickRemoveRead : undefined}
        onUpdateSeries={(book, seriesValue) => upsertBook({ ...book, series: seriesValue })}
        onUpdateArLevel={(book, arLevel) => upsertBook({ ...book, arLevel })}
        onMoveToArchive={(book) => upsertBook({ ...book, shelf: "archive" })}
        onRemove={(book) => removeBook(book.id)}
      />

      <BookShelfSection
        title="Past Reads"
        helper="Books read before, returned to the library, or no longer in the current rotation."
        books={archivedBooks}
        allBooks={data.books}
        readCounts={readCounts}
        onUpdateSeries={(book, seriesValue) => upsertBook({ ...book, series: seriesValue })}
        onMoveToReading={(book) => upsertBook({ ...book, shelf: "reading" })}
      />

      {sessionBook && selectedChild ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-modal-title"
          onClick={() => setSessionBook(undefined)}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-skysoft p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h2 id="session-modal-title" className="text-lg font-bold text-ink">
                  Add session: {sessionBook.title}
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Save details for this reading session. Use the quick + button when you only need to add one read.
                </p>
              </div>
              <button
                className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink/60 transition hover:text-ink"
                type="button"
                onClick={() => setSessionBook(undefined)}
              >
                Close
              </button>
            </div>
            <ReadingLogForm
              key={sessionBook.id}
              childId={selectedChild.id}
              books={[sessionBook]}
              initialBookId={sessionBook.id}
              onSave={(log) => saveDetailedSession(sessionBook, log)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookShelfSection({
  title,
  helper,
  books,
  allBooks,
  readCounts,
  onMarkRead,
  onQuickAddRead,
  onQuickRemoveRead,
  onUpdateSeries,
  onUpdateArLevel,
  onMoveToArchive,
  onMoveToReading,
  onRemove
}: {
  title: string;
  helper: string;
  books: Book[];
  allBooks: Book[];
  readCounts: Record<string, number>;
  onMarkRead?: (book: Book) => void;
  onQuickAddRead?: (book: Book) => void;
  onQuickRemoveRead?: (book: Book) => void;
  onUpdateSeries?: (book: Book, series: string | undefined) => void;
  onUpdateArLevel?: (book: Book, arLevel: number | undefined) => void;
  onMoveToArchive?: (book: Book) => void;
  onMoveToReading?: (book: Book) => void;
  onRemove?: (book: Book) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink/60">{helper}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/60">{books.length} books</span>
      </div>
      {books.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              readCount={readCounts[book.id] ?? 0}
              onMarkRead={onMarkRead}
              onQuickAddRead={onQuickAddRead}
              onQuickRemoveRead={onQuickRemoveRead}
              onUpdateSeries={onUpdateSeries}
              onUpdateArLevel={onUpdateArLevel}
              onMoveToArchive={onMoveToArchive}
              onMoveToReading={onMoveToReading}
              suggestedSeries={inferSeriesForBook(book, allBooks)}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/60">No books match the current filters.</p>
      )}
    </section>
  );
}

function inferSeriesForBook(book: Book, allBooks: Book[]) {
  if (book.series) return undefined;

  const title = normalizeText(book.title);
  const author = normalizeText(book.author);
  const matchingSavedSeries = allBooks.find((candidate) => {
    if (!candidate.series || candidate.id === book.id) return false;
    const series = normalizeText(candidate.series);
    const sameAuthor = !author || normalizeText(candidate.author) === author;
    return sameAuthor && title.includes(series);
  })?.series;
  if (matchingSavedSeries) return matchingSavedSeries;

  const prefix = getSeriesPrefix(book.title);
  if (prefix) return prefix;

  return undefined;
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

function getSeriesPrefix(title: string) {
  const colonPrefix = title.split(":")[0]?.trim();
  if (colonPrefix && colonPrefix !== title && colonPrefix.length <= 36) return colonPrefix;

  const dashPrefix = title.split(" - ")[0]?.trim();
  if (dashPrefix && dashPrefix !== title && dashPrefix.length <= 36) return dashPrefix;

  return undefined;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function StatusButton({
  label,
  count,
  active,
  onClick
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-leaf shadow-sm" : "text-ink/65 hover:text-ink"
      }`}
      type="button"
      onClick={onClick}
    >
      {label} <span className="text-xs text-ink/50">{count}</span>
    </button>
  );
}
