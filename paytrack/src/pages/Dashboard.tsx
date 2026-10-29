import { NavLink } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";
import { useApi } from "../lib/useApi";

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
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-white text-black" : "text-gray-400 hover:bg-neutral-800"
  }`;

function Dashboard() {
  const { data, loading, error } = useApi<Summary>("/summary");

  const username = data?.user?.username || "";

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

      {error && !data && (
        <div className="mx-3 mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-gray-400 sm:mx-4 md:mx-8 md:mt-12">
          {error}
        </div>
      )}

      {(!error || data) && (
        <>
          <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-12 md:grid-cols-3 md:gap-6">
            <div className="col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:col-span-1">
              <h1 className="text-sm text-gray-400">Total Balance</h1>
              <h1 className="mt-1 break-words text-xl font-semibold sm:text-2xl">
                {loading ? "..." : ksh(data?.balance)}
              </h1>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <h1 className="text-sm text-gray-400">Income</h1>
              <h1 className="mt-1 break-words text-lg font-semibold text-white sm:text-2xl">
                {loading ? "..." : ksh(data?.income)}
              </h1>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <h1 className="text-sm text-gray-400">Expense</h1>
              <h1 className="mt-1 break-words text-lg font-semibold text-[#ff4d52] sm:text-2xl">
                {loading ? "..." : ksh(data?.expenses)}
              </h1>
            </div>
          </div>

          <div className="mx-3 mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:mx-4 md:mx-8 md:mb-6">
            <p className="text-sm font-semibold">Recent transactions</p>
            {!loading && data?.recentTransactions.length === 0 && (
              <p className="mt-3 text-sm text-gray-400">
                No transactions yet. Add your first one to see it here.
              </p>
            )}
            <ul className="mt-2 divide-y divide-neutral-800">
              {data?.recentTransactions.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.category}</p>
                    <p className="truncate text-xs text-gray-400">
                      {t.note ? `${t.note} · ` : ""}
                      {day(t.date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-medium ${
                      t.type === "income" ? "text-indigo-400" : "text-gray-200"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {ksh(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:mx-4 md:mx-8">
            <p className="text-sm font-semibold">Saving goals</p>
            {!loading && data?.goals.length === 0 && (
              <p className="mt-3 text-sm text-gray-400">
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
                    <div className="mb-1 flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <span className="truncate font-medium">{g.name}</span>
                      <span className="text-xs text-gray-400 sm:text-sm">
                        {ksh(g.savedAmount)} of {ksh(g.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-800">
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