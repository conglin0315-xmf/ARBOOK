"use client";

import { ChildSelector } from "@/components/ChildSelector";
import { StatCard } from "@/components/StatCard";
import { useAppData } from "@/lib/AppContext";
import { calculateChildStats, getRecommendedRange } from "@/lib/utils";

export default function DashboardPage() {
  const { data, selectedChild } = useAppData();

  if (!selectedChild) return <EmptyState />;

  const stats = calculateChildStats(data, selectedChild.id);
  const range = getRecommendedRange(selectedChild, data.logs, data.books);
  const bookById = new Map(data.books.map((book) => [book.id, book]));

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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total books read" value={stats.totalBooksRead} />
        <StatCard label="Reading sessions" value={stats.totalReadingSessions} helper="Each reread counts." />
        <StatCard label="Average AR level" value={stats.averageArLevel?.toFixed(1) ?? "None yet"} />
        <StatCard label="Reading Range" value={`${range.comfort.min.toFixed(1)}-${range.nextStep.max.toFixed(1)}`} helper="Comfort through next step." />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Weekly summary</h2>
          <p className="text-sm text-ink/60">Monday {stats.weeklyRangeStart} through Sunday {stats.weeklyRangeEnd}.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Books read"
            value={stats.weeklyBooksRead}
            helper="Unique books this week."
            comparison={stats.weeklyComparisons.booksRead}
          />
          <StatCard
            label="Reading sessions"
            value={stats.weeklyReadingSessions}
            helper="Each reread counts."
            comparison={stats.weeklyComparisons.readingSessions}
          />
          <StatCard
            label="Avg AR level"
            value={stats.weeklyAverageArLevel?.toFixed(1) ?? "None yet"}
            helper="Based on sessions with AR levels."
            comparison={stats.weeklyComparisons.averageArLevel}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">Past 30 days</h2>
          <p className="text-sm text-ink/60">Through {stats.thirtyDayRangeEnd}.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Books read"
            value={stats.thirtyDayBooksRead}
            helper="Unique books in the last 30 days."
            comparison={stats.thirtyDayComparisons.booksRead}
          />
          <StatCard
            label="Avg weekly sessions"
            value={stats.thirtyDayAverageWeeklySessions.toFixed(1)}
            helper={`${stats.thirtyDayReadingSessions} sessions in this window.`}
            comparison={stats.thirtyDayComparisons.averageWeeklySessions}
          />
          <StatCard
            label="Avg AR level"
            value={stats.thirtyDayAverageArLevel?.toFixed(1) ?? "None yet"}
            helper="Based on sessions with AR levels."
            comparison={stats.thirtyDayComparisons.averageArLevel}
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
