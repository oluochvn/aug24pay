import { useState } from "react";
import { PiggyBank, Plus, Minus, Trash2, Target } from "lucide-react";
import { useSavings } from "../context/SavingsContext";

export default function Savings() {
  const { goals, addGoal, contribute, deleteGoal } = useSavings();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");
  const [contributions, setContributions] = useState<Record<string, string>>({});

  const format = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(targetAmount);
    if (!name.trim()) {
      setError("Enter a goal name");
      return;
    }
    if (!parsed || parsed <= 0) {
      setError("Enter a valid target amount greater than 0");
      return;
    }

    addGoal({ name: name.trim(), targetAmount: parsed, targetDate: targetDate || undefined });
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setError("");
    setShowForm(false);
  };

  const handleContribute = (id: string, sign: 1 | -1) => {
    const raw = contributions[id];
    const parsed = parseFloat(raw);
    if (!parsed || parsed <= 0) return;
    contribute(id, parsed * sign);
    setContributions((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Savings Goals</h1>
          <p className="mt-1 text-sm text-neutral-500">Track progress toward what matters</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-orange-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddGoal}
          className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Goal name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Target amount</label>
              <input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Target date (optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Create Goal
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            No savings goals yet. Create one to start tracking progress.
          </div>
        ) : (
          goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
            const reached = g.savedAmount >= g.targetAmount;

            return (
              <div key={g.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <PiggyBank className="h-4.5 w-4.5" />
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-neutral-400 hover:text-red-500"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-neutral-900">{g.name}</h3>
                {g.targetDate && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                    <Target className="h-3 w-3" />
                    By {g.targetDate}
                  </p>
                )}

                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-neutral-900">{format(g.savedAmount)}</span>
                    <span className="text-neutral-400">of {format(g.targetAmount)}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        reached ? "bg-green-500" : "bg-orange-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{pct.toFixed(0)}% complete</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={contributions[g.id] || ""}
                    onChange={(e) =>
                      setContributions((prev) => ({ ...prev, [g.id]: e.target.value }))
                    }
                    placeholder="Amount"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                  <button
                    onClick={() => handleContribute(g.id, 1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                    aria-label="Add funds"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleContribute(g.id, -1)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    aria-label="Withdraw funds"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}