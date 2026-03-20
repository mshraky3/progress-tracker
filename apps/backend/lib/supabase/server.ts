import { createClient } from "@supabase/supabase-js";

// Server-side client with service role key — full access, no RLS
export function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

// Server-side client scoped to a user's JWT — RLS enforced
export function createUserClient(accessToken: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, anonKey, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    });
}
