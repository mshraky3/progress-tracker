import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../../lib/supabase/auth";
import type { CreateWebsiteRequest, Website } from "@wedgite/types";

// GET /api/websites — list user's saved websites
export async function GET(req: NextRequest) {
    const auth = await authenticateRequest(req);
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Website[]);
}

// POST /api/websites — add a new website
export async function POST(req: NextRequest) {
    const auth = await authenticateRequest(req);
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    let body: CreateWebsiteRequest;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.name?.trim() || !body.url?.trim()) {
        return NextResponse.json(
            { error: "name and url are required" },
            { status: 400 }
        );
    }

    // Basic URL validation
    try {
        new URL(body.url);
    } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("websites")
        .insert({
            user_id: user.id,
            name: body.name.trim(),
            url: body.url.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Website, { status: 201 });
}

// DELETE /api/websites?id=<uuid> — remove a website
export async function DELETE(req: NextRequest) {
    const auth = await authenticateRequest(req);
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing 'id' query parameter" },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
