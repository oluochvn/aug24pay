import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiRequest } from "../../api";
import { Button, Field, Notice } from "../../components/ui";
import { useSession } from "../../session";
import { colors } from "../../theme";

export default function LoginScreen() {
  const { signIn, storageError } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(storageError);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const result = await apiRequest<{ token?: string }>("/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim(), password },
      });
      if (!result?.token) throw new Error("The server did not return a login token.");
      await signIn(result.token);
      router.replace("/(tabs)");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not log in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>P</Text></View>
        <Text style={styles.brand}>paytrack</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to your paytrack account</Text>
        <View style={styles.form}>
          {error ? <Notice>{error}</Notice> : null}
          <Field
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            returnKeyType="next"
          />
          <Field
            label="Password"
            autoComplete="current-password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            onSubmitEditing={submit}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowPassword((value) => !value)}
            style={styles.toggle}
          >
            <Text style={styles.linkText}>{showPassword ? "Hide password" : "Show password"}</Text>
          </Pressable>
          <Button title={busy ? "Logging in..." : "Log in"} onPress={submit} disabled={busy} />
        </View>
        <Text style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.linkText}>Sign up</Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 54 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.text, alignItems: "center", justifyContent: "center" },
  brandGlyph: { color: "#fff", fontSize: 18, fontWeight: "700" },
  brand: { color: colors.text, fontSize: 16, fontWeight: "700" },
  content: { width: "100%", maxWidth: 440, alignSelf: "center", marginTop: 70 },
  title: { color: colors.text, fontSize: 29, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: 7 },
  form: { backgroundColor: "#fff", borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 28 },
  toggle: { alignSelf: "flex-end", paddingVertical: 10 },
  linkText: { color: colors.accent, fontWeight: "600" },
  footer: { color: colors.muted, textAlign: "center", marginTop: 24, fontSize: 14 },
});
