import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../../lib/supabase/auth";
import type { CreateWidgetConfigRequest, WidgetConfig } from "@wedgite/types";

const ALLOWED_INTERVALS = [0, 5, 15, 30, 60];

// GET /api/widgets — list user's widget configs
export async function GET(req: NextRequest) {
    const auth = await authenticateRequest(req);
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    const { data, error } = await supabase
        .from("widget_configs")
        .select("*, websites(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST /api/widgets — create a new widget config
export async function POST(req: NextRequest) {
    const auth = await authenticateRequest(req);
    if ("error" in auth) return auth.error;

    const { supabase, user } = auth;

    let body: CreateWidgetConfigRequest;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.website_id) {
        return NextResponse.json(
            { error: "website_id is required" },
            { status: 400 }
        );
    }

    if (!ALLOWED_INTERVALS.includes(body.refresh_interval_minutes)) {
        return NextResponse.json(
            { error: `refresh_interval_minutes must be one of: ${ALLOWED_INTERVALS.join(", ")}` },
            { status: 400 }
        );
    }

    // Verify the website belongs to this user
    const { data: website } = await supabase
        .from("websites")
        .select("id")
        .eq("id", body.website_id)
        .eq("user_id", user.id)
        .single();

    if (!website) {
        return NextResponse.json(
            { error: "Website not found or not owned by you" },
            { status: 404 }
        );
    }

    const { data, error } = await supabase
        .from("widget_configs")
        .insert({
            user_id: user.id,
            website_id: body.website_id,
            refresh_interval_minutes: body.refresh_interval_minutes,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as WidgetConfig, { status: 201 });
}

// DELETE /api/widgets?id=<uuid> — remove a widget config
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
        .from("widget_configs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
