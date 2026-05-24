"use client";

import { FormEvent, useState } from "react";
import { makeId } from "@/lib/utils";
import type { Book, ReadingLog } from "@/lib/types";

type ReadingLogFormProps = {
  childId: string;
  books: Book[];
  initialBookId?: string;
  onSave: (log: ReadingLog) => void;
};

export function ReadingLogForm({ childId, books, initialBookId, onSave }: ReadingLogFormProps) {
  const [bookId, setBookId] = useState(initialBookId ?? books[0]?.id ?? "");
  const [readDate, setReadDate] = useState(new Date().toISOString().slice(0, 10));
  const [readingMode, setReadingMode] = useState<ReadingLog["readingMode"]>("read_aloud");
  const [likedScore, setLikedScore] = useState<ReadingLog["likedScore"]>(5);
  const [difficulty, setDifficulty] = useState<ReadingLog["difficulty"]>("just_right");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!bookId) return;

    onSave({
      id: makeId("log"),
      childId,
      bookId,
      createdAt: new Date().toISOString(),
      readDate,
      readingMode,
      likedScore,
      difficulty,
      quizCompleted,
      quizScore: quizScore ? Number(quizScore) : undefined,
      notes: notes.trim() || undefined
    });

    setReadDate(new Date().toISOString().slice(0, 10));
    setReadingMode("read_aloud");
    setLikedScore(5);
    setDifficulty("just_right");
    setQuizCompleted(false);
    setQuizScore("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-ink">Add reading session</h2>
        <button className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" type="submit">
          Save session
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink/70">Book</span>
          <select className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={bookId} onChange={(event) => setBookId(event.target.value)}>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </label>
        <Field label="Read date" type="date" value={readDate} onChange={setReadDate} />
        <label className="block">
          <span className="text-sm font-semibold text-ink/70">Reading mode</span>
          <select className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={readingMode} onChange={(event) => setReadingMode(event.target.value as ReadingLog["readingMode"])}>
            <option value="independent">Independent</option>
            <option value="read_aloud">Read aloud</option>
            <option value="listened">Listened</option>
            <option value="parent_assisted">Parent assisted</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink/70">Difficulty</span>
          <select className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={difficulty} onChange={(event) => setDifficulty(event.target.value as ReadingLog["difficulty"])}>
            <option value="too_easy">Too easy</option>
            <option value="just_right">Just right</option>
            <option value="a_bit_hard">A bit hard</option>
            <option value="too_hard">Too hard</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink/70">Liked score</span>
          <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" type="range" min="1" max="5" value={likedScore} onChange={(event) => setLikedScore(Number(event.target.value) as ReadingLog["likedScore"])} />
          <span className="text-sm font-semibold text-leaf">{likedScore} / 5</span>
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-ink/70">
          <input type="checkbox" checked={quizCompleted} onChange={(event) => setQuizCompleted(event.target.checked)} />
          Quiz completed
        </label>
        <Field label="Quiz score" type="number" value={quizScore} onChange={setQuizScore} />
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink/70">Notes</span>
          <textarea className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink/70">{label}</span>
      <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} type={type} />
    </label>
  );
}
