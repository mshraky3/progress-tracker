import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import useSWR, { mutate } from "swr";
import { apiFetch } from "../../lib/api";
import { REFRESH_INTERVALS } from "@wedgite/types";
import type { Website, CreateWidgetConfigRequest } from "@wedgite/types";

export default function WidgetConfigScreen() {
    const { id: websiteId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [selectedInterval, setSelectedInterval] = useState(15);
    const [loading, setLoading] = useState(false);

    // Get website name for display
    const { data: websites } = useSWR("websites", () =>
        apiFetch<Website[]>("/api/websites")
    );
    const website = websites?.find((w) => w.id === websiteId);

    const handleCreate = async () => {
        if (!websiteId) return;

        setLoading(true);
        try {
            const body: CreateWidgetConfigRequest = {
                website_id: websiteId,
                refresh_interval_minutes: selectedInterval,
            };
            await apiFetch("/api/widgets", {
                method: "POST",
                body: JSON.stringify(body),
            });

            mutate("widgets");
            Alert.alert(
                "Widget Created!",
                "Long-press your home screen and add the Wedgite widget to see it.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Configure Wedgite</Text>
            {website && (
                <Text style={styles.subtitle}>
                    Widget for: {website.name}
                </Text>
            )}

            <Text style={styles.sectionTitle}>Refresh Interval</Text>
            <Text style={styles.hint}>
                How often the widget screenshot should update
            </Text>

            {REFRESH_INTERVALS.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        styles.option,
                        selectedInterval === option.value && styles.optionSelected,
                    ]}
                    onPress={() => setSelectedInterval(option.value)}
                >
                    <Text
                        style={[
                            styles.optionText,
                            selectedInterval === option.value && styles.optionTextSelected,
                        ]}
                    >
                        {option.label}
                    </Text>
                    {selectedInterval === option.value && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </TouchableOpacity>
            ))}

            {selectedInterval === 5 && (
                <Text style={styles.warning}>
                    ⚠️ 5-minute refresh uses more battery and data
                </Text>
            )}

            <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.createButtonText}>Create Wedgite</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
    content: {
        padding: 24,
        paddingTop: 32,
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        color: "#888",
        fontSize: 16,
        marginBottom: 32,
    },
    sectionTitle: {
        color: "#aaa",
        fontSize: 14,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    hint: {
        color: "#666",
        fontSize: 13,
        marginBottom: 16,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#16213e",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#0f3460",
    },
    optionSelected: {
        borderColor: "#e94560",
        backgroundColor: "#1e1e3a",
    },
    optionText: {
        color: "#fff",
        fontSize: 16,
    },
    optionTextSelected: {
        color: "#e94560",
        fontWeight: "600",
    },
    checkmark: {
        color: "#e94560",
        fontSize: 18,
        fontWeight: "bold",
    },
    warning: {
        color: "#ffb74d",
        fontSize: 13,
        marginTop: 8,
        marginBottom: 8,
    },
    createButton: {
        backgroundColor: "#e94560",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 24,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
