"use client";

import type { BookRecommendation } from "@/lib/types";

export function RecommendationCard({
  recommendation,
  onAddToWishList
}: {
  recommendation: BookRecommendation;
  onAddToWishList?: (recommendation: BookRecommendation) => void;
}) {
  const { book } = recommendation;

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">
          {recommendation.kind === "next_step" ? "Next Step Book" : recommendation.kind === "repeat" ? "Repeat Favorite" : "Comfort Read"}
        </p>
        <h3 className="mt-2 text-base font-bold text-ink">{book.title}</h3>
        <p className="mt-1 text-sm text-ink/65">{book.author}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {typeof book.arLevel === "number" ? <Badge>AR {book.arLevel.toFixed(1)}</Badge> : null}
          {recommendation.sourceArRange ? <Badge>{recommendation.sourceArRange}</Badge> : null}
          {book.series ? <Badge>{book.series}</Badge> : null}
          {book.themes.map((theme) => (
            <Badge key={theme}>{theme}</Badge>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-cream p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-berry">Why recommended</p>
        <p className="mt-1 text-sm text-ink/75">{recommendation.reason}</p>
        {recommendation.sourceName ? (
          <a
            className="mt-2 inline-block text-xs font-bold text-leaf underline-offset-2 hover:underline"
            href={recommendation.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Source: {recommendation.sourceName}
          </a>
        ) : null}
      </div>
      {onAddToWishList ? (
        <button
          className="mt-4 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf/90"
          type="button"
          onClick={() => onAddToWishList(recommendation)}
        >
          Add to Wish List
        </button>
      ) : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink/70">{children}</span>;
}
