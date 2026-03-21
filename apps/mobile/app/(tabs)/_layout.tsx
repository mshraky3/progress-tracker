import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: "#1a1a2e" },
                headerTintColor: "#fff",
                tabBarStyle: { backgroundColor: "#1a1a2e", borderTopColor: "#0f3460" },
                tabBarActiveTintColor: "#e94560",
                tabBarInactiveTintColor: "#888",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "My Websites",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🌐</Text>,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: "Add Website",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text>,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
                }}
            />
        </Tabs>
    );
}
