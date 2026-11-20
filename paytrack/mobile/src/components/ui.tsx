import { useState, type PropsWithChildren } from "react";
import { router } from "expo-router";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";
import { useSession } from "../session";
import TabIcon from "./TabIcon";

const navigationItems = [
  { label: "Home", href: "/(tabs)", icon: "home" },
  { label: "Activity", href: "/(tabs)/transactions", icon: "activity" },
  { label: "Savings", href: "/(tabs)/savings", icon: "savings" },
  { label: "Reports", href: "/(tabs)/reports", icon: "reports" },
] as const;

export function Page({
  title,
  subtitle,
  children,
  onRefresh,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  onRefresh?: ScrollViewProps["refreshControl"];
}>) {
  const { signOut } = useSession();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (reason) {
      Alert.alert(
        "Could not log out",
        reason instanceof Error ? reason.message : "Try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandDetails}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={navigationOpen ? "Close navigation" : "Open navigation"}
              accessibilityState={{ expanded: navigationOpen }}
              onPress={() => setNavigationOpen((open) => !open)}
              style={styles.menuButton}
            >
              {navigationOpen ? (
                <X color={colors.muted} size={20} />
              ) : (
                <TabIcon name="menu" color={colors.muted} size={20} />
              )}
            </Pressable>
            <View style={styles.brandMark}>
              <Text style={styles.brandGlyph}>P</Text>
            </View>
            <Text style={styles.brand}>paytrack</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <TabIcon name="logout" color={colors.muted} size={19} />
          </Pressable>
        </View>
        {navigationOpen ? (
          <View style={styles.navigationList}>
            {navigationItems.map((item) => (
              <Pressable
                key={item.href}
                accessibilityRole="button"
                onPress={() => {
                  setNavigationOpen(false);
                  router.push(item.href);
                }}
                style={styles.navigationItem}
              >
                <TabIcon name={item.icon} color={colors.muted} size={20} />
                <Text style={styles.navigationLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        (disabled || pressed) && styles.buttonDimmed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Notice({
  children,
  success = false,
}: PropsWithChildren<{ success?: boolean }>) {
  return (
    <View style={[styles.notice, success ? styles.successNotice : styles.errorNotice]}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <SafeAreaView style={styles.loading}>
      <View style={styles.loadingContent}>
        <View style={styles.brandMark}>
          <Text style={styles.brandGlyph}>P</Text>
        </View>
        <Text style={styles.loadingTitle}>paytrack</Text>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingMessage}>Loading your account...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 28, justifyContent: "space-between" },
  brandDetails: { flexDirection: "row", alignItems: "center", gap: 9 },
  menuButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  logoutButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  navigationList: { gap: 4, padding: 8, marginTop: -16, marginBottom: 16, borderRadius: 14, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.surface },
  navigationItem: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 11 },
  navigationLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
  loadingContent: { alignItems: "center", gap: 14 },
  loadingTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  loadingMessage: { color: colors.muted, fontSize: 14 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  brandGlyph: { color: "#fff", fontSize: 17, fontWeight: "700" },
  brand: { color: colors.text, fontSize: 15, fontWeight: "700" },
  pageTitle: { color: colors.text, fontSize: 26, fontWeight: "700" },
  pageSubtitle: { color: colors.muted, fontSize: 14, marginTop: 4, marginBottom: 18 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    marginTop: 14,
  },
  field: { marginTop: 14 },
  fieldLabel: { color: colors.muted, fontSize: 13, fontWeight: "600", marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  multiline: { minHeight: 84, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 14,
  },
  buttonText: { color: "#09090a", fontSize: 15, fontWeight: "600" },
  secondaryButton: { backgroundColor: colors.accentLight },
  secondaryButtonText: { color: colors.accent },
  buttonDimmed: { opacity: 0.55 },
  notice: { borderRadius: 12, padding: 12, marginTop: 14 },
  errorNotice: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  successNotice: { backgroundColor: colors.accentLight, borderColor: "#285338", borderWidth: 1 },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
});
