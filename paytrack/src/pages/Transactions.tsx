import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../context/TransactionsContext";
import { CATEGORIES } from "../types";
import type { Category, TransactionType } from "../types";

export default function Transactions() {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    addTransaction({ type, amount: parsed, category, date, note: note.trim() || undefined });
    setAmount("");
    setNote("");
    setError("");
    navigate("/history");
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Add Transaction</h1>
      <p className="mt-1 text-sm text-neutral-500">Log a new income or expense</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
              type === "expense" ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-lg py-2.5 text-sm font-medium transition-colors ${
              type === "income" ? "bg-green-50 text-green-600 ring-1 ring-green-200" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            Income
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Groceries"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Save Transaction
        </button>
      </form>
    </div>
  );
}