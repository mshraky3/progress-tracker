import { supabase } from "./supabase";

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

/**
 * Make an authenticated request to the Wedgite backend API.
 * Automatically attaches the user's JWT.
 */
export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Not authenticated");
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }

    return res.json();
}
