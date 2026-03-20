import { createHash } from "crypto";

/**
 * Validate a URL for screenshot capture.
 * Blocks private/loopback IPs to prevent SSRF.
 */
export function validateScreenshotUrl(raw: string): {
    valid: boolean;
    url?: string;
    error?: string;
} {
    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return { valid: false, error: "Invalid URL format" };
    }

    // Only allow http(s)
    if (!["http:", "https:"].includes(parsed.protocol)) {
        return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    // Block private / loopback hostnames
    const hostname = parsed.hostname.toLowerCase();
    const blocked = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "[::1]",
        "169.254.169.254", // cloud metadata
    ];
    if (blocked.includes(hostname)) {
        return { valid: false, error: "Private or loopback addresses are not allowed" };
    }

    // Block common private IP ranges
    const ipv4Parts = hostname.split(".").map(Number);
    if (ipv4Parts.length === 4 && ipv4Parts.every((n) => !isNaN(n))) {
        const [a, b] = ipv4Parts;
        if (
            a === 10 ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168)
        ) {
            return { valid: false, error: "Private IP addresses are not allowed" };
        }
    }

    return { valid: true, url: parsed.toString() };
}

/**
 * Hash a URL to use as a cache key / file name.
 */
export function hashUrl(url: string): string {
    return createHash("sha256").update(url).digest("hex").slice(0, 16);
}
