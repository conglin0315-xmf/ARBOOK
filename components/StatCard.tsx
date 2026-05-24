type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  comparison?: {
    label: string;
    direction: "up" | "down" | "flat" | "none";
  };
};

export function StatCard({ label, value, helper, comparison }: StatCardProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {helper ? <p className="mt-1 text-sm text-ink/60">{helper}</p> : null}
      {comparison ? (
        <p
          className={`mt-3 text-sm font-bold ${
            comparison.direction === "up"
              ? "text-leaf"
              : comparison.direction === "down"
                ? "text-berry"
                : "text-ink/55"
          }`}
        >
          {comparison.label}
        </p>
      ) : null}
    </section>
  );
}
