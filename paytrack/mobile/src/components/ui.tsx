import type { PropsWithChildren } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";

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
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandGlyph}>P</Text>
          </View>
          <Text style={styles.brand}>paytrack</Text>
        </View>
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
        placeholderTextColor="#a3a3a3"
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
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 28 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.text,
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
    backgroundColor: "#fff",
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  multiline: { minHeight: 84, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 14,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  secondaryButton: { backgroundColor: colors.accentLight },
  secondaryButtonText: { color: colors.accent },
  buttonDimmed: { opacity: 0.55 },
  notice: { borderRadius: 12, padding: 12, marginTop: 14 },
  errorNotice: { backgroundColor: "#fff0f0", borderColor: "#ffd6d6", borderWidth: 1 },
  successNotice: { backgroundColor: "#eaf7ef", borderColor: "#ccebd6", borderWidth: 1 },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
});
