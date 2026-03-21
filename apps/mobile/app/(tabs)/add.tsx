import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { mutate } from "swr";
import { apiFetch } from "../../lib/api";
import type { CreateWebsiteRequest } from "@wedgite/types";

export default function AddWebsiteScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("https://");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a name for this website");
            return;
        }

        // Basic URL check
        try {
            new URL(url);
        } catch {
            Alert.alert("Error", "Please enter a valid URL (e.g. https://example.com)");
            return;
        }

        setLoading(true);
        try {
            const body: CreateWebsiteRequest = { name: name.trim(), url: url.trim() };
            await apiFetch("/api/websites", {
                method: "POST",
                body: JSON.stringify(body),
            });

            // Refresh the websites list
            mutate("websites");

            Alert.alert("Success", `${name} has been added!`, [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.form}>
                <Text style={styles.label}>Website Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. My Portfolio"
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />

                <Text style={styles.label}>URL</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://example.com"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="url"
                    value={url}
                    onChangeText={setUrl}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Add Website</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
    form: {
        padding: 24,
        paddingTop: 32,
    },
    label: {
        color: "#aaa",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    input: {
        backgroundColor: "#16213e",
        color: "#fff",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#0f3460",
    },
    button: {
        backgroundColor: "#e94560",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
