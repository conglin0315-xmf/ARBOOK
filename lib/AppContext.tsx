"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredSession,
  getAuthUser,
  loadStoredSession,
  refreshAuthSession,
  saveStoredSession,
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
  type AuthSession
} from "./auth";
import { loadData, saveData } from "./storage";
import { seedData } from "./seed";
import { isSupabaseConfigured } from "./supabase";
import {
  addSupabaseLog,
  claimUnownedSupabaseData,
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
  isAuthReady: boolean;
  isAuthenticated: boolean;
  authUserEmail?: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const emptyData: AppData = { children: [], books: [], logs: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(isSupabaseConfigured ? emptyData : seedData);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [session, setSession] = useState<AuthSession | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function hydrateData() {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) setData(loadData());
          return;
        }

        const restoredSession = await restoreSession();
        if (!isMounted) return;

        if (!restoredSession) {
          setSession(undefined);
          setData(emptyData);
          return;
        }

        setSession(restoredSession);
        await claimUnownedSupabaseData(restoredSession.accessToken);
        const nextData = await loadSupabaseData(restoredSession.accessToken);
        if (isMounted) setData(nextData);
      } catch (error) {
        console.error("Could not load app data.", error);
        clearStoredSession();
        if (isMounted) {
          setSession(undefined);
          setData(isSupabaseConfigured ? emptyData : loadData());
        }
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
        if (isSupabaseConfigured && session) {
          void upsertSupabaseChild(child, session.accessToken).catch((error) => console.error("Could not save child profile.", error));
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
        if (isSupabaseConfigured && session) {
          void upsertSupabaseBook(book, session.accessToken).catch((error) => console.error("Could not save book.", error));
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
        if (isSupabaseConfigured && session) {
          void removeSupabaseBook(bookId, session.accessToken).catch((error) => console.error("Could not remove book.", error));
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
        if (isSupabaseConfigured && session) {
          void addSupabaseLog(log, session.accessToken).catch((error) => console.error("Could not save reading log.", error));
        }
        setData((current) => {
          return { ...current, logs: [...current.logs, log] };
        });
      },
      removeLog: (logId) => {
        if (isSupabaseConfigured && session) {
          void removeSupabaseLog(logId, session.accessToken).catch((error) => console.error("Could not remove reading log.", error));
        }
        setData((current) => {
          return {
            ...current,
            logs: current.logs.filter((log) => log.id !== logId)
          };
        });
      },
      upsertLog: (log) => {
        if (isSupabaseConfigured && session) {
          void upsertSupabaseLog(log, session.accessToken).catch((error) => console.error("Could not update reading log.", error));
        }
        setData((current) => {
          return {
            ...current,
            logs: current.logs.map((item) => (item.id === log.id ? log : item))
          };
        });
      },
      replaceData: (nextData) => {
        if (isSupabaseConfigured && session) {
          void replaceSupabaseData(nextData, session.accessToken).catch((error) => console.error("Could not replace Supabase data.", error));
        }
        setData(nextData);
      },
      isCloudSyncEnabled: isSupabaseConfigured,
      isAuthReady: hasLoaded,
      isAuthenticated: !isSupabaseConfigured || Boolean(session),
      authUserEmail: session?.user.email,
      signIn: async (email, password) => {
        const nextSession = await signInWithPassword(email, password);
        if (!nextSession) throw new Error("Could not sign in. Please check your email confirmation and password.");
        saveStoredSession(nextSession);
        setSession(nextSession);
        await claimUnownedSupabaseData(nextSession.accessToken);
        setData(await loadSupabaseData(nextSession.accessToken));
      },
      signUp: async (email, password) => {
        const nextSession = await signUpWithPassword(email, password);
        if (!nextSession) return "Account created. Check your email to confirm it, then sign in.";
        saveStoredSession(nextSession);
        setSession(nextSession);
        await claimUnownedSupabaseData(nextSession.accessToken);
        setData(await loadSupabaseData(nextSession.accessToken));
        return undefined;
      },
      signOut: async () => {
        if (session) {
          await signOutSession(session.accessToken).catch(() => undefined);
        }
        clearStoredSession();
        setSession(undefined);
        setData(isSupabaseConfigured ? emptyData : loadData());
      }
    }),
    [data, hasLoaded, selectedChild, selectedChildId, session]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

async function restoreSession() {
  const storedSession = loadStoredSession();
  if (!storedSession) return undefined;

  const needsRefresh = Date.now() > storedSession.expiresAt - 60_000;
  const nextSession = needsRefresh ? await refreshAuthSession(storedSession) : storedSession;
  if (!nextSession) return undefined;

  const user = await getAuthUser(nextSession.accessToken);
  const verifiedSession = {
    ...nextSession,
    user
  };
  saveStoredSession(verifiedSession);
  return verifiedSession;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppProvider.");
  }
  return context;
}
