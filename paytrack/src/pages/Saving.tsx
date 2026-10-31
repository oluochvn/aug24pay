import { useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import {
  Wallet,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { useApi, invalidate } from "../lib/useApi";

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

interface Summary {
  user?: { username?: string };
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

const menu = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Savings", to: "/savings", icon: PiggyBank },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

const sideLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? "bg-white font-medium text-[#111827] shadow-sm"
      : "text-gray-500 hover:bg-white/60"
  }`;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-[#111827] text-white" : "bg-white text-gray-600"
  }`;

const card = "rounded-2xl border border-neutral-200 bg-white p-4";

const formatMoney = (amount: number) =>
  `KSH ${Number(amount || 0).toLocaleString("en-KE")}`;

async function apiRequest<T>(
  endpoint: string,
  method = "GET",
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Something went wrong. Please try again."
    );
  }

  return result as T;
}

export default function Savings() {
  const { data, loading, error, update } = useApi<Goal[]>("/goals");
  const { data: summary } = useApi<Summary>("/summary");

  const username = summary?.user?.username || "";

  const goals = data ?? [];

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const totalSaved = goals.reduce(
    (total, goal) => total + Number(goal.savedAmount || 0),
    0
  );

  const totalTarget = goals.reduce(
    (total, goal) => total + Number(goal.targetAmount || 0),
    0
  );

  const remaining = Math.max(totalTarget - totalSaved, 0);

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setEditingId(null);
    setFormError("");
  };

  const refreshSummary = async () => {
    await invalidate("/summary");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError("");
    setMessage("");

    const amount = Number(targetAmount);

    if (!name.trim()) {
      setFormError("Enter a savings goal name.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 1) {
      setFormError("Enter a valid target amount.");
      return;
    }

    setBusy(true);

    try {
      if (editingId) {
        const updatedGoal = await apiRequest<Goal>(
          `/goals/${editingId}`,
          "PUT",
          {
            name: name.trim(),
            targetAmount: amount,
          }
        );

        update(
          goals.map((goal) =>
            goal._id === editingId ? { ...goal, ...updatedGoal } : goal
          )
        );

        setMessage("Goal updated.");
      } else {
        const newGoal = await apiRequest<Goal>("/goals", "POST", {
          name: name.trim(),
          targetAmount: amount,
        });

        update([...goals, newGoal]);

        setMessage("Savings goal created.");
      }

      resetForm();
      await refreshSummary();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save goal."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal._id);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setFormError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeposit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!depositId) return;

    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter a valid deposit amount.");
      return;
    }

    const selectedGoal = goals.find((goal) => goal._id === depositId);

    if (!selectedGoal) return;

    setBusy(true);
    setFormError("");
    setMessage("");

    try {
      const updatedGoal = await apiRequest<Goal>(
        `/goals/${depositId}/deposit`,
        "PATCH",
        { amount }
      );

      update(
        goals.map((goal) =>
          goal._id === depositId ? { ...goal, ...updatedGoal } : goal
        )
      );

      setDepositId(null);
      setDepositAmount("");
      setMessage("Deposit added.");

      await refreshSummary();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to add deposit."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmed) return;

    setBusy(true);
    setFormError("");
    setMessage("");

    try {
      await apiRequest(`/goals/${id}`, "DELETE");

      update(goals.filter((goal) => goal._id !== id));

      if (editingId === id) resetForm();

      if (depositId === id) {
        setDepositId(null);
        setDepositAmount("");
      }

      setMessage("Savings goal deleted.");
      await refreshSummary();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to delete goal."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard min-h-screen bg-[#F2F2F2] text-[#111827] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 p-4 pt-10 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <NavLink to="/dashboard" className="flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/70 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </NavLink>

        <nav className="mt-8 space-y-1">
          {menu.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideLink}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <NavLink to="/settings" className={sideLink}>
            <Settings size={18} />
            Settings
          </NavLink>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div
              title={username}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-medium text-white"
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {username || "Your account"}
              </p>
              <p className="text-xs text-gray-500">Personal account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 p-2 pb-6 sm:p-4">
        {/* Mobile header */}
        <div className="mx-3 mt-3 flex items-center gap-2 sm:mx-4 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </div>

        <div className="mx-3 mt-4 flex items-center gap-2 overflow-x-auto pb-1 sm:mx-4 lg:hidden">
          {[...menu, { label: "Settings", to: "/settings" }].map(
            ({ label, to }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            )
          )}
        </div>

        <div className="mx-3 mt-6 sm:mx-4 md:mx-8">
          <h1 className="text-2xl font-semibold">Savings</h1>
          <p className="text-sm text-gray-500">
            Keep track of what you're putting aside
          </p>
        </div>

        {/* Summary */}
        <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-6 md:grid-cols-3 md:gap-6">
          <div className={`col-span-2 md:col-span-1 ${card}`}>
            <p className="text-sm text-gray-500">Total saved</p>
            <p className="mt-1 break-words text-xl font-semibold sm:text-2xl">
              {loading ? "..." : formatMoney(totalSaved)}
            </p>
          </div>

          <div className={card}>
            <p className="text-sm text-gray-500">Target amount</p>
            <p className="mt-1 break-words text-lg font-semibold sm:text-2xl">
              {loading ? "..." : formatMoney(totalTarget)}
            </p>
          </div>

          <div className={card}>
            <p className="text-sm text-gray-500">Still to save</p>
            <p className="mt-1 break-words text-lg font-semibold sm:text-2xl">
              {loading ? "..." : formatMoney(remaining)}
            </p>
          </div>
        </div>

        <div className="mx-3 space-y-4 sm:mx-4 md:mx-8 md:space-y-6">
          {/* Overall progress */}
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Overall progress</p>
                <p className="text-xs text-gray-500">
                  Your progress across all savings goals
                </p>
              </div>

              <span className="text-sm font-semibold tabular-nums">
                {overallProgress.toFixed(0)}%
              </span>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-neutral-200">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{formatMoney(totalSaved)} saved</span>
              <span>{formatMoney(totalTarget)} target</span>
            </div>
          </section>

          {/* Create / edit goal */}
          <section className={card}>
            <p className="text-sm font-semibold">
              {editingId ? "Edit savings goal" : "Create a savings goal"}
            </p>
            <p className="text-xs text-gray-500">
              {editingId
                ? "Update the details of your goal."
                : "Give your savings a clear target."}
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="goalName"
                    className="mb-1.5 block text-xs font-medium text-gray-600"
                  >
                    Goal name
                  </label>

                  <input
                    id="goalName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. New laptop"
                    className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-neutral-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="targetAmount"
                    className="mb-1.5 block text-xs font-medium text-gray-600"
                  >
                    Target amount (KSH)
                  </label>

                  <input
                    id="targetAmount"
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-neutral-400 focus:bg-white"
                  />
                </div>
              </div>

              {formError && depositId === null && (
                <p className="mt-3 text-xs text-red-500">{formError}</p>
              )}

              {message && (
                <p className="mt-3 text-xs text-green-600">{message}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Please wait..."
                    : editingId
                      ? "Save changes"
                      : "Create goal"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm text-gray-600 transition hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Savings goals */}
          <section className={card}>
            <p className="text-sm font-semibold">Your savings goals</p>
            <p className="text-xs text-gray-500">
              {goals.length} {goals.length === 1 ? "goal" : "goals"}
            </p>

            {loading ? (
              <p className="mt-3 text-sm text-gray-500">
                Loading your savings...
              </p>
            ) : error ? (
              <p className="mt-3 text-sm text-gray-500">
                Unable to load your savings goals. Please refresh and try
                again.
              </p>
            ) : goals.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                No goals yet. Create your first one above to start tracking
                your savings.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-neutral-100">
                {goals.map((goal) => {
                  const saved = Number(goal.savedAmount || 0);
                  const target = Number(goal.targetAmount || 0);
                  const progress =
                    target > 0 ? Math.min((saved / target) * 100, 100) : 0;

                  const goalRemaining = Math.max(target - saved, 0);
                  const completed = progress >= 100;

                  return (
                    <li key={goal._id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {goal.name}
                            </span>

                            {completed && (
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                                Completed
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            {formatMoney(saved)} of {formatMoney(target)}
                          </p>

                          <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
                            <div
                              className="h-2 rounded-full bg-indigo-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                            <span>{progress.toFixed(0)}% complete</span>
                            <span>
                              {completed
                                ? "Target reached"
                                : `${formatMoney(goalRemaining)} to go`}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setDepositId(goal._id);
                              setDepositAmount("");
                              setFormError("");
                              setMessage("");
                            }}
                            className="rounded-lg bg-[#111827] px-3 py-2 text-xs font-medium text-white transition hover:bg-black"
                          >
                            Add money
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(goal)}
                            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs text-gray-600 transition hover:bg-neutral-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(goal._id)}
                            disabled={busy}
                            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {depositId === goal._id && (
                        <form
                          onSubmit={handleDeposit}
                          className="mt-4 border-t border-neutral-100 pt-4"
                        >
                          <label
                            htmlFor={`deposit-${goal._id}`}
                            className="mb-1.5 block text-xs font-medium text-gray-600"
                          >
                            Deposit amount (KSH)
                          </label>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              id={`deposit-${goal._id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={depositAmount}
                              onChange={(e) =>
                                setDepositAmount(e.target.value)
                              }
                              placeholder="Enter amount"
                              className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:bg-white sm:max-w-xs"
                            />

                            <button
                              type="submit"
                              disabled={busy}
                              className="rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
                            >
                              {busy ? "Adding..." : "Confirm deposit"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDepositId(null);
                                setDepositAmount("");
                                setFormError("");
                              }}
                              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-neutral-50"
                            >
                              Cancel
                            </button>
                          </div>

                          {formError && (
                            <p className="mt-2 text-xs text-red-500">
                              {formError}
                            </p>
                          )}
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}