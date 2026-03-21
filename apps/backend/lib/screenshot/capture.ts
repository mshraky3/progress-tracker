/**
 * Capture a PNG screenshot of the given URL using the Microlink API.
 * This avoids running headless Chromium in a serverless environment.
 */
export async function captureScreenshot(url: string): Promise<Buffer> {
    const apiUrl =
        `https://api.microlink.io/?url=${encodeURIComponent(url)}` +
        `&screenshot=true&meta=false&embed=screenshot.url`;

    const response = await fetch(apiUrl, { redirect: "follow" });

    if (!response.ok) {
        throw new Error(
            `Microlink API error: ${response.status} ${response.statusText}`
        );
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
}
