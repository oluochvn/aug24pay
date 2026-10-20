import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: string;
}

interface Goal {
  _id: string;
  name: string;
  savedAmount: number;
  targetAmount: number;
}

interface Summary {
  user?: { username?: string };
  balance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
  goals: Goal[];
}

const ksh = (n?: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;
const day = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to see your dashboard");
      setLoading(false);
      return;
    }

    fetch(`${API}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.status === 401) localStorage.removeItem("token");
        if (!res.ok) throw new Error(body.message || "Could not load data");
        setData(body as Summary);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const username = data?.user?.username || "";

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
          <div className="relative">
            <div
              title={username}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-xs font-medium"
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-12 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          {error}
        </div>
      )}

      {!error && (
        <>
          <div className="flex gap-6 m-8 mt-12">
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
              <h1 className="text-sm text-gray-600">Total Balance</h1>
              <h1 className="mt-1 text-2xl font-semibold">
                {loading ? "..." : ksh(data?.balance)}
              </h1>
            </div>

            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
              <h1 className="text-sm text-gray-600">Income</h1>
              <h1 className="mt-1 text-2xl font-semibold text-black">
                {loading ? "..." : ksh(data?.income)}
              </h1>
            </div>

            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
              <h1 className="text-sm text-gray-600">Expense</h1>
              <h1 className="mt-1 text-2xl font-semibold text-[#eb1f25]">
                {loading ? "..." : ksh(data?.expenses)}
              </h1>
            </div>
          </div>

          <div className="mx-8 mb-6 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold">Recent transactions</p>
            {!loading && data?.recentTransactions.length === 0 && (
              <p className="mt-3 text-sm text-gray-600">
                No transactions yet. Add your first one to see it here.
              </p>
            )}
            <ul className="mt-2 divide-y divide-gray-100">
              {data?.recentTransactions.map((t) => (
                <li key={t._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.category}</p>
                    <p className="text-xs text-gray-600">
                      {t.note ? `${t.note} · ` : ""}
                      {day(t.date)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      t.type === "income" ? "text-indigo-700" : "text-gray-800"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {ksh(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-8 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold">Saving goals</p>
            {!loading && data?.goals.length === 0 && (
              <p className="mt-3 text-sm text-gray-600">
                No goals yet. Create one to start tracking your savings.
              </p>
            )}
            <ul className="mt-3 space-y-4">
              {data?.goals.map((g) => {
                const pct = Math.min(
                  100,
                  Math.round((g.savedAmount / g.targetAmount) * 100)
                );
                return (
                  <li key={g._id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-gray-600">
                        {ksh(g.savedAmount)} of {ksh(g.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;