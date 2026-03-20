import { useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import useSWR from "swr";
import { apiFetch } from "../../lib/api";
import type { Website } from "@wedgite/types";

const fetcher = () => apiFetch<Website[]>("/api/websites");

export default function WebsitesListScreen() {
    const { data: websites, error, isLoading, mutate } = useSWR("websites", fetcher);
    const router = useRouter();

    const handleDelete = useCallback(
        (website: Website) => {
            Alert.alert(
                "Delete Website",
                `Remove "${website.name}" from your list?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await apiFetch(`/api/websites?id=${website.id}`, {
                                    method: "DELETE",
                                });
                                mutate();
                            } catch (err: any) {
                                Alert.alert("Error", err.message);
                            }
                        },
                    },
                ]
            );
        },
        [mutate]
    );

    const renderItem = ({ item }: { item: Website }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/website/${item.id}`)}
            onLongPress={() => handleDelete(item)}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardUrl} numberOfLines={1}>
                    {item.url}
                </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load websites</Text>
                <TouchableOpacity onPress={() => mutate()}>
                    <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={websites}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => mutate()} />
                }
                contentContainerStyle={
                    websites?.length === 0 ? styles.emptyContainer : undefined
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No websites yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap the + tab to add your first website
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    emptyContainer: {
        flex: 1,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#16213e",
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#0f3460",
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardUrl: {
        color: "#888",
        fontSize: 14,
    },
    chevron: {
        color: "#e94560",
        fontSize: 24,
        marginLeft: 12,
    },
    emptyText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "#888",
        fontSize: 14,
    },
    errorText: {
        color: "#e94560",
        fontSize: 16,
        marginBottom: 12,
    },
    retryText: {
        color: "#e94560",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
