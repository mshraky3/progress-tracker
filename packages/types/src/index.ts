// ─── Database row types (mirrors Supabase tables) ───

export interface Website {
    id: string;
    user_id: string;
    name: string;
    url: string;
    created_at: string;
}

export interface WidgetConfig {
    id: string;
    user_id: string;
    website_id: string;
    refresh_interval_minutes: number;
    created_at: string;
}

export interface ScreenshotCache {
    url_hash: string;
    storage_path: string;
    captured_at: string;
}

// ─── API request / response types ───

export interface CreateWebsiteRequest {
    name: string;
    url: string;
}

export interface CreateWidgetConfigRequest {
    website_id: string;
    refresh_interval_minutes: number;
}

export interface ScreenshotResponse {
    image_url: string;
    captured_at: string;
    cached: boolean;
}

export interface ApiError {
    error: string;
    status: number;
}

// ─── Refresh interval options ───

export const REFRESH_INTERVALS = [
    { label: "5 minutes", value: 5 },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "Manual only", value: 0 },
] as const;

export type RefreshIntervalValue = (typeof REFRESH_INTERVALS)[number]["value"];
