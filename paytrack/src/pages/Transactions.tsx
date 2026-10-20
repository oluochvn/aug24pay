import { useState, useEffect, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

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

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): FormState => ({
  type: "expense",
  amount: "",
  category: "",
  note: "",
  date: today(),
});

const ksh = (n: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;
const day = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black";

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(body.message || "Request failed"), {
      status: res.status,
    });
  }
  return body;
}

function Transactions() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Transaction[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const load = async () => {
    try {
      const body = await request("/transactions");
      setItems(Array.isArray(body) ? body : body.transactions ?? []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    load();
  }, []);

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const reset = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category.trim(),
      note: form.note.trim(),
      date: form.date,
    };

    try {
      if (editingId) {
        await request(`/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await request("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      reset();
      await load();
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
      await request(`/transactions/${id}`, { method: "DELETE" });
      if (editingId === id) reset();
      setItems((list) => list.filter((t) => t._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="dashboard m-2 p-4">
      <div className="flex items-center justify-between m-8">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </NavLink>

        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-gray-600 hover:text-black"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <NavLink
            to="/settings"
            className="text-gray-600 hover:text-black"
            aria-label="Settings"
          >
            <Settings size={18} />
          </NavLink>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mx-8 mt-12 rounded-2xl border border-gray-200 bg-white p-4"
      >
        <p className="text-sm font-semibold">
          {editingId ? "Edit transaction" : "Add transaction"}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className={inputClass}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            type="number"
            min="1"
            step="any"
            required
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            required
            placeholder="Category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            className={inputClass}
          />

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full px-5 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-[#eb1f25]">{error}</p>}
      </form>

      <div className="mx-8 mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold">History</p>

        {loading && <p className="mt-3 text-sm text-gray-600">Loading...</p>}

        {!loading && items.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">
            No transactions yet. Add your first one above.
          </p>
        )}

        <ul className="mt-2 divide-y divide-gray-100">
          {items.map((t) => (
            <li key={t._id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{t.category}</p>
                <p className="text-xs text-gray-600">
                  {t.note ? `${t.note} · ` : ""}
                  {day(t.date)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-medium ${
                    t.type === "income" ? "text-indigo-700" : "text-gray-800"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {ksh(t.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="text-xs text-gray-600 hover:text-black"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(t._id)}
                  className="text-xs text-[#eb1f25] hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Transactions;