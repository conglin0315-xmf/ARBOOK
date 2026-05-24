"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadData, saveData } from "./storage";
import { seedData } from "./seed";
import type { AppData, Book, ChildProfile, ReadingLog } from "./types";

type AppContextValue = {
  data: AppData;
  selectedChild?: ChildProfile;
  selectedChildId?: string;
  setSelectedChildId: (childId: string) => void;
  upsertChild: (child: ChildProfile) => void;
  upsertBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  addLog: (log: ReadingLog) => void;
  removeLog: (logId: string) => void;
  upsertLog: (log: ReadingLog) => void;
  replaceData: (data: AppData) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(seedData);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) saveData(data);
  }, [data, hasLoaded]);

  const selectedChildId = data.selectedChildId ?? data.children[0]?.id;
  const selectedChild = data.children.find((child) => child.id === selectedChildId);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      selectedChild,
      selectedChildId,
      setSelectedChildId: (childId) => setData((current) => ({ ...current, selectedChildId: childId })),
      upsertChild: (child) =>
        setData((current) => {
          const exists = current.children.some((item) => item.id === child.id);
          return {
            ...current,
            selectedChildId: child.id,
            children: exists
              ? current.children.map((item) => (item.id === child.id ? child : item))
              : [...current.children, child]
          };
        }),
      upsertBook: (book) =>
        setData((current) => {
          const exists = current.books.some((item) => item.id === book.id);
          return {
            ...current,
            books: exists
              ? current.books.map((item) => (item.id === book.id ? book : item))
              : [...current.books, book]
          };
        }),
      removeBook: (bookId) =>
        setData((current) => ({
          ...current,
          books: current.books.filter((book) => book.id !== bookId),
          logs: current.logs.filter((log) => log.bookId !== bookId)
        })),
      addLog: (log) => setData((current) => ({ ...current, logs: [...current.logs, log] })),
      removeLog: (logId) =>
        setData((current) => ({
          ...current,
          logs: current.logs.filter((log) => log.id !== logId)
        })),
      upsertLog: (log) =>
        setData((current) => ({
          ...current,
          logs: current.logs.map((item) => (item.id === log.id ? log : item))
        })),
      replaceData: (nextData) => setData(nextData)
    }),
    [data, selectedChild, selectedChildId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppProvider.");
  }
  return context;
}
