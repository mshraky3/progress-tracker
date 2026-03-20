import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "../../../lib/supabase/server";
import { validateScreenshotUrl, hashUrl } from "../../../lib/screenshot/validate";
import { captureScreenshot } from "../../../lib/screenshot/capture";
import type { ScreenshotResponse } from "@wedgite/types";

// Cache screenshots for this many minutes before re-capturing
const CACHE_TTL_MINUTES = 5;

export const maxDuration = 30; // Vercel serverless function timeout (seconds)

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return NextResponse.json(
            { error: "Missing 'url' query parameter" },
            { status: 400 }
        );
    }

    // Validate URL (SSRF protection)
    const validation = validateScreenshotUrl(url);
    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.error },
            { status: 400 }
        );
    }

    const sanitizedUrl = validation.url!;
    const urlHash = hashUrl(sanitizedUrl);
    const supabase = createServiceClient();

    // Check cache
    const { data: cached } = await supabase
        .from("screenshot_cache")
        .select("storage_path, captured_at")
        .eq("url_hash", urlHash)
        .single();

    if (cached) {
        const age = Date.now() - new Date(cached.captured_at).getTime();
        const ttl = CACHE_TTL_MINUTES * 60 * 1000;

        if (age < ttl) {
            // Cache hit — return existing image URL
            const { data: publicUrl } = supabase.storage
                .from("screenshots")
                .getPublicUrl(cached.storage_path);

            const response: ScreenshotResponse = {
                image_url: publicUrl.publicUrl,
                captured_at: cached.captured_at,
                cached: true,
            };
            return NextResponse.json(response);
        }
    }

    // Cache miss or stale — capture fresh screenshot
    try {
        const imageBuffer = await captureScreenshot(sanitizedUrl);
        const storagePath = `${urlHash}.png`;

        // Upload to Supabase Storage (upsert)
        const { error: uploadError } = await supabase.storage
            .from("screenshots")
            .upload(storagePath, imageBuffer, {
                contentType: "image/png",
                upsert: true,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { error: "Failed to store screenshot" },
                { status: 500 }
            );
        }

        // Upsert cache row
        const now = new Date().toISOString();
        await supabase.from("screenshot_cache").upsert({
            url_hash: urlHash,
            storage_path: storagePath,
            captured_at: now,
        });

        const { data: publicUrl } = supabase.storage
            .from("screenshots")
            .getPublicUrl(storagePath);

        const response: ScreenshotResponse = {
            image_url: publicUrl.publicUrl,
            captured_at: now,
            cached: false,
        };
        return NextResponse.json(response);
    } catch (err) {
        console.error("Screenshot capture error:", err);
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            { error: "Failed to capture screenshot", detail: message },
            { status: 500 }
        );
    }
}
