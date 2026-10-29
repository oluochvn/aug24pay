import { useState, useEffect, type FormEvent } from "react";

const API = import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

const ksh = (n?: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  let body: { message?: string };
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error("Server is starting up. Try again in a minute.");
  }

  if (res.status === 401) localStorage.removeItem("token");
  if (!res.ok) throw new Error(body.message || "Something went wrong");
  return body as unknown as T;
}

const inputClass =
  "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-800 outline-none focus:border-indigo-400";
const pillButton =
  "rounded-full border border-indigo-400 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50";

function Savings() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposits, setDeposits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setError("Please log in to see your savings");
      setLoading(false);
      return;
    }

    api<Goal[]>("/goals")
      .then(setGoals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const createGoal = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const goal = await api<Goal>("/goals", {
        method: "POST",
        body: JSON.stringify({ name, targetAmount: Number(target) }),
      });
      setGoals((prev) => [goal, ...prev]);
      setName("");
      setTarget("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addMoney = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const updated = await api<Goal>(`/goals/${id}/deposit`, {
        method: "PATCH",
        body: JSON.stringify({ amount: Number(deposits[id]) }),
      });
      setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
      setDeposits((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="mx-8 mt-12 space-y-6">
      <div className="flex gap-6">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <h1 className="text-sm text-gray-600">Total saved</h1>
          <h1 className="mt-1 text-2xl font-semibold">
            {loading ? "..." : ksh(totalSaved)}
          </h1>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <h1 className="text-sm text-gray-600">Total target</h1>
          <h1 className="mt-1 text-2xl font-semibold">
            {loading ? "..." : ksh(totalTarget)}
          </h1>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          {error}
        </div>
      )}

      <form
        onSubmit={createGoal}
        className="rounded-2xl border border-gray-200 bg-white p-4"
      >
        <p className="text-sm font-semibold">New goal</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className={`${inputClass} flex-1`}
            placeholder="Goal name, e.g. New laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={`${inputClass} w-40`}
            type="number"
            min="1"
            placeholder="Target (KSH)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
          <button type="submit" className={pillButton} disabled={busy}>
            Add goal
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold">Your goals</p>

        {!loading && goals.length === 0 && !error && (
          <p className="mt-3 text-sm text-gray-600">
            No goals yet. Create one above to start tracking your savings.
          </p>
        )}

        <ul className="mt-3 divide-y divide-gray-100">
          {goals.map((g) => {
            const pct = Math.min(
              100,
              Math.round((g.savedAmount / g.targetAmount) * 100)
            );
            return (
              <li key={g._id} className="py-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{g.name}</span>
                  <span className="text-gray-600">
                    {ksh(g.savedAmount)} of {ksh(g.targetAmount)} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    className={`${inputClass} w-40`}
                    type="number"
                    min="1"
                    placeholder="Amount (KSH)"
                    value={deposits[g._id] || ""}
                    onChange={(e) =>
                      setDeposits((prev) => ({ ...prev, [g._id]: e.target.value }))
                    }
                  />
                  <button
                    className={pillButton}
                    disabled={busy || !deposits[g._id]}
                    onClick={() => addMoney(g._id)}
                  >
                    Add money
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Savings;