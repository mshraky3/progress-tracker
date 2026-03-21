import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useSWR from "swr";
import { apiFetch } from "../../lib/api";
import type { Website, ScreenshotResponse } from "@wedgite/types";

export default function WebsiteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // Fetch website details
    const { data: websites } = useSWR("websites", () =>
        apiFetch<Website[]>("/api/websites")
    );
    const website = websites?.find((w) => w.id === id);

    // Fetch screenshot
    const {
        data: screenshot,
        isLoading: screenshotLoading,
        mutate: refreshScreenshot,
    } = useSWR(
        website ? `screenshot-${website.url}` : null,
        () =>
            apiFetch<ScreenshotResponse>(
                `/api/screenshot?url=${encodeURIComponent(website!.url)}`
            ),
        { revalidateOnFocus: false }
    );

    if (!website) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#e94560" size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{website.name}</Text>
            <Text style={styles.url}>{website.url}</Text>

            {/* Screenshot preview */}
            <View style={styles.previewContainer}>
                {screenshotLoading ? (
                    <View style={styles.previewPlaceholder}>
                        <ActivityIndicator color="#e94560" size="large" />
                        <Text style={styles.previewText}>Capturing screenshot...</Text>
                    </View>
                ) : screenshot ? (
                    <Image
                        source={{ uri: screenshot.image_url }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.previewPlaceholder}>
                        <Text style={styles.previewText}>No screenshot available</Text>
                    </View>
                )}
            </View>

            {screenshot && (
                <Text style={styles.timestamp}>
                    {screenshot.cached ? "Cached" : "Fresh"} — captured{" "}
                    {new Date(screenshot.captured_at).toLocaleString()}
                </Text>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => refreshScreenshot()}
                >
                    <Text style={styles.actionText}>🔄 Refresh Screenshot</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Linking.openURL(website.url)}
                >
                    <Text style={styles.actionText}>🌐 Open in Browser</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
        padding: 24,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1a2e",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    url: {
        color: "#888",
        fontSize: 14,
        marginBottom: 24,
    },
    previewContainer: {
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#0f3460",
        backgroundColor: "#16213e",
        aspectRatio: 9 / 16,
        width: "100%",
        maxHeight: 400,
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    previewPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    previewText: {
        color: "#888",
        marginTop: 12,
        fontSize: 14,
    },
    timestamp: {
        color: "#666",
        fontSize: 12,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    actions: {
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        backgroundColor: "#16213e",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#0f3460",
    },
    actionText: {
        color: "#e94560",
        fontSize: 16,
        fontWeight: "600",
    },
});
