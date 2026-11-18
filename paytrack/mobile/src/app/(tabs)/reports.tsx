import { useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Notice, Card, Page } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { colors, formatMoney } from "../../theme";
import type { Report } from "../../types";

const ranges = [1, 3, 6, 12];

export default function ReportsScreen() {
  const [months, setMonths] = useState(3);
  const { data, loading, error, refresh } = useApiResource<Report>(`/reports?months=${months}`);
  const report = data;
  const net = (report?.income ?? 0) - (report?.expenses ?? 0);
  const rate = report?.income ? Math.round((net / report.income) * 100) : 0;
  const maxMonth = Math.max(1, ...(report?.months ?? []).flatMap((month) => [month.income, month.expenses]));
  const categoryTotal = report?.categories.reduce((sum, item) => sum + item.total, 0) ?? 0;

  return (
    <Page
      title="Reports"
      subtitle="See how your money is moving."
      onRefresh={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}
    >
      <View style={styles.ranges}>
        {ranges.map((range) => (
          <Pressable key={range} onPress={() => setMonths(range)} style={[styles.range, months === range && styles.activeRange]}>
            <Text style={[styles.rangeText, months === range && styles.activeRangeText]}>{range}M</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Notice>{error}</Notice> : null}
      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <Text style={styles.label}>Income</Text>
          <Text style={[styles.amount, styles.positive]}>{formatMoney(report?.income)}</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={[styles.amount, styles.negative]}>{formatMoney(report?.expenses)}</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={styles.label}>Net savings</Text>
          <Text style={styles.amount}>{formatMoney(net)}</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={styles.label}>Savings rate</Text>
          <Text style={styles.amount}>{rate}%</Text>
        </Card>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Monthly activity</Text>
        {loading && !report ? <Text style={styles.empty}>Loading report...</Text> : null}
        {report?.months.map((month) => (
          <View key={`${month.year}-${month.label}`} style={styles.month}>
            <View style={styles.monthHeading}>
              <Text style={styles.monthLabel}>{month.label} {month.year}</Text>
              <Text style={styles.label}>+{formatMoney(month.income)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.incomeBar, { width: `${Math.max(2, month.income / maxMonth * 100)}%` }]} />
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.expenseBar, { width: `${Math.max(2, month.expenses / maxMonth * 100)}%` }]} />
            </View>
          </View>
        ))}
        <View style={styles.legend}>
          <Text style={styles.legendIncome}>● Income</Text>
          <Text style={styles.legendExpense}>● Expenses</Text>
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Spending by category</Text>
        {!loading && report?.categories.length === 0 ? <Text style={styles.empty}>No expenses in this period yet.</Text> : null}
        {report?.categories.map((item) => {
          const percentage = categoryTotal > 0 ? item.total / categoryTotal * 100 : 0;
          return (
            <View key={item.category} style={styles.category}>
              <View style={styles.monthHeading}>
                <Text style={styles.monthLabel}>{item.category}</Text>
                <Text style={styles.label}>{formatMoney(item.total)} · {Math.round(percentage)}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.categoryBar, { width: `${percentage}%` }]} />
              </View>
            </View>
          );
        })}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  ranges: { flexDirection: "row", gap: 8, marginBottom: 2 },
  range: { flex: 1, alignItems: "center", backgroundColor: "#fff", borderColor: colors.border, borderWidth: 1, borderRadius: 22, paddingVertical: 10 },
  activeRange: { backgroundColor: colors.text, borderColor: colors.text },
  rangeText: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  activeRangeText: { color: "#fff" },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  metric: { width: "48%", flexGrow: 1, padding: 13 },
  label: { color: colors.muted, fontSize: 12 },
  amount: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 6 },
  positive: { color: colors.positive },
  negative: { color: colors.negative },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  empty: { color: colors.muted, fontSize: 13, marginTop: 12 },
  month: { marginTop: 18 },
  monthHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  monthLabel: { color: colors.text, fontSize: 13, fontWeight: "600" },
  barTrack: { height: 7, borderRadius: 10, backgroundColor: "#f0f0f0", overflow: "hidden", marginTop: 7 },
  incomeBar: { height: "100%", backgroundColor: colors.positive, borderRadius: 10 },
  expenseBar: { height: "100%", backgroundColor: colors.negative, borderRadius: 10 },
  categoryBar: { height: "100%", backgroundColor: colors.accent, borderRadius: 10 },
  legend: { flexDirection: "row", gap: 18, marginTop: 18 },
  legendIncome: { color: colors.positive, fontSize: 12, fontWeight: "600" },
  legendExpense: { color: colors.negative, fontSize: 12, fontWeight: "600" },
  category: { marginTop: 16 },
});
