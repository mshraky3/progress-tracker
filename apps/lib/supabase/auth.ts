import { NextRequest, NextResponse } from "next/server";
import { createUserClient } from "./server";

/**
 * Extract and verify the JWT from the Authorization header.
 * Returns the authenticated Supabase client and user, or an error response.
 */
export async function authenticateRequest(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return {
            error: NextResponse.json(
                { error: "Missing or invalid Authorization header" },
                { status: 401 }
            ),
        };
    }

    const token = authHeader.slice(7);
    const supabase = createUserClient(token);

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return {
            error: NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            ),
        };
    }

    return { supabase, user };
}
