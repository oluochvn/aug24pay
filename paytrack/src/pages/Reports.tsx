import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useTransactions } from "../context/TransactionsContext";
import { CATEGORIES } from "../types";

const COLORS = ["#fb923c", "#60a5fa", "#34d399", "#f472b6", "#a78bfa", "#94a3b8"];

export default function Reports() {
  const { transactions } = useTransactions();

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number }>();

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });

      if (!map.has(key)) map.set(key, { month: label, income: 0, expense: 0 });
      const entry = map.get(key)!;
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [transactions]);

  const byCategory = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      name: cat,
      value: transactions
        .filter((t) => t.type === "expense" && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    })).filter((c) => c.value > 0);
  }, [transactions]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
      <p className="mt-1 text-sm text-neutral-500">Monthly trends and category breakdown</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-medium text-neutral-700">Income vs Expenses</h2>
          {monthly.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#34d399" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f87171" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-medium text-neutral-700">Spending by Category</h2>
          {byCategory.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">No expenses yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}