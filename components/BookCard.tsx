"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";

type BookCardProps = {
  book: Book;
  readCount?: number;
  onMarkRead?: (book: Book) => void;
  onQuickAddRead?: (book: Book) => void;
  onQuickRemoveRead?: (book: Book) => void;
  onUpdateArLevel?: (book: Book, arLevel: number | undefined) => void;
  onUpdateSeries?: (book: Book, series: string | undefined) => void;
  onMoveToArchive?: (book: Book) => void;
  onMoveToReading?: (book: Book) => void;
  showKclsAvailabilityLink?: boolean;
  suggestedSeries?: string;
  readingActivity?: {
    lastReadDate?: string;
    daysSinceLastRead?: number;
  };
  removeLabel?: string;
  onRemove?: (book: Book) => void;
};

export function BookCard({
  book,
  readCount = 0,
  onMarkRead,
  onQuickAddRead,
  onQuickRemoveRead,
  onUpdateArLevel,
  onUpdateSeries,
  onMoveToArchive,
  onMoveToReading,
  showKclsAvailabilityLink,
  suggestedSeries,
  readingActivity,
  removeLabel = "Remove from Wish List",
  onRemove
}: BookCardProps) {
  const [arInput, setArInput] = useState(typeof book.arLevel === "number" ? book.arLevel.toFixed(1) : "");
  const [seriesInput, setSeriesInput] = useState(book.series ?? "");

  useEffect(() => {
    setArInput(typeof book.arLevel === "number" ? book.arLevel.toFixed(1) : "");
  }, [book.arLevel]);

  useEffect(() => {
    setSeriesInput(book.series ?? suggestedSeries ?? "");
  }, [book.series, suggestedSeries]);

  return (
    <article className="flex h-full flex-col rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex gap-4">
        <div className="flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-skysoft text-center text-xs font-semibold text-ink/60">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            "Book"
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink">{book.title}</h3>
          <p className="mt-1 text-sm text-ink/65">{book.author}</p>
          {book.series ? <p className="mt-1 text-sm font-medium text-leaf">{book.series}</p> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {typeof book.arLevel === "number" ? <Badge>AR {book.arLevel.toFixed(1)}</Badge> : null}
        {book.interestLevel ? <Badge>{book.interestLevel}</Badge> : null}
        {readCount ? <Badge>{readCount} read{readCount === 1 ? "" : "s"}</Badge> : null}
        {book.themes.map((theme) => (
          <Badge key={theme}>{theme}</Badge>
        ))}
      </div>

      {readingActivity ? (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-ink/10 bg-cream p-3">
          <div>
            <p className="text-xs font-semibold text-ink/55">Last read</p>
            <p className="mt-1 text-sm font-bold text-ink">{readingActivity.lastReadDate ?? "Not read yet"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink/55">Days not read</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {typeof readingActivity.daysSinceLastRead === "number"
                ? readingActivity.daysSinceLastRead === 0
                  ? "Today"
                  : `${readingActivity.daysSinceLastRead} day${readingActivity.daysSinceLastRead === 1 ? "" : "s"}`
                : "No reads yet"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {onUpdateSeries ? (
          <div className="rounded-lg border border-ink/10 bg-white p-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink/60">Series</span>
              <div className="mt-1 flex gap-2">
                <input
                  className="focus-ring min-w-0 flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm"
                  value={seriesInput}
                  onChange={(event) => setSeriesInput(event.target.value)}
                  placeholder="Series name"
                />
                <button
                  className="rounded-lg border border-leaf/25 px-3 py-2 text-sm font-semibold text-leaf"
                  type="button"
                  onClick={() => onUpdateSeries(book, seriesInput.trim() || undefined)}
                >
                  Save
                </button>
              </div>
            </label>
            {!book.series && suggestedSeries ? (
              <p className="mt-2 text-xs text-ink/55">Auto-filled suggestion. Click Save to keep it.</p>
            ) : null}
          </div>
        ) : null}

        {onUpdateArLevel ? (
          <div className="rounded-lg border border-ink/10 bg-skysoft p-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink/60">Verified AR / ATOS</span>
              <div className="mt-1 flex gap-2">
                <input
                  className="focus-ring min-w-0 flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm"
                  type="number"
                  step="0.1"
                  value={arInput}
                  onChange={(event) => setArInput(event.target.value)}
                  placeholder="e.g. 1.3"
                />
                <button
                  className="rounded-lg bg-leaf px-3 py-2 text-sm font-semibold text-white"
                  type="button"
                  onClick={() => onUpdateArLevel(book, arInput ? Number(arInput) : undefined)}
                >
                  Save
                </button>
              </div>
            </label>
            <a
              className="mt-2 inline-block text-xs font-bold text-leaf underline-offset-2 hover:underline"
              href={buildArSearchUrl(book.title, book.author)}
              target="_blank"
              rel="noreferrer"
            >
              Search web for AR level
            </a>
            <a
              className="ml-3 mt-2 inline-block text-xs font-bold text-leaf underline-offset-2 hover:underline"
              href="https://www.arbookfind.com/usertype.aspx"
              target="_blank"
              rel="noreferrer"
            >
              Verify AR level
            </a>
          </div>
        ) : null}

        {onQuickAddRead ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-cream p-2">
            <div>
              <p className="text-xs font-semibold text-ink/55">Read count</p>
              <p className="text-lg font-bold text-ink">{readCount}</p>
            </div>
            <div className="flex gap-2">
              {onQuickRemoveRead ? (
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-berry/25 bg-white text-xl font-bold leading-none text-berry transition hover:bg-berry hover:text-white disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/25 disabled:hover:bg-white"
                  type="button"
                  aria-label={`Remove one read for ${book.title}`}
                  title="Remove one read"
                  disabled={readCount === 0}
                  onClick={() => onQuickRemoveRead(book)}
                >
                  -
                </button>
              ) : null}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-xl font-bold leading-none text-white transition hover:bg-leaf/90"
                type="button"
                aria-label={`Add one read for ${book.title}`}
                title="Add one read"
                onClick={() => onQuickAddRead(book)}
              >
                +
              </button>
            </div>
          </div>
        ) : null}

        {onMarkRead ? (
          <button
            className="rounded-lg border border-leaf/25 px-4 py-2 text-sm font-semibold text-leaf transition hover:bg-leaf hover:text-white"
            type="button"
            onClick={() => onMarkRead(book)}
          >
            Add session details
          </button>
        ) : null}

        {showKclsAvailabilityLink ? (
          <div className="rounded-lg border border-ink/10 bg-cream p-3">
            <p className="text-xs font-semibold text-ink/60">King County Library System</p>
            <a
              className="mt-1 inline-flex text-sm font-bold text-leaf underline-offset-2 hover:underline"
              href={buildKclsSearchUrl(book.title, book.author)}
              target="_blank"
              rel="noreferrer"
            >
              Check KCLS availability
            </a>
            <p className="mt-1 text-xs text-ink/55">
              Opens the live KCLS catalog search so you can confirm copies, format, and hold status.
            </p>
          </div>
        ) : null}

        {onMoveToArchive ? (
          <button
            className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/65 transition hover:bg-cream hover:text-ink"
            type="button"
            onClick={() => onMoveToArchive(book)}
          >
            Move to Past Reads
          </button>
        ) : null}

        {onMoveToReading ? (
          <button
            className="rounded-lg border border-leaf/25 px-4 py-2 text-sm font-semibold text-leaf transition hover:bg-leaf hover:text-white"
            type="button"
            onClick={() => onMoveToReading(book)}
          >
            Move to Reading
          </button>
        ) : null}

        {onRemove ? (
          <button
            className="rounded-lg border border-berry/25 px-4 py-2 text-sm font-semibold text-berry transition hover:bg-berry hover:text-white"
            type="button"
            onClick={() => onRemove(book)}
          >
            {removeLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink/70">{children}</span>;
}

function buildArSearchUrl(title: string, author: string) {
  const query = [title, author, "AR level", "ATOS", "Accelerated Reader"]
    .filter((part) => part.trim())
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildKclsSearchUrl(title: string, author: string) {
  const query = [title, author].filter((part) => part.trim()).join(" ");
  return `https://kcls.bibliocommons.com/v2/search?query=${encodeURIComponent(query)}&searchType=smart`;
}
