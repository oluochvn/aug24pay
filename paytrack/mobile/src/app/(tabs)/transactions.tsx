import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiRequest } from "../../api";
import { Button, Card, Field, Notice, Page } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { colors, formatDate, formatMoney } from "../../theme";
import type { Transaction, TransactionType } from "../../types";

const categories: Record<TransactionType, string[]> = {
  expense: ["Food & Drink", "Transport", "Housing", "Shopping", "Health", "Education", "Entertainment", "Communication", "Other"],
  income: ["Salary", "Freelance", "Business", "Investments", "Gifts", "Interest", "Rental Income", "Other Income"],
};

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionsScreen() {
  const { data, loading, error, refresh, setData } =
    useApiResource<Transaction[] | { transactions: Transaction[] }>("/transactions");
  const items = Array.isArray(data) ? data : data?.transactions ?? [];
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const closeForm = () => {
    setVisible(false);
    setEditing(null);
    setType("expense");
    setAmount("");
    setCategory("");
    setNote("");
    setDate(today());
    setFormError("");
  };

  const openForm = (transaction?: Transaction) => {
    if (transaction) {
      setEditing(transaction);
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setNote(transaction.note ?? "");
      setDate(transaction.date.slice(0, 10));
    }
    setFormError("");
    setVisible(true);
  };

  const saveTransaction = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    if (!category) {
      setFormError("Choose a category.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const payload = { type, amount: parsedAmount, category, note: note.trim(), date };
      if (editing) {
        const updated = await apiRequest<Transaction>(`/transactions/${editing._id}`, {
          method: "PUT",
          body: payload,
        });
        setData(items.map((item) => item._id === editing._id ? updated : item));
      } else {
        await apiRequest("/transactions", { method: "POST", body: payload });
        refresh();
      }
      closeForm();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not save transaction.");
    } finally {
      setBusy(false);
    }
  };

  const remove = (transaction: Transaction) => {
    Alert.alert("Delete transaction?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          apiRequest(`/transactions/${transaction._id}`, { method: "DELETE" })
            .then(() => setData(items.filter((item) => item._id !== transaction._id)))
            .catch((reason: unknown) =>
              Alert.alert("Could not delete transaction", reason instanceof Error ? reason.message : "Try again."),
            );
        },
      },
    ]);
  };

  const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <Page
        title="Transactions"
        subtitle="Manage your income and expenses."
        onRefresh={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}
      >
        {error ? <Notice>{error}</Notice> : null}
        <View style={styles.summary}>
          <Card style={styles.summaryCard}><Text style={styles.label}>Records</Text><Text style={styles.value}>{items.length}</Text></Card>
          <Card style={styles.summaryCard}><Text style={styles.label}>Income</Text><Text style={[styles.value, styles.positive]}>{formatMoney(income)}</Text></Card>
          <Card style={styles.summaryCard}><Text style={styles.label}>Expenses</Text><Text style={[styles.value, styles.negative]}>{formatMoney(expenses)}</Text></Card>
        </View>
        <Button title="＋  Add transaction" onPress={() => openForm()} />
        {loading && !data ? <Text style={styles.empty}>Loading transactions...</Text> : null}
        {!loading && !error && items.length === 0 ? (
          <Card><Text style={styles.empty}>No transactions yet. Add your first one to see it here.</Text></Card>
        ) : null}
        {items.map((item) => (
          <Card key={item._id}>
            <View style={styles.transaction}>
              <View style={styles.transactionInfo}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.note}>{item.note ? `${item.note} · ` : ""}{formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.value, item.type === "income" ? styles.positive : styles.negative]}>
                {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
              </Text>
            </View>
            <View style={styles.actions}>
              <Text onPress={() => openForm(item)} style={styles.action}>Edit</Text>
              <Text onPress={() => remove(item)} style={[styles.action, styles.negative]}>Delete</Text>
            </View>
          </Card>
        ))}
      </Page>
      <Modal visible={visible} animationType="slide" onRequestClose={closeForm}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editing ? "Edit transaction" : "Add transaction"}</Text>
            <Pressable onPress={closeForm} accessibilityRole="button"><Text style={styles.close}>Close</Text></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Type</Text>
            <View style={styles.chips}>
              {(["expense", "income"] as const).map((value) => (
                <Pressable key={value} onPress={() => { setType(value); setCategory(""); }} style={[styles.chip, type === value && styles.selectedChip]}>
                  <Text style={[styles.chipText, type === value && styles.selectedChipText]}>{value === "expense" ? "Expense" : "Income"}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Amount (KSH)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
            <Text style={[styles.label, styles.categoryLabel]}>Category</Text>
            <View style={styles.chips}>
              {categories[type].map((value) => (
                <Pressable key={value} onPress={() => setCategory(value)} style={[styles.chip, category === value && styles.selectedChip]}>
                  <Text style={[styles.chipText, category === value && styles.selectedChipText]}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" />
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-01-31" />
            {formError ? <Notice>{formError}</Notice> : null}
            <Button title={busy ? "Saving..." : editing ? "Save changes" : "Add transaction"} onPress={saveTransaction} disabled={busy} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: 8 },
  summaryCard: { flex: 1, padding: 12 },
  label: { color: colors.muted, fontSize: 12 },
  value: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 6 },
  positive: { color: colors.positive },
  negative: { color: colors.negative },
  transaction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  transactionInfo: { flex: 1 },
  category: { color: colors.text, fontSize: 15, fontWeight: "600" },
  note: { color: colors.muted, fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 20, borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 10 },
  action: { color: colors.accent, fontSize: 13, fontWeight: "600" },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  modal: { flex: 1, backgroundColor: colors.background, paddingTop: 52, paddingHorizontal: 20, paddingBottom: 24 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { color: colors.text, fontSize: 21, fontWeight: "700" },
  close: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9 },
  selectedChip: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 13 },
  selectedChipText: { color: colors.accent, fontWeight: "600" },
  categoryLabel: { marginTop: 18 },
});
