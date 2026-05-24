"use client";

import { useAppData } from "@/lib/AppContext";

export function ChildSelector() {
  const { data, selectedChildId, setSelectedChildId } = useAppData();

  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink/70">Child profile</span>
      <select
        className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
        value={selectedChildId}
        onChange={(event) => setSelectedChildId(event.target.value)}
      >
        {data.children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name}, {child.grade}
          </option>
        ))}
      </select>
    </label>
  );
}
