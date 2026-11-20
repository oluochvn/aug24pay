import { router } from "expo-router";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { Button, Card, Notice, Page } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { colors, formatDate, formatMoney } from "../../theme";
import type { Summary } from "../../types";

export default function DashboardScreen() {
  const { data, loading, error, refresh } = useApiResource<Summary>("/summary");
  const username = data?.user?.username || "there";

  return (
    <Page
      title={`Hello, ${username}`}
      subtitle="Take control of your money."
      onRefresh={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}
    >
      {error ? <Notice>{error}</Notice> : null}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total balance</Text>
        <Text style={styles.balance}>{loading && !data ? "Loading..." : formatMoney(data?.balance)}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.income}>{formatMoney(data?.income)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.expense}>{formatMoney(data?.expenses)}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.quickActions}>
        <Button title="Add transaction" onPress={() => router.push("/(tabs)/transactions")} />
      </View>

      <Card>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <Text onPress={() => router.push("/(tabs)/transactions")} style={styles.link}>View all</Text>
        </View>
        {data?.recentTransactions?.length ? (
          data.recentTransactions.slice(0, 5).map((transaction) => (
            <View key={transaction._id} style={styles.row}>
              <View style={styles.rowDetails}>
                <Text style={styles.rowTitle}>{transaction.category}</Text>
                <Text style={styles.rowSub}>{transaction.note ? `${transaction.note} · ` : ""}{formatDate(transaction.date)}</Text>
              </View>
              <Text style={[styles.amount, transaction.type === "income" ? styles.income : styles.expense]}>
                {transaction.type === "income" ? "+" : "-"}{formatMoney(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>{loading ? "Loading transactions..." : "No transactions yet."}</Text>
        )}
      </Card>

      <Card>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Savings goals</Text>
          <Text onPress={() => router.push("/(tabs)/savings")} style={styles.link}>View goals</Text>
        </View>
        {data?.goals?.length ? (
          data.goals.slice(0, 3).map((goal) => {
            const progress = goal.targetAmount > 0
              ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
              : 0;
            return (
              <View key={goal._id} style={styles.goal}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.rowTitle}>{goal.name}</Text>
                  <Text style={styles.rowSub}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.progress, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.rowSub}>{formatMoney(goal.savedAmount)} saved of {formatMoney(goal.targetAmount)}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.empty}>{loading ? "Loading goals..." : "No savings goals yet."}</Text>
        )}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  balanceCard: { backgroundColor: colors.surface, borderColor: colors.border, padding: 21 },
  balanceLabel: { color: "#d4d4d8", fontSize: 13 },
  balance: { color: "#fff", fontSize: 29, fontWeight: "700", marginTop: 6 },
  summaryRow: { flexDirection: "row", marginTop: 24, gap: 30 },
  summaryItem: { flex: 1 },
  summaryLabel: { color: "#d4d4d8", fontSize: 12 },
  income: { color: colors.positive, fontSize: 13, fontWeight: "600", marginTop: 5 },
  expense: { color: colors.negative, fontSize: 13, fontWeight: "600", marginTop: 5 },
  quickActions: { flexDirection: "row", gap: 10, marginTop: 2 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  link: { color: colors.accent, fontSize: 13, fontWeight: "600", paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 13, marginTop: 13 },
  rowDetails: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  rowSub: { color: colors.muted, fontSize: 12, marginTop: 5 },
  amount: { fontSize: 13, fontWeight: "600", textAlign: "right" },
  empty: { color: colors.muted, fontSize: 13, marginTop: 14 },
  goal: { marginTop: 16 },
  track: { height: 7, borderRadius: 99, backgroundColor: colors.border, overflow: "hidden", marginVertical: 9 },
  progress: { height: "100%", backgroundColor: colors.accent, borderRadius: 99 },
});
