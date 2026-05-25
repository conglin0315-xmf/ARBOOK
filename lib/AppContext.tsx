"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadData, saveData } from "./storage";
import { seedData } from "./seed";
import { isSupabaseConfigured } from "./supabase";
import {
  addSupabaseLog,
  loadSupabaseData,
  removeSupabaseBook,
  removeSupabaseLog,
  replaceSupabaseData,
  upsertSupabaseBook,
  upsertSupabaseChild,
  upsertSupabaseLog
} from "./supabaseStorage";
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
  isCloudSyncEnabled: boolean;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(seedData);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateData() {
      try {
        const nextData = isSupabaseConfigured ? await loadSupabaseData() : loadData();
        if (isMounted) setData(nextData);
      } catch (error) {
        console.error("Could not load Supabase data. Falling back to localStorage.", error);
        if (isMounted) setData(loadData());
      } finally {
        if (isMounted) setHasLoaded(true);
      }
    }

    void hydrateData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoaded && !isSupabaseConfigured) saveData(data);
  }, [data, hasLoaded]);

  const selectedChildId = data.selectedChildId ?? data.children[0]?.id;
  const selectedChild = data.children.find((child) => child.id === selectedChildId);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      selectedChild,
      selectedChildId,
      setSelectedChildId: (childId) => setData((current) => ({ ...current, selectedChildId: childId })),
      upsertChild: (child) => {
        if (isSupabaseConfigured) {
          void upsertSupabaseChild(child).catch((error) => console.error("Could not save child profile.", error));
        }
        setData((current) => {
          const exists = current.children.some((item) => item.id === child.id);
          return {
            ...current,
            selectedChildId: child.id,
            children: exists
              ? current.children.map((item) => (item.id === child.id ? child : item))
              : [...current.children, child]
          };
        });
      },
      upsertBook: (book) => {
        if (isSupabaseConfigured) {
          void upsertSupabaseBook(book).catch((error) => console.error("Could not save book.", error));
        }
        setData((current) => {
          const exists = current.books.some((item) => item.id === book.id);
          return {
            ...current,
            books: exists
              ? current.books.map((item) => (item.id === book.id ? book : item))
              : [...current.books, book]
          };
        });
      },
      removeBook: (bookId) => {
        if (isSupabaseConfigured) {
          void removeSupabaseBook(bookId).catch((error) => console.error("Could not remove book.", error));
        }
        setData((current) => {
          return {
            ...current,
            books: current.books.filter((book) => book.id !== bookId),
            logs: current.logs.filter((log) => log.bookId !== bookId)
          };
        });
      },
      addLog: (log) => {
        if (isSupabaseConfigured) {
          void addSupabaseLog(log).catch((error) => console.error("Could not save reading log.", error));
        }
        setData((current) => {
          return { ...current, logs: [...current.logs, log] };
        });
      },
      removeLog: (logId) => {
        if (isSupabaseConfigured) {
          void removeSupabaseLog(logId).catch((error) => console.error("Could not remove reading log.", error));
        }
        setData((current) => {
          return {
            ...current,
            logs: current.logs.filter((log) => log.id !== logId)
          };
        });
      },
      upsertLog: (log) => {
        if (isSupabaseConfigured) {
          void upsertSupabaseLog(log).catch((error) => console.error("Could not update reading log.", error));
        }
        setData((current) => {
          return {
            ...current,
            logs: current.logs.map((item) => (item.id === log.id ? log : item))
          };
        });
      },
      replaceData: (nextData) => {
        if (isSupabaseConfigured) {
          void replaceSupabaseData(nextData).catch((error) => console.error("Could not replace Supabase data.", error));
        }
        setData(nextData);
      },
      isCloudSyncEnabled: isSupabaseConfigured
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
