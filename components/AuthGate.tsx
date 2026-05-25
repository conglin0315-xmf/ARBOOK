"use client";

import { FormEvent, useState } from "react";
import { useAppData } from "@/lib/AppContext";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthReady, isAuthenticated, isCloudSyncEnabled, authUserEmail, signIn, signOut, signUp } = useAppData();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthReady) {
    return <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink/60 sm:px-6 lg:px-8">Loading reading tracker...</p>;
  }

  if (!isCloudSyncEnabled) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return (
      <>
        <div className="border-b border-leaf/15 bg-skysoft">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
            <span className="font-semibold text-ink/70">Signed in{authUserEmail ? ` as ${authUserEmail}` : ""}</span>
            <button className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 font-semibold text-ink/70" type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const signUpMessage = mode === "signup" ? await signUp(email.trim(), password) : undefined;
      if (mode === "signin") await signIn(email.trim(), password);
      if (signUpMessage) setMessage(signUpMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wide text-berry">Family login</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{mode === "signin" ? "Sign in to your reading tracker" : "Create your family login"}</h1>
        <p className="mt-2 text-sm text-ink/65">Only signed-in users can see their own child profiles, books, and reading sessions.</p>

        <div className="mt-5 grid gap-3">
          <label>
            <span className="text-sm font-semibold text-ink/70">Email</span>
            <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink/70">Password</span>
            <input className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
          </label>
        </div>

        {message ? <p className="mt-3 rounded-lg bg-cream p-3 text-sm font-semibold text-ink/75">{message}</p> : null}

        <button className="mt-5 w-full rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white disabled:bg-ink/25" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          className="mt-3 w-full text-sm font-semibold text-leaf"
          type="button"
          onClick={() => {
            setMode((current) => (current === "signin" ? "signup" : "signin"));
            setMessage("");
          }}
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
