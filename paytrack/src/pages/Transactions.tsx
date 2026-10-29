import { useState, useEffect, type FormEvent, type CSSProperties } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";

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
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-white text-black" : "text-gray-400 hover:bg-neutral-800"
  }`;

const inputClass =
  "rounded-xl border border-neutral-800 bg-neutral-950 text-sm text-gray-100 placeholder-gray-500 outline-none [color-scheme:dark] focus:border-indigo-400";

const inputStyle: CSSProperties = { padding: "8px 12px" };
const buttonStyle: CSSProperties = { padding: "8px 20px" };

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
    throw Object.assign(
      new Error(body.message || `Request failed (${res.status})`),
      { status: res.status }
    );
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
  const [username, setUsername] = useState("");

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
      const body = await request(TX);
      setItems(Array.isArray(body) ? body : body.transactions ?? []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    load();

    fetch(`${API}/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setUsername(body?.user?.username || ""))
      .catch(() => {});
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
      await request(`${TX}/${id}`, { method: "DELETE" });
      if (editingId === id) reset();
      setItems((list) => list.filter((t) => t._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

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
            <div
              title={username}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-white text-xs font-medium"
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-green-500" />
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mx-3 mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:mx-4 md:mx-8 md:mt-12"
      >
        <p className="text-sm font-semibold">
          {editingId ? "Edit transaction" : "Add transaction"}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            style={inputStyle}
            className={`${inputClass} w-32 shrink-0`}
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
            style={inputStyle}
            className={`${inputClass} w-32 shrink-0`}
          />

          <input
            type="text"
            required
            placeholder="Category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            style={inputStyle}
            className={`${inputClass} min-w-0 flex-1 basis-40`}
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            style={inputStyle}
            className={`${inputClass} min-w-0 flex-1 basis-48`}
          />

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            style={inputStyle}
            className={`${inputClass} w-40 shrink-0`}
          />
        </div>

        {error && <p className="mt-3 text-sm text-[#ff4d52]">{error}</p>}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            style={buttonStyle}
            className="rounded-full bg-indigo-500 text-sm text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={reset}
              style={buttonStyle}
              className="rounded-full text-sm text-gray-400 hover:bg-neutral-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mx-3 mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:mx-4 md:mx-8 md:mt-6">
        <p className="text-sm font-semibold">History</p>

        {loading && <p className="mt-3 text-sm text-gray-400">Loading...</p>}

        {!loading && items.length === 0 && (
          <p className="mt-3 text-sm text-gray-400">
            No transactions yet. Add your first one above.
          </p>
        )}

        <ul className="mt-2 divide-y divide-neutral-800">
          {items.map((t) => (
            <li
              key={t._id}
              style={{ padding: "12px 0" }}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.category}</p>
                <p className="truncate text-xs text-gray-400">
                  {t.note ? `${t.note} · ` : ""}
                  {day(t.date)}
                </p>
              </div>

              <div style={{ gap: 20 }} className="flex shrink-0 items-center">
                <span
                  style={{ minWidth: 110, textAlign: "right" }}
                  className={`text-sm font-medium ${
                    t.type === "income" ? "text-green-400" : "text-[#ff4d52]"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {ksh(t.amount)}
                </span>

                <div style={{ gap: 8 }} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    style={{ padding: "4px 12px" }}
                    className="rounded-full border border-neutral-700 text-xs text-gray-300 hover:bg-neutral-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t._id)}
                    style={{ padding: "4px 12px" }}
                    className="rounded-full border border-red-900 text-xs text-[#ff4d52] hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Transactions;