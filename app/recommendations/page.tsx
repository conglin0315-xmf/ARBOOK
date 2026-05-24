"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/BookCard";
import { BookForm } from "@/components/BookForm";
import { ChildSelector } from "@/components/ChildSelector";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useAppData } from "@/lib/AppContext";
import { getReadCountByBook, makeId, recommendBooks } from "@/lib/utils";
import type { Book, BookRecommendation, ChildProfile } from "@/lib/types";

type DiscoveryBook = {
  key: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  themes: string[];
  querySource: string;
};

type SeriesProgression = {
  series: string;
  starterTitle: string;
  author: string;
  themes: string[];
  from: string;
  reason: string;
};

export default function RecommendationsPage() {
  const { data, selectedChild, upsertBook, removeBook } = useAppData();
  const [discoveries, setDiscoveries] = useState<DiscoveryBook[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const [addedDiscoveryKeys, setAddedDiscoveryKeys] = useState<string[]>([]);
  const savedBookKeys = useMemo(() => new Set(data.books.map((book) => normalizeBookKey(book.title, book.author))), [data.books]);

  useEffect(() => {
    if (!selectedChild) {
      setDiscoveries([]);
      return;
    }

    const controller = new AbortController();
    setIsDiscovering(true);
    setDiscoveryError("");

    discoverBooks(selectedChild, savedBookKeys, controller.signal)
      .then(setDiscoveries)
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDiscoveryError("Could not load outside-book suggestions right now.");
      })
      .finally(() => setIsDiscovering(false));

    return () => controller.abort();
  }, [selectedChild, savedBookKeys]);

  if (!selectedChild) return <p className="rounded-lg bg-white p-6">Add a child profile first.</p>;

  const recommendations = recommendBooks(data, selectedChild);
  const seriesProgressions = getSeriesProgressions(data, selectedChild);
  const readCounts = getReadCountByBook(data.logs, selectedChild.id);
  const readingBooks = data.books
    .filter((book) => book.shelf !== "wishlist")
    .sort((a, b) => a.title.localeCompare(b.title));
  const wishListBooks = data.books
    .filter((book) => book.shelf === "wishlist")
    .sort((a, b) => a.title.localeCompare(b.title));

  function addDiscovery(book: DiscoveryBook) {
    upsertBook({
      id: makeId("book"),
      title: book.title,
      author: book.author,
      shelf: "wishlist",
      isbn: book.isbn,
      coverUrl: book.coverUrl,
      themes: book.themes,
      interestLevel: "LG"
    });
    setAddedDiscoveryKeys((current) => [...current, book.key]);
  }

  function addRecommendationToWishList(recommendation: BookRecommendation) {
    upsertBook({
      ...recommendation.book,
      id: makeId("book"),
      shelf: "wishlist",
      arLevel: recommendation.book.arLevel
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_320px] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-berry">Recommendations</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Plan what to read next</h1>
          <p className="mt-2 text-ink/65">
            Add books, review the current reading selection, and keep a Wish List for what to buy or borrow next.
            Comfort reads use AR {recommendations.range.comfort.min.toFixed(1)}-{recommendations.range.comfort.max.toFixed(1)}.
            Next step books use AR {recommendations.range.nextStep.min.toFixed(1)}-{recommendations.range.nextStep.max.toFixed(1)}, just above the current range.
          </p>
        </div>
        <ChildSelector />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-xl font-bold text-ink">Add a Book</h2>
          <p className="mt-1 text-sm text-ink/60">
            Add books you own, borrowed books, or titles you want to track. AR/ATOS can auto-fill from your local list when available, but should still be verified.
          </p>
        </div>
        <BookForm onSave={upsertBook} existingBooks={data.books} />
      </section>

      <BookSelectionSection
        title="Current Reading Selection"
        helper="Books already in the active reading list. Session logging lives in the Sessions tab."
        books={readingBooks}
        allBooks={data.books}
        readCounts={readCounts}
        onUpdateSeries={(book, series) => upsertBook({ ...book, series })}
      />

      <BookSelectionSection
        title="Wish List"
        helper="Books to consider buying or borrowing next. Verify AR/ATOS here so they can feed Comfort Reads and Next Step Books."
        books={wishListBooks}
        allBooks={data.books}
        readCounts={readCounts}
        onUpdateSeries={(book, series) => upsertBook({ ...book, series })}
        onUpdateArLevel={(book, arLevel) => upsertBook({ ...book, arLevel })}
        onRemove={(book) => removeBook(book.id)}
      />

      <RecommendationSection
        title="Comfort Reads"
        helper="From verified Wish List books or local catalog entries whose listed BL range overlaps the current reading range."
        items={recommendations.comfortReads}
        onAddToWishList={addRecommendationToWishList}
      />
      <RecommendationSection
        title="Next Step Books"
        helper="From verified Wish List books or local catalog entries whose listed BL range overlaps 0.1-0.3 above the current max."
        items={recommendations.nextStepBooks}
        onAddToWishList={addRecommendationToWishList}
      />
      <SeriesProgressionSection progressions={seriesProgressions} onAdd={(progression) => {
        upsertBook({
          id: makeId("book"),
          title: progression.starterTitle,
          author: progression.author,
          series: progression.series,
          shelf: "wishlist",
          themes: progression.themes,
          interestLevel: "LG"
        });
      }} />
      <DiscoverySection
        discoveries={discoveries}
        isDiscovering={isDiscovering}
        error={discoveryError}
        addedKeys={addedDiscoveryKeys}
        onAdd={addDiscovery}
      />
      <RecommendationSection title="Repeat Favorites" items={recommendations.repeatFavorites} />
    </div>
  );
}

