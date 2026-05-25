"use client";

import { supabaseAuthRequest } from "./supabase";

const AUTH_STORAGE_KEY = "ar-reading-tracker-auth-v1";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email?: string;
  };
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
  };
};

type UserResponse = {
  id: string;
  email?: string;
};

export function loadStoredSession() {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  }
}

export function saveStoredSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function signUpWithPassword(email: string, password: string) {
  const response = await supabaseAuthRequest<AuthResponse>("signup", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  return toSession(response);
}

export async function signInWithPassword(email: string, password: string) {
  const response = await supabaseAuthRequest<AuthResponse>("token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  return toSession(response);
}

export async function refreshAuthSession(session: AuthSession) {
  const response = await supabaseAuthRequest<AuthResponse>("token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refreshToken })
  });

  return toSession(response);
}

export async function getAuthUser(accessToken: string) {
  const user = await supabaseAuthRequest<UserResponse>("user", {
    method: "GET",
    accessToken
  });

  return {
    id: user.id,
    email: user.email
  };
}

export async function signOutSession(accessToken: string) {
  await supabaseAuthRequest("logout", {
    method: "POST",
    accessToken
  });
}

function toSession(response: AuthResponse): AuthSession | undefined {
  if (!response.access_token || !response.refresh_token || !response.user) return undefined;

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
    user: {
      id: response.user.id,
      email: response.user.email
    }
  };
}
