"use client";

import { useState } from "react";
import { ChildSelector } from "@/components/ChildSelector";
import { StatCard } from "@/components/StatCard";
import { useAppData } from "@/lib/AppContext";
import { calculateChildStats, getRecommendedRange } from "@/lib/utils";

type SummaryPeriod = "weekly" | "thirtyDay" | "total";

export default function DashboardPage() {
  const { data, selectedChild } = useAppData();
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>("weekly");

  if (!selectedChild) return <EmptyState />;

  const stats = calculateChildStats(data, selectedChild.id);
  const range = getRecommendedRange(selectedChild, data.logs, data.books);
  const bookById = new Map(data.books.map((book) => [book.id, book]));
  const summary = {
    weekly: {
      title: "Weekly summary",
      range: `Week to date: Monday ${stats.weeklyRangeStart} through ${stats.weeklyRangeEnd}.`,
      booksRead: stats.weeklyBooksRead,
      booksHelper: `Average ${stats.weeklyAverageBooksPerDay.toFixed(1)} unique books per day.`,
      sessions: stats.weeklyReadingSessions,
      sessionsHelper: `Average ${stats.weeklyAverageSessionsPerDay.toFixed(1)} sessions per day.`,
      averageArLevel: stats.weeklyAverageArLevel,
      comparisons: {
        booksRead: stats.weeklyComparisons.booksRead,
        sessions: stats.weeklyComparisons.readingSessions,
        averageArLevel: stats.weeklyComparisons.averageArLevel
      }
    },
    thirtyDay: {
      title: "Past 30 days",
      range: `Through ${stats.thirtyDayRangeEnd}.`,
      booksRead: stats.thirtyDayBooksRead,
      booksHelper: `Average ${stats.thirtyDayAverageBooksPerDay.toFixed(1)} unique books per day.`,
      sessions: stats.thirtyDayReadingSessions,
      sessionsHelper: `Average ${stats.thirtyDayAverageWeeklySessions.toFixed(1)} sessions per week.`,
      averageArLevel: stats.thirtyDayAverageArLevel,
      comparisons: {
        booksRead: stats.thirtyDayComparisons.booksRead,
        sessions: stats.thirtyDayComparisons.readingSessions,
        averageArLevel: stats.thirtyDayComparisons.averageArLevel
      }
    },
    total: {
      title: "Total summary",
      range: "All reading history.",
      booksRead: stats.totalBooksRead,
      booksHelper: "Unique books with at least one session.",
      sessions: stats.totalReadingSessions,
      sessionsHelper: "Each reread counts.",
      averageArLevel: stats.averageArLevel,
      comparisons: {
        booksRead: undefined,
        sessions: undefined,
        averageArLevel: undefined
      }
    }
  }[summaryPeriod];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-berry">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">{selectedChild.name}'s reading home</h1>
            <p className="mt-2 text-ink/65">
              A simple parent view for reading history, comfort levels, and what might be good next.
            </p>
          </div>
          <ChildSelector />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-bold text-ink">{summary.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{summary.range}</p>
          </div>
          <label className="block sm:w-56">
            <span className="text-sm font-semibold text-ink/70">Summary period</span>
            <select
              className="focus-ring mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
              value={summaryPeriod}
              onChange={(event) => setSummaryPeriod(event.target.value as SummaryPeriod)}
            >
              <option value="weekly">Weekly</option>
              <option value="thirtyDay">Past 30 days</option>
              <option value="total">Total</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Books read"
            value={summary.booksRead}
            helper={summary.booksHelper}
            comparison={summary.comparisons.booksRead}
          />
          <StatCard
            label="Reading sessions"
            value={summary.sessions}
            helper={summary.sessionsHelper}
            comparison={summary.comparisons.sessions}
          />
          <StatCard
            label="Avg AR level"
            value={summary.averageArLevel?.toFixed(1) ?? "None yet"}
            helper="Based on sessions with AR levels."
            comparison={summary.comparisons.averageArLevel}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Most-read book" value={stats.mostReadBook?.title ?? "No logs yet"} />
        <InfoCard title="Favorite series" value={stats.favoriteSeries ?? "Keep logging to learn"} />
        <InfoCard title="Recommended reading range" value={`Comfort ${range.comfort.min.toFixed(1)}-${range.comfort.max.toFixed(1)} | Next ${range.nextStep.min.toFixed(1)}-${range.nextStep.max.toFixed(1)}`} />
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-ink">Recent reading logs</h2>
        <div className="mt-4 space-y-3">
          {stats.recentLogs.length ? (
            stats.recentLogs.map((log) => {
              const book = bookById.get(log.bookId);
              return (
                <div key={log.id} className="flex gap-3 rounded-lg bg-cream p-3">
                  <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-skysoft text-center text-[10px] font-semibold text-ink/55">
                    {book?.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "Book"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{book?.title ?? "Unknown book"}</p>
                    <p className="text-sm text-ink/65">
                      {log.readDate} · {label(log.readingMode)} · liked {log.likedScore}/5 · {label(log.difficulty)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-ink/60">No reading sessions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <p className="text-sm font-semibold text-ink/60">{title}</p>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
    </section>
  );
}

function EmptyState() {
  return <p className="rounded-lg bg-white p-6 text-ink/70">Add a child profile in Settings to begin.</p>;
}

function label(value: string) {
  return value.replaceAll("_", " ");
}
