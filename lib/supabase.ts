"use client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const normalizedSupabaseUrl = supabaseUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${normalizedSupabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
