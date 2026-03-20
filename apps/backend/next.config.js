const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@wedgite/types"],
    // Don't bundle these — keeps __dirname pointing to the real node_modules location
    serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
    // Set tracing root to monorepo root (where node_modules actually lives)
    outputFileTracingRoot: path.join(__dirname, "../.."),
    // Explicitly include the chromium binary blob in the function bundle
    outputFileTracingIncludes: {
        "/api/screenshot": ["node_modules/@sparticuz/chromium/bin/**"],
    },
};

module.exports = nextConfig;
