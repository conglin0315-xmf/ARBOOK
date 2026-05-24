"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChildSelector } from "@/components/ChildSelector";
import { useAppData } from "@/lib/AppContext";
import { exportData, importData } from "@/lib/storage";
import type { ChildProfile } from "@/lib/types";
import { formatTags, makeId, splitTags } from "@/lib/utils";

export default function SettingsPage() {
  const { data, selectedChild, upsertChild, replaceData } = useAppData();
  const [backup, setBackup] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-berry">Settings</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Child profile and backups</h1>
            <p className="mt-2 text-ink/65">
              Set the comfort AR range and favorites that guide recommendations.
            </p>
          </div>
          {data.children.length ? <ChildSelector /> : null}
        </div>
      </section>

      <ChildProfileForm selectedChild={selectedChild} onSave={(child) => {
        upsertChild(child);
        setMessage("Child profile saved.");
      }} />

      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-bold text-ink">Export or import JSON backup</h2>
        <p className="mt-1 text-sm text-ink/60">This includes profiles, books, and reading logs from localStorage.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" onClick={() => {
            setBackup(exportData(data));
            setMessage("Backup exported below.");
          }}>
            Export JSON
          </button>
          <button className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink" onClick={() => {
            try {
              replaceData(importData(backup));
              setMessage("Backup imported.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not import backup.");
            }
          }}>
            Import JSON
          </button>
        </div>
        <textarea className="focus-ring mt-4 min-h-52 w-full rounded-lg border border-ink/15 px-3 py-2 font-mono text-xs" value={backup} onChange={(event) => setBackup(event.target.value)} placeholder="Exported JSON or pasted backup" />
        {message ? <p className="mt-3 text-sm font-semibold text-leaf">{message}</p> : null}
      </section>
    </div>
  );
}

function ChildProfileForm({
  selectedChild,
  onSave
}: {
  selectedChild?: ChildProfile;
  onSave: (child: ChildProfile) => void;
}) {
  const [id, setId] = useState(selectedChild?.id ?? makeId("child"));
  const [name, setName] = useState(selectedChild?.name ?? "");
  const [age, setAge] = useState(String(selectedChild?.age ?? 5));
  const [grade, setGrade] = useState(selectedChild?.grade ?? "");
  const [min, setMin] = useState(String(selectedChild?.currentComfortArMin ?? 0.8));
  const [max, setMax] = useState(String(selectedChild?.currentComfortArMax ?? 1.4));
  const [themes, setThemes] = useState(formatTags(selectedChild?.favoriteThemes ?? []));
  const [series, setSeries] = useState(formatTags(selectedChild?.favoriteSeries ?? []));

  useEffect(() => {
    if (!selectedChild) return;
    setId(selectedChild.id);
    setName(selectedChild.name);
    setAge(String(selectedChild.age));
    setGrade(selectedChild.grade);
    setMin(String(selectedChild.currentComfortArMin));
    setMax(String(selectedChild.currentComfortArMax));
    setThemes(formatTags(selectedChild.favoriteThemes));
    setSeries(formatTags(selectedChild.favoriteSeries));
  }, [selectedChild]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({
      id,
      name: name.trim(),
      age: Number(age),
      grade: grade.trim(),
      currentComfortArMin: Number(min),
      currentComfortArMax: Number(max),
      favoriteThemes: splitTags(themes),
      favoriteSeries: splitTags(series).map((item) => titleCase(item))
    });
  }

  function startNewProfile() {
    setId(makeId("child"));
    setName("");
    setAge("5");
    setGrade("");
    setMin("0.8");
    setMax("1.4");
    setThemes("");
    setSeries("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Child profile</h2>
        <div className="flex gap-2">
          <button className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink" type="button" onClick={startNewProfile}>
            New child
          </button>
          <button className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" type="submit">
            Save profile
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={name} onChange={setName} required />
        <Field label="Age" type="number" value={age} onChange={setAge} required />
        <Field label="Grade" value={grade} onChange={setGrade} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Comfort AR min" type="number" step="0.1" value={min} onChange={setMin} required />
          <Field label="Comfort AR max" type="number" step="0.1" value={max} onChange={setMax} required />
        </div>
        <Field label="Favorite themes" value={themes} onChange={setThemes} placeholder="animals, funny" />
        <Field label="Favorite series" value={series} onChange={setSeries} placeholder="Biscuit, Pete the Cat" />
      </div>
    </form>
  );
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
      <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} type={type} required={required} placeholder={placeholder} step={step} />
    </label>
  );
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
