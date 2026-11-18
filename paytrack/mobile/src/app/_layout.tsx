import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "../session";

function Navigation() {
  const { token, ready } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const inAuth = segments[0] === "(auth)";

  useEffect(() => {
    if (!ready) return;
    if (!token && !inAuth) router.replace("/login");
    if (token && inAuth) router.replace("/(tabs)");
  }, [inAuth, ready, router, token]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Navigation />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
