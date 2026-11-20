import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "../session";
import { Loading } from "../components/ui";

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

  if (!ready) return <Loading />;

  return (
    <>
      <StatusBar style="light" />
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
