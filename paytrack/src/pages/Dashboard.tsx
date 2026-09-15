import { useMemo } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useSavings } from "../context/SavingsContext";

function Stat({
  label,
  value,
  accent = "ink",
}: {
  label: string;
  value: string;
  accent?: "ink" | "positive" | "negative";
}) {
  const valueTone = {
    ink: "text-zinc-900",
    positive: "text-emerald-700",
    negative: "text-zinc-900",
  }[accent];

  return (
    <div className="px-6 py-5 sm:px-8">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-medium tracking-tight tabular-nums ${valueTone}`}>{value}</p>
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

  const monthLabel = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-lg font-medium tracking-tight text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Your financial overview</p>

      <section className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200/80">
        <div className="px-6 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9">
          <p className="text-sm text-zinc-500">Total balance</p>
          <p className="mt-3 text-5xl font-light leading-none tracking-tight tabular-nums text-zinc-900 sm:text-6xl">
            {format(stats.balance)}
          </p>
          <p className="mt-4 text-sm text-zinc-400">Across all accounts</p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-zinc-200/80 border-t border-zinc-200/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label={`Income in ${monthLabel}`} value={`+ ${format(stats.monthIncome)}`} accent="positive" />
          <Stat label={`Spent in ${monthLabel}`} value={`− ${format(stats.monthExpense)}`} accent="negative" />
          <Stat label="Saved toward goals" value={format(stats.totalSaved)} />
        </div>
      </section>

      {transactions.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          Nothing tracked yet. Add your first transaction to start building this view.
        </p>
      )}
    </div>
  );
}