function BookSelectionSection({
  title,
  helper,
  books,
  allBooks,
  readCounts,
  onUpdateSeries,
  onUpdateArLevel,
  onRemove
}: {
  title: string;
  helper: string;
  books: Book[];
  allBooks: Book[];
  readCounts: Record<string, number>;
  onUpdateSeries?: (book: Book, series: string | undefined) => void;
  onUpdateArLevel?: (book: Book, arLevel: number | undefined) => void;
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
              onUpdateSeries={onUpdateSeries}
              onUpdateArLevel={onUpdateArLevel}
              suggestedSeries={inferSeriesForBook(book, allBooks)}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/60">No books in this section yet.</p>
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

function RecommendationSection({
  title,
  helper,
  items,
  onAddToWishList
}: {
  title: string;
  helper?: string;
  items: ReturnType<typeof recommendBooks>["comfortReads"];
  onAddToWishList?: (recommendation: BookRecommendation) => void;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {helper ? <p className="mt-1 text-sm text-ink/60">{helper}</p> : null}
      {items.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <RecommendationCard
              key={`${item.kind}-${item.book.id}`}
              recommendation={item}
              onAddToWishList={item.sourceName ? onAddToWishList : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/60">
          {helper
            ? "No matches yet. Add Wish List books with verified AR/ATOS values to improve recommendations."
            : "No matches yet. Add more reading sessions to improve recommendations."}
        </p>
      )}
    </section>
  );
}

function SeriesProgressionSection({
  progressions,
  onAdd
}: {
  progressions: SeriesProgression[];
  onAdd: (progression: SeriesProgression) => void;
}) {
  const [addedSeries, setAddedSeries] = useState<string[]>([]);

  return (
    <section>
      <div>
        <h2 className="text-xl font-bold text-ink">Series to Try Next</h2>
        <p className="mt-1 text-sm text-ink/60">
          Natural progressions from the series and reading patterns already working. Add to Wish List, then enter and verify AR/ATOS.
        </p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progressions.map((progression) => {
          const wasAdded = addedSeries.includes(progression.series);
          return (
            <article key={progression.series} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wide text-berry">After {progression.from}</p>
              <h3 className="mt-2 text-base font-bold text-ink">{progression.series}</h3>
              <p className="mt-1 text-sm text-ink/65">Start with: {progression.starterTitle}</p>
              <p className="mt-3 text-sm text-ink/75">{progression.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {progression.themes.map((theme) => (
                  <span key={theme} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink/70">
                    {theme}
                  </span>
                ))}
              </div>
              <button
                className="mt-4 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf/90 disabled:bg-ink/25"
                disabled={wasAdded}
                type="button"
                onClick={() => {
                  onAdd(progression);
                  setAddedSeries((current) => [...current, progression.series]);
                }}
              >
                {wasAdded ? "Added to Wish List" : "Add to Wish List"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DiscoverySection({
  discoveries,
  isDiscovering,
  error,
  addedKeys,
  onAdd
}: {
  discoveries: DiscoveryBook[];
  isDiscovering: boolean;
  error: string;
  addedKeys: string[];
  onAdd: (book: DiscoveryBook) => void;
}) {
  return (
    <section>
      <div>
        <h2 className="text-xl font-bold text-ink">Discover More Books</h2>
        <p className="mt-1 text-sm text-ink/60">
          Searches Open Library by favorite themes and series. Add to Wish List, then enter and verify AR/ATOS before it appears in range-based recommendations.
        </p>
      </div>
      {isDiscovering ? <p className="mt-3 rounded-lg bg-white p-4 text-sm text-ink/60">Searching outside your saved list...</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-white p-4 text-sm text-berry">{error}</p> : null}
      {!isDiscovering && !error && discoveries.length === 0 ? (
        <p className="mt-3 rounded-lg bg-white p-4 text-sm text-ink/60">No outside suggestions found yet.</p>
      ) : null}
      {discoveries.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {discoveries.slice(0, 6).map((book) => {
            const wasAdded = addedKeys.includes(book.key);
            return (
              <article key={book.key} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wide text-leaf">Outside your list</p>
                <h3 className="mt-2 text-base font-bold text-ink">{book.title}</h3>
                <p className="mt-1 text-sm text-ink/65">{book.author || "Unknown author"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {book.themes.slice(0, 4).map((theme) => (
                    <span key={theme} className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink/70">
                      {theme}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink/60">Found from {book.querySource}. AR/ATOS is not provided by this source.</p>
                <button
                  className="mt-4 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf/90 disabled:bg-ink/25"
                  disabled={wasAdded}
                  type="button"
                  onClick={() => onAdd(book)}
                >
                  {wasAdded ? "Added to Wish List" : "Add to Wish List"}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

async function discoverBooks(child: ChildProfile, savedBookKeys: Set<string>, signal: AbortSignal) {
  const queries = [...child.favoriteSeries.slice(0, 2), ...child.favoriteThemes.slice(0, 4)]
    .map((value) => value.trim())
    .filter(Boolean);
  const results = await Promise.all(
    queries.map(async (query) => {
      const params = new URLSearchParams({
        q: query,
        limit: "8",
        fields: "key,title,author_name,isbn,cover_i,subject"
      });
      const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, { signal });
      if (!response.ok) return [];
      const payload = (await response.json()) as {
        docs?: Array<{
          key?: string;
          title?: string;
          author_name?: string[];
          isbn?: string[];
          cover_i?: number;
          subject?: string[];
        }>;
      };

      return (payload.docs ?? []).map((item): DiscoveryBook | undefined => {
        if (!item.key || !item.title) return undefined;
        const author = item.author_name?.[0] ?? "";
        return {
          key: item.key,
          title: item.title,
          author,
          isbn: item.isbn?.find((value) => value.length === 13) ?? item.isbn?.[0],
          coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined,
          themes: normalizeSubjects(item.subject ?? []),
          querySource: query
        };
      });
    })
  );

  const seen = new Set<string>();
  return results
    .flat()
    .filter((book): book is DiscoveryBook => Boolean(book))
    .filter((book) => {
      const key = normalizeBookKey(book.title, book.author);
      if (savedBookKeys.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 9);
}

function normalizeSubjects(subjects: string[]) {
  const blocked = ["accessible book", "protected daisy", "juvenile fiction", "juvenile literature"];
  return subjects
    .map((subject) => subject.toLowerCase().replace(/[^\w\s-]/g, "").trim())
    .filter((subject) => subject && subject.length <= 24 && !blocked.includes(subject))
    .slice(0, 5);
}

function normalizeBookKey(title: string, author: string) {
  return `${title} ${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSeriesProgressions(data: ReturnType<typeof useAppData>["data"], child: ChildProfile) {
  const childLogs = data.logs.filter((log) => log.childId === child.id);
  const bookById = new Map(data.books.map((book) => [book.id, book]));
  const activeSeries = new Set(
    [
      ...child.favoriteSeries,
      ...childLogs.map((log) => bookById.get(log.bookId)?.series).filter((series): series is string => Boolean(series))
    ].map((series) => series.toLowerCase())
  );
  const savedSeries = new Set(data.books.map((book) => book.series?.toLowerCase()).filter((series): series is string => Boolean(series)));

  const candidates: SeriesProgression[] = [
    {
      series: "Elephant & Piggie Like Reading!",
      starterTitle: "The Cookie Fiasco",
      author: "Dan Santat",
      themes: ["funny", "friendship", "dialog"],
      from: "Elephant & Piggie",
      reason: "Keeps the Elephant & Piggie-style humor and visual support, but introduces new authors and slightly more story variety."
    },
    {
      series: "Unlimited Squirrels",
      starterTitle: "I Lost My Tooth!",
      author: "Mo Willems",
      themes: ["funny", "comic", "friendship"],
      from: "Elephant & Piggie",
      reason: "A natural Mo Willems next step with comic energy, speech bubbles, and a little more reading stamina."
    },
    {
      series: "Hello Hedgehog",
      starterTitle: "Do You Like My Bike?",
      author: "Norm Feuti",
      themes: ["friendship", "funny", "dialog"],
      from: "Elephant & Piggie",
      reason: "Short, warm stories with speech bubbles and full-color art, good for children ready for a touch more text."
    },
    {
      series: "Puppy Mudge",
      starterTitle: "Puppy Mudge Takes a Bath",
      author: "Cynthia Rylant",
      themes: ["animals", "family", "gentle"],
      from: "Biscuit",
      reason: "Another gentle dog series that keeps familiar pet stories while stretching beyond Biscuit's repeating structure."
    },
    {
      series: "Mercy Watson",
      starterTitle: "Mercy Watson to the Rescue",
      author: "Kate DiCamillo",
      themes: ["funny", "animals", "family"],
      from: "Biscuit",
      reason: "A popular bridge into early chapter books with big illustrations, humor, and short episodes."
    },
    {
      series: "Frog and Toad",
      starterTitle: "Frog and Toad Are Friends",
      author: "Arnold Lobel",
      themes: ["friendship", "animals", "gentle"],
      from: "Elephant & Piggie",
      reason: "Keeps the two-friend structure but moves toward short chapters and richer emotional stories."
    }
  ];

  return candidates
    .filter((candidate) => {
      const from = candidate.from.toLowerCase();
      const hasMatchingStartingPoint =
        activeSeries.has(from) ||
        (from === "elephant & piggie" && (savedSeries.has("elephant & piggie") || activeSeries.has("elephant and piggie"))) ||
        (from === "biscuit" && activeSeries.has("biscuit"));

      return hasMatchingStartingPoint && !savedSeries.has(candidate.series.toLowerCase());
    })
    .slice(0, 6);
}
