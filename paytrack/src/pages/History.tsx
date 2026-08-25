import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTransactions } from "../context/TransactionsContext";
import { CATEGORIES } from "../types";
import type { Category, TransactionType } from "../types";

type FilterType = "all" | TransactionType;

export default function History() {
  const { transactions, deleteTransaction } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => typeFilter === "all" || t.type === typeFilter)
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, categoryFilter]);

  const format = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">History</h1>
      <p className="mt-1 text-sm text-neutral-500">All your transactions</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as FilterType)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">No transactions match these filters.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 text-neutral-600">{t.date}</td>
                  <td className="px-4 py-3 text-neutral-600">{t.category}</td>
                  <td className="px-4 py-3 text-neutral-500">{t.note || "—"}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {format(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-neutral-400 hover:text-red-500"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}