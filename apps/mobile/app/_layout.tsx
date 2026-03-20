import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function RootLayoutNav() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!session && !inAuthGroup) {
            // Not signed in — redirect to login
            router.replace("/(auth)/login");
        } else if (session && inAuthGroup) {
            // Signed in but on auth page — redirect to home
            router.replace("/(tabs)");
        }
    }, [session, loading, segments]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
