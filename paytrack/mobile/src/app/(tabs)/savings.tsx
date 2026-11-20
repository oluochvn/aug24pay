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
import { colors, formatMoney } from "../../theme";
import type { Goal } from "../../types";

export default function SavingsScreen() {
  const { data, loading, error, refresh, setData } = useApiResource<Goal[]>("/goals");
  const goals = data ?? [];
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [deposit, setDeposit] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
  const progress = totalTarget > 0 ? Math.min(totalSaved / totalTarget * 100, 100) : 0;

  const editGoal = (goal?: Goal) => {
    setEditing(goal ?? null);
    setName(goal?.name ?? "");
    setTarget(goal ? String(goal.targetAmount) : "");
    setFormError("");
  };

  const saveGoal = async () => {
    const targetAmount = Number(target);
    if (!name.trim() || !Number.isFinite(targetAmount) || targetAmount < 1) {
      setFormError("Enter a goal name and a valid target amount.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      if (editing) {
        const updated = await apiRequest<Goal>(`/goals/${editing._id}`, {
          method: "PUT",
          body: { name: name.trim(), targetAmount },
        });
        setData(goals.map((goal) => goal._id === editing._id ? updated : goal));
      } else {
        await apiRequest("/goals", { method: "POST", body: { name: name.trim(), targetAmount } });
        refresh();
      }
      editGoal();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not save goal.");
    } finally {
      setBusy(false);
    }
  };

  const addDeposit = async () => {
    const amount = Number(deposit);
    if (!depositGoal || !Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter a valid deposit amount.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const updated = await apiRequest<Goal>(`/goals/${depositGoal._id}/deposit`, {
        method: "PATCH",
        body: { amount },
      });
      setData(goals.map((goal) => goal._id === updated._id ? updated : goal));
      setDepositGoal(null);
      setDeposit("");
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not add deposit.");
    } finally {
      setBusy(false);
    }
  };

  const removeGoal = (goal: Goal) => {
    Alert.alert("Delete savings goal?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          apiRequest(`/goals/${goal._id}`, { method: "DELETE" })
            .then(() => setData(goals.filter((item) => item._id !== goal._id)))
            .catch((reason: unknown) =>
              Alert.alert("Could not delete goal", reason instanceof Error ? reason.message : "Try again."),
            );
        },
      },
    ]);
  };

  return (
    <>
      <Page
        title="Savings"
        subtitle="Set goals and keep moving toward them."
        onRefresh={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}
      >
        {error ? <Notice>{error}</Notice> : null}
        <Card style={styles.overview}>
          <Text style={styles.overviewLabel}>Saved across your goals</Text>
          <Text style={styles.overviewAmount}>{formatMoney(totalSaved)}</Text>
          <View style={styles.track}><View style={[styles.progress, { width: `${progress}%` }]} /></View>
          <Text style={styles.overviewLabel}>{formatMoney(totalTarget)} total target · {Math.round(progress)}% complete</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>{editing ? "Edit goal" : "Create a savings goal"}</Text>
          <Field label="Goal name" value={name} onChangeText={setName} placeholder="e.g. Emergency fund" />
          <Field label="Target amount (KSH)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="0.00" />
          {formError && !depositGoal ? <Notice>{formError}</Notice> : null}
          <Button title={busy ? "Saving..." : editing ? "Save changes" : "Create goal"} onPress={saveGoal} disabled={busy} />
          {editing ? <Button title="Cancel editing" secondary onPress={() => editGoal()} /> : null}
        </Card>

        {loading && !data ? <Text style={styles.empty}>Loading goals...</Text> : null}
        {goals.length === 0 && !loading ? (
          <Card><Text style={styles.empty}>No savings goals yet. Create your first goal above.</Text></Card>
        ) : null}
        {goals.map((goal) => {
          const percent = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount * 100, 100) : 0;
          return (
            <Card key={goal._id}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <View style={styles.track}><View style={[styles.progress, { width: `${percent}%` }]} /></View>
              <Text style={styles.goalDetails}>{formatMoney(goal.savedAmount)} saved of {formatMoney(goal.targetAmount)} · {Math.round(percent)}%</Text>
              <View style={styles.actions}>
                <Text onPress={() => { setDepositGoal(goal); setDeposit(""); setFormError(""); }} style={styles.action}>Add money</Text>
                <Text onPress={() => editGoal(goal)} style={styles.action}>Edit</Text>
                <Text onPress={() => removeGoal(goal)} style={[styles.action, styles.delete]}>Delete</Text>
              </View>
            </Card>
          );
        })}
      </Page>
      <Modal visible={Boolean(depositGoal)} animationType="slide" onRequestClose={() => setDepositGoal(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.sectionTitle}>Add to {depositGoal?.name}</Text>
            <Pressable onPress={() => { setDepositGoal(null); setFormError(""); }} accessibilityRole="button"><Text style={styles.action}>Close</Text></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Field label="Deposit amount (KSH)" value={deposit} onChangeText={setDeposit} keyboardType="decimal-pad" placeholder="0.00" />
            {formError ? <Notice>{formError}</Notice> : null}
            <Button title={busy ? "Adding..." : "Add deposit"} onPress={addDeposit} disabled={busy} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overview: { backgroundColor: colors.surface, borderColor: colors.border },
  overviewLabel: { color: "#d4d4d8", fontSize: 13 },
  overviewAmount: { color: "#fff", fontSize: 26, fontWeight: "700", marginVertical: 8 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  track: { height: 8, borderRadius: 20, backgroundColor: colors.border, overflow: "hidden", marginVertical: 12 },
  progress: { height: "100%", backgroundColor: colors.accent, borderRadius: 20 },
  goalName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  goalDetails: { color: colors.muted, fontSize: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 18, borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  action: { color: colors.accent, fontSize: 13, fontWeight: "600" },
  delete: { color: colors.negative },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 16 },
  modal: { flex: 1, backgroundColor: colors.background, paddingTop: 52, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
});
