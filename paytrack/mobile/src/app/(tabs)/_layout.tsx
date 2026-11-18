import { Tabs } from "expo-router";
import { colors } from "../../theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", paddingBottom: 3 },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 7,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions", tabBarLabel: "Activity" }} />
      <Tabs.Screen name="savings" options={{ title: "Savings", tabBarLabel: "Savings" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports", tabBarLabel: "Reports" }} />
    </Tabs>
  );
}
