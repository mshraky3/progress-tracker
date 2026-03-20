import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen() {
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await signUp(email.trim(), password);
            Alert.alert("Success", "Check your email to confirm your account!");
        } catch (err: any) {
            Alert.alert("Sign Up Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            <Link href="/(auth)/login" style={styles.link}>
                <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 32,
    },
    input: {
        backgroundColor: "#16213e",
        color: "#fff",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
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
    link: {
        marginTop: 24,
        alignSelf: "center",
    },
    linkText: {
        color: "#e94560",
        fontSize: 14,
    },
});
