import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiRequest } from "../../api";
import { Button, Field, Notice } from "../../components/ui";
import { colors } from "../../theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Complete all the required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await apiRequest("/register", {
        method: "POST",
        auth: false,
        body: { username: name.trim(), email: email.trim(), password },
      });
      router.replace("/login");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create account.");
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up to get started with paytrack</Text>
        <View style={styles.form}>
          {error ? <Notice>{error}</Notice> : null}
          <Field label="Username" autoCapitalize="words" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 6 characters" />
          <Field label="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat your password" onSubmitEditing={submit} />
          <Button title={busy ? "Creating account..." : "Create account"} onPress={submit} disabled={busy} />
        </View>
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.linkText}>Log in</Link>
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
  content: { width: "100%", maxWidth: 440, alignSelf: "center", marginTop: 34 },
  title: { color: colors.text, fontSize: 27, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: 7 },
  form: { backgroundColor: "#fff", borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 24 },
  linkText: { color: colors.accent, fontWeight: "600" },
  footer: { color: colors.muted, textAlign: "center", marginTop: 22, fontSize: 14 },
});
