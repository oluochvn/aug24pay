import { Tabs } from "expo-router";
import { ArrowLeftRight, BarChart3, Home, PiggyBank } from "lucide-react-native";
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarLabel: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <ArrowLeftRight color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: "Savings",
          tabBarLabel: "Savings",
          tabBarIcon: ({ color, focused }) => (
            <PiggyBank color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
