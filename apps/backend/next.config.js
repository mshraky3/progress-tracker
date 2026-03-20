/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@wedgite/types"],
    outputFileTracingIncludes: {
        "/api/screenshot": ["./node_modules/@sparticuz/chromium/bin/**"],
    },
};

module.exports = nextConfig;
