import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Wallet,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useApi, invalidate } from "../lib/useApi";

const API = import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";
const TX = "/transactions";

type TxType = "income" | "expense";

interface Transaction {
  _id: string;
  type: TxType;
  amount: number;
  category: string;
  note?: string;
  date: string;
}

interface FormState {
  type: TxType;
  amount: string;
  category: string;
  note: string;
  date: string;
}

const categories: Record<TxType, string[]> = {
  expense: [
    "Food & Drink",
    "Transport",
    "Housing",
    "Shopping",
    "Health",
    "Education",
    "Entertainment",
    "Communication",
    "Personal & Family",
    "Financial Expenses",
    "Other",
  ],
  income: [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Gifts",
    "Interest",
    "Rental Income",
    "Refunds",
    "Other Income",
  ],
};

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const emptyForm = (): FormState => ({
  type: "expense",
  amount: "",
  category: "",
  note: "",
  date: today(),
});

const ksh = (n: number) =>
  `KSH ${Number(n || 0).toLocaleString("en-KE")}`;

const day = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
    isActive
      ? "bg-[#111827] text-white"
      : "bg-white text-gray-600"
  }`;

const card =
  "rounded-2xl border border-neutral-200 bg-white p-4";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-400";

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}${path}`, {
    ...options,
    // Never let the browser answer from its own HTTP cache.
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(
      new Error(body.message || `Request failed (${res.status})`),
      { status: res.status }
    );
  }

  return body;
}

// Pages that cache data derived from transactions. invalidate() matches by
// prefix, so "/reports" also clears every ?months= range.
const refreshCaches = () => {
  invalidate("/summary");
  invalidate("/reports");
};

function Transactions() {
  const navigate = useNavigate();

  // Shared cache with the other pages, so the sidebar name needs no extra request.
  const { data: summary } = useApi<{ user?: { username?: string } }>(
    "/summary"
  );
  const username = summary?.user?.username || "";

  const {
    data: listData,
    loading,
    error: loadError,
    refresh,
    update: setItems,
  } = useApi<Transaction[] | { transactions: Transaction[] }>(TX);

  const items: Transaction[] = Array.isArray(listData)
    ? listData
    : listData?.transactions ?? [];

  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleError = (err: unknown) => {
    const e = err as Error & { status?: number };

    if (e.status === 401) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    setError(e.message);
  };

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const changeType = (type: TxType) => {
    setForm((f) => ({
      ...f,
      type,
      category: "",
    }));
  };

  const reset = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category) {
      setError("Please select a transaction category.");
      return;
    }

    setSaving(true);

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      note: form.note.trim(),
      date: form.date,
    };

    try {
      if (editingId) {
        await request(`${TX}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await request(TX, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      reset();
      refreshCaches();
      await refresh();
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t._id);

    setForm({
      type: t.type,
      amount: String(t.amount),
      category: t.category,
      note: t.note || "",
      date: t.date.slice(0, 10),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;

    setError("");

    try {
      await request(`${TX}/${id}`, { method: "DELETE" });

      if (editingId === id) reset();

      setItems(items.filter((t) => t._id !== id));
      refreshCaches();
    } catch (err) {
      handleError(err);
    }
  };

  const income = items
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = items
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="dashboard min-h-screen bg-[#F2F2F2] text-[#111827] lg:flex">

      {/* Sidebar */}
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

        {/* Mobile brand */}
        <div className="mx-3 mt-3 flex items-center gap-2 sm:mx-4 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </div>

        {/* Mobile navigation */}
        <div className="mx-3 mt-4 flex items-center gap-2 overflow-x-auto pb-1 sm:mx-4 lg:hidden">
          {menu.map(({ label, to }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Heading */}
        <div className="mx-3 mt-6 sm:mx-4 md:mx-8">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-gray-500">
            Manage and track your income and expenses
          </p>
        </div>

        {/* Summary */}
        <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-6 md:grid-cols-3 md:gap-6">

          <div className={`col-span-2 md:col-span-1 ${card}`}>
            <p className="text-sm text-gray-500">Total transactions</p>
            <p className="mt-1 text-2xl font-semibold">
              {loading ? "..." : items.length}
            </p>
          </div>

          <div className={card}>
            <p className="text-sm text-gray-500">Total income</p>
            <p className="mt-1 break-words text-lg font-semibold text-black sm:text-2xl">
              {loading ? "..." : ksh(income)}
            </p>
          </div>

          <div className={card}>
            <p className="text-sm text-gray-500">Total expenses</p>
            <p className="mt-1 break-words text-lg font-semibold text-black/70 sm:text-2xl">
              {loading ? "..." : ksh(expenses)}
            </p>
          </div>
        </div>

        {/* Add transaction */}
        <form
          onSubmit={submit}
          className={`mx-3 mt-5 sm:mx-4 md:mx-8 md:mt-6 ${card}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {editingId ? "Edit transaction" : "Add transaction"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Record a new income or expense
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-gray-500 hover:bg-neutral-200"
                aria-label="Cancel editing"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Transaction type
              </label>

              <select
                value={form.type}
                onChange={(e) => changeType(e.target.value as TxType)}
                className={inputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Amount (KSH)
              </label>

              <input
                type="number"
                min="0.01"
                step="any"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Category
              </label>

              <select
                required
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>

                {categories[form.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Note (optional)
              </label>

              <input
                type="text"
                placeholder="Add a description"
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Date
              </label>

              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-[#ff4d52]">{error}</p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
            >
              <Plus size={15} />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update transaction"
                  : "Add transaction"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full px-4 py-2.5 text-sm text-gray-500 hover:bg-neutral-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* History */}
        <div className={`mx-3 mt-5 sm:mx-4 md:mx-8 md:mt-6 ${card}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Transaction history</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Your recorded financial activity
              </p>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-gray-500">
              {items.length} records
            </span>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Loading transactions...
            </p>
          )}

          {!loading && loadError && items.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">{loadError}</p>
          )}

          {!loading && !loadError && items.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-gray-400">
                <ArrowLeftRight size={20} />
              </div>
              <p className="mt-3 text-sm font-medium">
                No transactions yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add your first transaction to see it here.
              </p>
            </div>
          )}

          <ul className="mt-3 divide-y divide-neutral-100">
            {items.map((t) => (
              <li
                key={t._id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      t.type === "income"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    <ArrowLeftRight size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {t.category}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {t.note ? `${t.note} · ` : ""}
                      {day(t.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income"
                        ? "text-black"
                        : "text-[#ff4d52]"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {ksh(t.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      aria-label="Edit transaction"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(t._id)}
                      aria-label="Delete transaction"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Transactions;