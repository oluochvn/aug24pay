import { NavLink } from "react-router-dom";
import {
  Wallet,
  LogOut,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { logout, useApi } from "../lib/useApi";
import { useCurrency } from "../lib/useCurrency";

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

const day = (d: string) =>
  new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short" });

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

function Dashboard() {
  const { data, loading, error } = useApi<Summary>("/summary");
  const {
    currency,
    setCurrency,
    kesPerUsd,
    rateUpdatedAt,
    rateLoading,
    rateError,
    formatMoney,
  } = useCurrency();
  const username = data?.user?.username || "";

  return (
    <div className="dashboard min-h-screen bg-white text-[#111827] lg:flex">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 p-4 pt-10 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <NavLink to="/dashboard" className="flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </NavLink>

        <nav className="mt-8 space-y-1 border-b-2 border-white/10">
          {menu.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideLink}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <button
            type="button"
            onClick={logout}
            className={sideLink({ isActive: false })}
          >
            <LogOut size={18} />
            Log out
          </button>

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

      <div className="min-w-0 flex-1 p-2 pb-6 sm:p-4">
        <div className="mx-3 mt-3 flex items-center gap-2 sm:mx-4 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-semibold">paytrack</span>
        </div>

        <div className="mx-3 mt-4 flex items-center gap-2 overflow-x-auto pb-1 sm:mx-4 lg:hidden">
          {menu.map(({ label, to }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className={linkClass({ isActive: false })}
          >
            Log out
          </button>
        </div>

        {error && !data && (
          <div className={`mx-3 mt-6 text-sm text-gray-500 sm:mx-4 md:mx-8 md:mt-8 ${card}`}>
            {error}
          </div>
        )}

        {(!error || data) && (
          <>
            <div className="mx-3 mt-6 flex flex-wrap items-end justify-between gap-4 sm:mx-4 md:mx-8">
              <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Take Control of Your Money
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="summary-currency"
                  aria-label="Currency"
                  title={
                    rateError
                      ? `Exchange rate unavailable: ${rateError}`
                      : rateLoading
                        ? "Loading exchange rate"
                        : `1 USD = ${kesPerUsd?.toLocaleString("en-KE")} KSH${
                            rateUpdatedAt ? ` · Updated ${rateUpdatedAt}` : ""
                          }`
                  }
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value === "USD" ? "USD" : "KSH")
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="KSH">KSH</option>
                  <option value="USD" disabled={kesPerUsd === null}>
                    USD
                  </option>
                </select>
              </div>
            </div>

            <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-6 md:grid-cols-3 md:gap-6">
              <div className={`col-span-2 md:col-span-1 ${card}`}>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="mt-1 break-words text-xl font-semibold sm:text-2xl">
                  {loading ? "..." : formatMoney(data?.balance)}
                </p>
              </div>

              <div className={card}>
                <p className="text-sm text-gray-500">Income</p>
                <p className="mt-1 break-words text-lg font-semibold text-black sm:text-2xl">
                  {loading ? "..." : formatMoney(data?.income)}
                </p>
              </div>

              <div className={card}>
                <p className="text-sm text-gray-500">Expense</p>
                <p className="mt-1 break-words text-lg font-semibold text-black/80 sm:text-2xl">
                  {loading ? "..." : formatMoney(data?.expenses)}
                </p>
              </div>
            </div>

            <div className="mx-3 space-y-4 sm:mx-4 md:mx-8 md:space-y-6">
              <section className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Recent transactions</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Your latest account activity
                    </p>
                  </div>
                  <NavLink
                    to="/transactions"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View all
                  </NavLink>
                </div>

                {!loading && data?.recentTransactions.length === 0 ? (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <p className="text-sm text-gray-500">
                      No transactions yet.
                    </p>
                    <NavLink
                      to="/transactions"
                      className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Add your first transaction
                    </NavLink>
                  </div>
                ) : (
                  <ul className="mt-3 divide-y divide-neutral-100">
                    {data?.recentTransactions.map((t) => (
                      <li
                        key={t._id}
                        className="flex items-center justify-between gap-4 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t.category}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {t.note ? `${t.note} · ` : ""}
                            {day(t.date)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold ${
                              t.type === "income"
                                ? "text-green-600"
                                : "text-[#ff4d52]"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {formatMoney(t.amount)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {t.type === "income" ? "Income" : "Expense"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Savings goals</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Progress toward your savings goals
                    </p>
                  </div>
                  <NavLink
                    to="/savings"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View goals
                  </NavLink>
                </div>

                {!loading && data?.goals.length === 0 ? (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <p className="text-sm text-gray-500">
                      No savings goals yet.
                    </p>
                    <NavLink
                      to="/savings"
                      className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Create a goal
                    </NavLink>
                  </div>
                ) : (
                  <ul className="mt-3 divide-y divide-neutral-100">
                    {data?.goals.map((g) => {
                      const pct =
                        g.targetAmount > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (g.savedAmount / g.targetAmount) * 100
                              )
                            )
                          : 0;
                      return (
                        <li key={g._id} className="py-4 first:pt-2 last:pb-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <span className="truncate text-sm font-medium">
                              {g.name}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {pct}% complete
                            </span>
                          </div>
                          <div className="mt-2 h-1 w-full bg-neutral-200">
                            <div
                              className="h-1 bg-indigo-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {formatMoney(g.savedAmount)} saved of{" "}
                            {formatMoney(g.targetAmount)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;