import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

// Vercel's AL2023 runtime keeps libnss3 + libnspr4 in /usr/lib64.
// Prepend it so the dynamic linker finds them when launching chromium.
process.env.LD_LIBRARY_PATH = `/usr/lib64:${process.env.LD_LIBRARY_PATH ?? ""}`;

// Remote binary URL — downloaded once per instance and cached in /tmp.
// This sidesteps the bundled-binary path issue in pnpm monorepos on Vercel.
const CHROMIUM_BINARY_URL =
    "https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar";

/**
 * Capture a PNG screenshot of the given URL using headless Chromium.
 * Designed to run inside a Vercel serverless function.
 */
export async function captureScreenshot(url: string): Promise<Buffer> {
    const executablePath = await chromium.executablePath(CHROMIUM_BINARY_URL);

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1080, height: 1920 },
        executablePath,
        headless: chromium.headless,
    });

    try {
        const page = await browser.newPage();

        // Set a reasonable timeout and wait for network to settle
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 15000,
        });

        // Small delay to let JS-rendered content finish
        await new Promise((r) => setTimeout(r, 1000));

        const screenshot = await page.screenshot({
            type: "png",
            fullPage: false, // viewport-only — fits widget better
        });

        return Buffer.from(screenshot);
    } finally {
        await browser.close();
    }
}
