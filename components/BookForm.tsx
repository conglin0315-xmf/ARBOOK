"use client";

import { FormEvent, useEffect, useState } from "react";
import { makeId, splitTags } from "@/lib/utils";
import { localArCatalog } from "@/lib/localArCatalog";
import type { Book } from "@/lib/types";

type BookFormProps = {
  onSave: (book: Book) => void;
  existingBooks?: Book[];
};

type BookSuggestion = {
  key: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  themes: string[];
  firstPublishYear?: number;
  series?: string;
};

export function BookForm({ onSave, existingBooks = [] }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [series, setSeries] = useState("");
  const [arLevel, setArLevel] = useState("");
  const [interestLevel, setInterestLevel] = useState("LG");
  const [themes, setThemes] = useState("");
  const [isbn, setIsbn] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [arLevelAutoFilled, setArLevelAutoFilled] = useState(false);
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedSuggestionKey, setSelectedSuggestionKey] = useState("");
  const [seriesTouched, setSeriesTouched] = useState(false);
  const [seriesAutoFilled, setSeriesAutoFilled] = useState(false);
  const [arAutoFillSource, setArAutoFillSource] = useState("");

  useEffect(() => {
    const query = title.trim();
    if (query.length < 3 || selectedSuggestionKey) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({
          title: query,
          limit: "6",
          fields: "key,title,author_name,isbn,cover_i,subject,first_publish_year"
        });
        const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Book search is unavailable.");

        const payload = (await response.json()) as {
          docs?: Array<{
            key?: string;
            title?: string;
            author_name?: string[];
            isbn?: string[];
            cover_i?: number;
            subject?: string[];
            first_publish_year?: number;
          }>;
        };

        const nextSuggestions = (payload.docs ?? [])
          .filter((item) => item.key && item.title)
          .map((item) => {
            const suggestionTitle = item.title as string;
            const suggestionAuthor = item.author_name?.[0] ?? "";
            return {
              key: item.key as string,
              title: suggestionTitle,
              author: suggestionAuthor,
              isbn: item.isbn?.find((value) => value.length === 13) ?? item.isbn?.[0],
              coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : undefined,
              themes: normalizeSubjects(item.subject ?? []),
              firstPublishYear: item.first_publish_year,
              series: inferSeries(suggestionTitle, suggestionAuthor, existingBooks)
            };
          });

        setSuggestions(nextSuggestions);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSearchError("Could not load book suggestions. You can still enter the book manually.");
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [existingBooks, title, selectedSuggestionKey]);

  useEffect(() => {
    if (seriesTouched || !title.trim()) return;

    const inferredSeries = inferSeries(title, author, existingBooks);
    if (inferredSeries) {
      setSeries(inferredSeries);
      setSeriesAutoFilled(true);
    } else if (seriesAutoFilled) {
      setSeries("");
      setSeriesAutoFilled(false);
    }
  }, [author, existingBooks, seriesAutoFilled, seriesTouched, title]);

  useEffect(() => {
    if (!title.trim() || arLevelAutoFilled) return;

    const catalogMatch = findLocalArCatalogMatch(title, author);
    if (catalogMatch?.arLevel) {
      setArLevel(catalogMatch.arLevel.toFixed(1));
      setArLevelAutoFilled(true);
      setArAutoFillSource(catalogMatch.sourceName);
    }
  }, [arLevelAutoFilled, author, title]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onSave({
      id: makeId("book"),
      title: title.trim(),
      author: author.trim(),
      series: series.trim() || undefined,
      arLevel: arLevel ? Number(arLevel) : undefined,
      interestLevel: interestLevel.trim() || undefined,
      themes: splitTags(themes),
      isbn: isbn.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined
    });

    setTitle("");
    setAuthor("");
    setSeries("");
    setArLevel("");
    setInterestLevel("LG");
    setThemes("");
    setIsbn("");
    setCoverUrl("");
    setArLevelAutoFilled(false);
    setArAutoFillSource("");
    setSuggestions([]);
    setSearchError("");
    setSelectedSuggestionKey("");
    setSeriesTouched(false);
    setSeriesAutoFilled(false);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSelectedSuggestionKey("");
    setArLevelAutoFilled(false);
    setArAutoFillSource("");
  }

  function chooseSuggestion(suggestion: BookSuggestion) {
    const localMatch = findLocalBookMatch(suggestion, existingBooks);
    const catalogMatch = findLocalArCatalogMatch(suggestion.title, suggestion.author);

    setSelectedSuggestionKey(suggestion.key);
    setTitle(suggestion.title);
    setAuthor(suggestion.author);
    setIsbn(suggestion.isbn ?? "");
    setCoverUrl(suggestion.coverUrl ?? "");
    setThemes(suggestion.themes.join(", "));
    const nextSeries = localMatch?.series ?? suggestion.series ?? "";
    setSeries(nextSeries);
    setSeriesTouched(false);
    setSeriesAutoFilled(Boolean(nextSeries));
    const matchedArLevel = localMatch?.arLevel ?? catalogMatch?.arLevel;
    setArLevel(typeof matchedArLevel === "number" ? matchedArLevel.toFixed(1) : "");
    setArLevelAutoFilled(typeof matchedArLevel === "number");
    setArAutoFillSource(
      typeof localMatch?.arLevel === "number"
        ? "your saved books"
        : typeof catalogMatch?.arLevel === "number"
          ? catalogMatch.sourceName
          : ""
    );
    setInterestLevel(localMatch?.interestLevel ?? "LG");
    setSuggestions([]);
    setSearchError("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Add a book</h2>
          <p className="mt-1 text-sm text-ink/60">
            AR/ATOS level is entered by the parent. Please verify with your school or official book lookup tools.
          </p>
        </div>
        <button className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" type="submit">
          Save book
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="relative block">
          <span className="text-sm font-semibold text-ink/70">Title</span>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            autoComplete="off"
            placeholder="Start typing a book title"
          />
          {(suggestions.length > 0 || isSearching || searchError) && (
            <div className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
              {isSearching ? <p className="px-3 py-2 text-sm text-ink/60">Searching books...</p> : null}
              {searchError ? <p className="px-3 py-2 text-sm text-berry">{searchError}</p> : null}
              {suggestions.map((suggestion) => (
                <SuggestionButton
                  key={suggestion.key}
                  suggestion={suggestion}
                  localMatch={findLocalBookMatch(suggestion, existingBooks)}
                  onChoose={chooseSuggestion}
                />
              ))}
            </div>
          )}
          <span className="mt-1 block text-xs text-ink/55">
            Suggestions use Open Library metadata. AR/ATOS only auto-fills from your saved books.
          </span>
        </label>
        <Field label="Author" value={author} onChange={setAuthor} required />
        <label className="block">
          <span className="text-sm font-semibold text-ink/70">Series</span>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
            value={series}
            onChange={(event) => {
              setSeries(event.target.value);
              setSeriesTouched(true);
              setSeriesAutoFilled(false);
            }}
          />
          {seriesAutoFilled ? (
            <span className="mt-1 block text-xs text-ink/55">
              Auto-filled from matching saved books or the title. You can edit it.
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink/70">
            <span>AR Level / ATOS Level</span>
            <span className="flex gap-3">
              <a
                className="text-xs font-bold text-leaf underline-offset-2 hover:underline"
                href={buildArSearchUrl(title, author)}
                target="_blank"
                rel="noreferrer"
              >
                Search web
              </a>
              <a
                className="text-xs font-bold text-leaf underline-offset-2 hover:underline"
                href="https://www.arbookfind.com/usertype.aspx"
                target="_blank"
                rel="noreferrer"
              >
                Verify AR level
              </a>
            </span>
          </span>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
            value={arLevel}
            onChange={(event) => {
              setArLevel(event.target.value);
              setArLevelAutoFilled(false);
              setArAutoFillSource("");
            }}
            type="number"
            step="0.1"
          />
          {arLevelAutoFilled ? (
            <span className="mt-1 block text-xs text-ink/55">
              This AR/ATOS value came from {arAutoFillSource || "the local list"}. Please verify with your school or official book lookup tools.
            </span>
          ) : (
            <span className="mt-1 block text-xs text-ink/55">
              Enter this manually after checking with your school or official book lookup tools.
            </span>
          )}
        </label>
        <Field label="Interest level" value={interestLevel} onChange={setInterestLevel} />
        <Field label="Themes" placeholder="animals, funny" value={themes} onChange={setThemes} />
        <Field label="ISBN" value={isbn} onChange={setIsbn} />
        <Field label="Cover URL" value={coverUrl} onChange={setCoverUrl} />
      </div>
    </form>
  );
}

function SuggestionButton({
  suggestion,
  localMatch,
  onChoose
}: {
  suggestion: BookSuggestion;
  localMatch?: Book;
  onChoose: (suggestion: BookSuggestion) => void;
}) {
  return (
    <button
      className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-cream"
      type="button"
      onClick={() => onChoose(suggestion)}
    >
      <span className="block text-sm font-bold text-ink">{suggestion.title}</span>
      <span className="mt-0.5 block text-xs text-ink/60">
        {[suggestion.author, suggestion.firstPublishYear].filter(Boolean).join(" · ") || "Open Library result"}
      </span>
      {suggestion.series ? (
        <span className="mt-1 inline-flex rounded-full bg-cream px-2 py-0.5 text-xs font-semibold text-ink/70">
          Series: {suggestion.series}
        </span>
      ) : null}
      {typeof localMatch?.arLevel === "number" ? (
        <span className="mt-1 inline-flex rounded-full bg-skysoft px-2 py-0.5 text-xs font-semibold text-ink/70">
          Saved AR {localMatch.arLevel.toFixed(1)}
        </span>
      ) : null}
    </button>
  );
}

function normalizeSubjects(subjects: string[]) {
  const blocked = ["accessible book", "protected daisy", "juvenile fiction", "juvenile literature"];
  return subjects
    .map((subject) => subject.toLowerCase().replace(/[^\w\s-]/g, "").trim())
    .filter((subject) => subject && subject.length <= 24 && !blocked.includes(subject))
    .slice(0, 5);
}

function findLocalBookMatch(suggestion: BookSuggestion, books: Book[]) {
  const suggestionTitle = normalizeMatchText(suggestion.title);
  const suggestionAuthor = normalizeMatchText(suggestion.author);
  const suggestionIsbn = suggestion.isbn?.replaceAll("-", "");

  return books.find((book) => {
    const bookIsbn = book.isbn?.replaceAll("-", "");
    if (suggestionIsbn && bookIsbn && suggestionIsbn === bookIsbn) return true;

    const bookAuthor = normalizeMatchText(book.author);
    const authorsMatch =
      !suggestionAuthor ||
      !bookAuthor ||
      bookAuthor === suggestionAuthor ||
      bookAuthor.includes(suggestionAuthor) ||
      suggestionAuthor.includes(bookAuthor);

    return (
      normalizeMatchText(book.title) === suggestionTitle &&
      authorsMatch
    );
  });
}

function findLocalArCatalogMatch(title: string, author: string) {
  const titleText = normalizeMatchText(title);
  const authorText = normalizeMatchText(author);
  if (!titleText) return undefined;

  return localArCatalog.find((book) => {
    const bookTitle = normalizeMatchText(book.title);
    const bookAuthor = normalizeMatchText(book.author);
    const titleMatches = bookTitle === titleText || titleText.includes(bookTitle) || bookTitle.includes(titleText);
    const authorMatches = !authorText || !bookAuthor || authorText === bookAuthor || authorText.includes(bookAuthor) || bookAuthor.includes(authorText);
    return titleMatches && authorMatches && typeof book.arLevel === "number";
  });
}

function inferSeries(title: string, author: string, books: Book[]) {
  const titlePrefix = getSeriesPrefix(title);
  const authorText = normalizeMatchText(author);
  const matchingSavedSeries = books.find((book) => {
    if (!book.series) return false;
    const sameSeriesPrefix = titlePrefix && normalizeMatchText(book.series) === normalizeMatchText(titlePrefix);
    const titleIncludesSeries = normalizeMatchText(title).includes(normalizeMatchText(book.series));
    const authorMatches = !authorText || normalizeMatchText(book.author) === authorText;
    return authorMatches && (sameSeriesPrefix || titleIncludesSeries);
  })?.series;

  return matchingSavedSeries ?? titlePrefix;
}

function getSeriesPrefix(title: string) {
  const colonPrefix = title.split(":")[0]?.trim();
  if (colonPrefix && colonPrefix !== title && colonPrefix.length <= 36) return colonPrefix;

  const dashPrefix = title.split(" - ")[0]?.trim();
  if (dashPrefix && dashPrefix !== title && dashPrefix.length <= 36) return dashPrefix;

  return undefined;
}

function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildArSearchUrl(title: string, author: string) {
  const query = [title, author, "AR level", "ATOS", "Accelerated Reader"]
    .filter((part) => part.trim())
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query || "AR level ATOS Accelerated Reader")}`;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  step
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink/70">{label}</span>
      <input
        className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        placeholder={placeholder}
        step={step}
      />
    </label>
  );
}
