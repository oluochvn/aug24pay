import { useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";
import { useApi, invalidate } from "../lib/useApi";

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
    throw new Error(
      res.status === 404
        ? "API route not found. Redeploy the backend."
        : "Server is starting up. Try again in a minute."
    );
  }

  if (res.status === 401) localStorage.removeItem("token");
  if (!res.ok) throw new Error(body.message || "Something went wrong");
  return body as unknown as T;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-white text-black" : "text-gray-400 hover:bg-neutral-800"
  }`;

const inputClass =
  "rounded-full border border-neutral-800 bg-neutral-950 px-4 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-indigo-400";
const pillButton =
  "rounded-full bg-indigo-500 px-4 py-1.5 text-sm text-white transition-colors hover:bg-indigo-400 disabled:opacity-50";

const outlineButton =
  "rounded-full border border-neutral-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-neutral-800 disabled:opacity-50";
const dangerButton =
  "rounded-full border border-red-900 px-3 py-1 text-xs text-[#ff4d52] transition-colors hover:bg-red-950 disabled:opacity-50";

function Savings() {
  const { data, loading, error: loadError, update } = useApi<Goal[]>("/goals");
  const goals = data ?? [];

  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposits, setDeposits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");

  const shownError = error || (loadError && !data ? loadError : "");

  const createGoal = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const goal = await api<Goal>("/goals", {
        method: "POST",
        body: JSON.stringify({ name, targetAmount: Number(target) }),
      });
      update([goal, ...goals]);
      invalidate("/summary");
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
      update(goals.map((g) => (g._id === id ? updated : g)));
      invalidate("/summary");
      setDeposits((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (g: Goal) => {
    setEditingId(g._id);
    setEditName(g.name);
    setEditTarget(String(g.targetAmount));
    setError("");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const updated = await api<Goal>(`/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName, targetAmount: Number(editTarget) }),
      });
      update(goals.map((g) => (g._id === id ? updated : g)));
      invalidate("/summary");
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeGoal = async (id: string) => {
    if (!window.confirm("Delete this goal?")) return;
    setBusy(true);
    setError("");
    try {
      await api<{ message: string }>(`/goals/${id}`, { method: "DELETE" });
      update(goals.filter((g) => g._id !== id));
      invalidate("/summary");
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="dashboard min-h-screen bg-neutral-950 p-2 pb-6 text-gray-100 sm:p-4">
      <div className="m-3 flex flex-wrap items-center justify-between gap-3 sm:m-4 md:m-8 md:flex-nowrap">
        <NavLink to="/dashboard" className="order-1 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </NavLink>

        <div className="order-3 -mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 pb-1 md:order-2 md:mx-0 md:w-auto md:overflow-visible md:px-0 md:pb-0">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={linkClass}>
            Transactions
          </NavLink>
          <NavLink to="/savings" className={linkClass}>
            Savings
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            Reports
          </NavLink>
        </div>

        <div className="order-2 flex items-center gap-3 md:order-3">
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <NavLink
            to="/settings"
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Settings"
          >
            <Settings size={18} />
          </NavLink>
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-white text-xs font-medium">
              U
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-green-500" />
          </div>
        </div>
      </div>

      <div className="mx-3 mt-6 space-y-4 sm:mx-4 md:mx-8 md:mt-12 md:space-y-6">
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <h1 className="text-sm text-gray-400">Total saved</h1>
            <h1 className="mt-1 break-words text-lg font-semibold sm:text-2xl">
              {loading ? "..." : ksh(totalSaved)}
            </h1>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <h1 className="text-sm text-gray-400">Total target</h1>
            <h1 className="mt-1 break-words text-lg font-semibold sm:text-2xl">
              {loading ? "..." : ksh(totalTarget)}
            </h1>
          </div>
        </div>

        {shownError && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-gray-400">
            {shownError}
          </div>
        )}

        <form
          onSubmit={createGoal}
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
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

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm font-semibold">Your goals</p>

          {!loading && goals.length === 0 && !shownError && (
            <p className="mt-3 text-sm text-gray-400">
              No goals yet. Create one above to start tracking your savings.
            </p>
          )}

          <ul className="mt-3 divide-y divide-neutral-800">
            {goals.map((g) => {
              const pct = Math.min(
                100,
                Math.round((g.savedAmount / g.targetAmount) * 100)
              );
              return (
                <li key={g._id} className="py-4">
                  {editingId === g._id ? (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <input
                        className={`${inputClass} min-w-0 flex-1`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Goal name"
                      />
                      <input
                        className={`${inputClass} w-40`}
                        type="number"
                        min="1"
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        placeholder="Target (KSH)"
                      />
                      <button
                        className={pillButton}
                        disabled={busy || !editName.trim() || !Number(editTarget)}
                        onClick={() => saveEdit(g._id)}
                      >
                        Save
                      </button>
                      <button className={outlineButton} onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{g.name}</span>
                      <span className="shrink-0 text-gray-400">
                        {ksh(g.savedAmount)} of {ksh(g.targetAmount)} · {pct}%
                      </span>
                    </div>
                  )}
                  <div className="h-2 w-full rounded-full bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        className={outlineButton}
                        disabled={busy}
                        onClick={() => startEdit(g)}
                      >
                        Edit
                      </button>
                      <button
                        className={dangerButton}
                        disabled={busy}
                        onClick={() => removeGoal(g._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Savings;