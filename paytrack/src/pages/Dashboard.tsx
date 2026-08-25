import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useTransactions } from "../context/TransactionsContext";
import { useSavings } from "../context/SavingsContext";

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "neutral" | "green" | "red" | "orange";
}) {
  const toneClasses = {
    neutral: "bg-neutral-100 text-neutral-700",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { goals } = useSavings();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const isThisMonth = d.getMonth() === thisMonth && d.getFullYear() === thisYear;

      if (t.type === "income") {
        totalIncome += t.amount;
        if (isThisMonth) monthIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (isThisMonth) monthExpense += t.amount;
      }
    });

    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    return {
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      totalSaved,
    };
  }, [transactions, goals, thisMonth, thisYear]);

  const format = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Your financial overview</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Balance" value={format(stats.balance)} icon={Wallet} tone="neutral" />
        <StatCard label="Income This Month" value={format(stats.monthIncome)} icon={TrendingUp} tone="green" />
        <StatCard label="Expenses This Month" value={format(stats.monthExpense)} icon={TrendingDown} tone="red" />
        <StatCard label="Total Saved" value={format(stats.totalSaved)} icon={PiggyBank} tone="orange" />
      </div>

      {transactions.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          No transactions yet. Add your first one from the "Add Transaction" tab.
        </div>
      )}
    </div>
  );
}