import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function SettingsScreen() {
    const { user, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: signOut,
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.label}>Account</Text>
                <Text style={styles.value}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>App Version</Text>
                <Text style={styles.value}>0.1.0</Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
        padding: 24,
        paddingTop: 32,
    },
    section: {
        backgroundColor: "#16213e",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#0f3460",
    },
    label: {
        color: "#888",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6,
    },
    value: {
        color: "#fff",
        fontSize: 16,
    },
    signOutButton: {
        backgroundColor: "#16213e",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#e94560",
    },
    signOutText: {
        color: "#e94560",
        fontSize: 16,
        fontWeight: "600",
    },
});
