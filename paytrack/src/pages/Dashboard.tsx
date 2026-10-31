import { NavLink } from "react-router-dom";
import {
  Wallet,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart,
  Percent,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

interface Report {
  months: { label: string; year: number; income: number; expenses: number }[];
  categories: { category: string; total: number }[];
}

interface Insight {
  icon: LucideIcon;
  tone: "good" | "bad" | "neutral";
  title: string;
  text: string;
}

const toneClass = {
  good: "bg-green-50 text-green-600",
  bad: "bg-red-50 text-red-500",
  neutral: "bg-indigo-50 text-indigo-600",
};

const ksh = (n?: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;
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
  const { data: report, loading: reportLoading } = useApi<Report>("/reports?months=6");

  const username = data?.user?.username || "";

  const goals = data?.goals ?? [];
  const income = data?.income || 0;
  const expenses = data?.expenses || 0;
  const rate = income > 0 ? Math.round(((income - expenses) / income) * 100) : null;

  const months = report?.months ?? [];
  const cur = months[months.length - 1];
  const prev = months[months.length - 2];
  const cats = report?.categories ?? [];
  const catTotal = cats.reduce((sum, c) => sum + c.total, 0);

  const insights: Insight[] = [];

  if (cur && prev && prev.expenses > 0) {
    const pct = Math.round(((cur.expenses - prev.expenses) / prev.expenses) * 100);
    insights.push({
      icon: pct > 0 ? TrendingUp : TrendingDown,
      tone: pct > 0 ? "bad" : "good",
      title:
        pct === 0
          ? "Spending is steady"
          : `Spending is ${pct > 0 ? "up" : "down"} ${Math.abs(pct)}%`,
      text: `${ksh(cur.expenses)} vs ${ksh(prev.expenses)} last month.`,
    });
  }

  if (cats.length > 0 && catTotal > 0) {
    insights.push({
      icon: PieChart,
      tone: "neutral",
      title: `${cats[0].category} is your top expense`,
      text: `${Math.round((cats[0].total / catTotal) * 100)}% of spending, ${ksh(cats[0].total)}.`,
    });
  }

  if (rate !== null) {
    insights.push({
      icon: Percent,
      tone: rate >= 20 ? "good" : rate >= 0 ? "neutral" : "bad",
      title:
        rate >= 0 ? `You keep ${rate}% of your income` : "Spending is above your income",
      text:
        rate >= 20
          ? "A healthy savings rate."
          : rate >= 0
            ? "Aim for 20% or more."
            : "Review your biggest expenses.",
    });
  }

  const nextGoal = goals
    .map((g) => ({ g, pct: Math.round((g.savedAmount / g.targetAmount) * 100) }))
    .filter((x) => x.pct < 100)
    .sort((a, b) => b.pct - a.pct)[0];
  if (nextGoal) {
    insights.push({
      icon: Target,
      tone: "good",
      title: `${nextGoal.g.name} is ${nextGoal.pct}% funded`,
      text: `${ksh(nextGoal.g.targetAmount - nextGoal.g.savedAmount)} to go.`,
    });
  }

  return (
    <div className="dashboard min-h-screen bg-[#F2F2F2] text-[#111827] lg:flex">
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
        </div>

        {error && !data && (
          <div className={`mx-3 mt-6 text-sm text-gray-500 sm:mx-4 md:mx-8 md:mt-8 ${card}`}>
            {error}
          </div>
        )}

        {(!error || data) && (
          <>
            <div className="mx-3 mt-6 sm:mx-4 md:mx-8">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-gray-500">Take Control of Your Money</p>
            </div>

            <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-6 md:grid-cols-3 md:gap-6">
              <div className={`col-span-2 md:col-span-1 ${card}`}>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="mt-1 break-words text-xl font-semibold sm:text-2xl">
                  {loading ? "..." : ksh(data?.balance)}
                </p>
              </div>

              <div className={card}>
                <p className="text-sm text-gray-500">Income</p>
                <p className="mt-1 break-words text-lg font-semibold text-black sm:text-2xl">
                  {loading ? "..." : ksh(data?.income)}
                </p>
              </div>

              <div className={card}>
                <p className="text-sm text-gray-500">Expense</p>
                <p className="mt-1 break-words text-lg font-semibold text-black/80 sm:text-2xl">
                  {loading ? "..." : ksh(data?.expenses)}
                </p>
              </div>
            </div>

            <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-300/70 via-fuchsia-200/60 to-emerald-300/70 p-px sm:mx-4 md:mx-8 md:mb-6">
              <div className="relative overflow-hidden rounded-[15px] bg-white p-4">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-200/40 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-emerald-400 text-white">
                      <Sparkles size={12} />
                    </span>
                    <p className="text-sm font-semibold">Insights</p>
                    <span className="text-xs text-gray-400">last 6 months</span>
                  </div>

                  {(loading || reportLoading) && insights.length === 0 && (
                    <p className="mt-3 text-sm text-gray-500">Loading insights...</p>
                  )}

                  {!loading && !reportLoading && insights.length === 0 && (
                    <p className="mt-3 text-sm text-gray-500">
                      Add a few transactions and your insights will show up here.
                    </p>
                  )}

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    {insights.map(({ icon: Icon, tone, title, text }) => (
                      <div
                        key={title}
                        className="flex gap-2.5 rounded-xl border border-neutral-200/70 bg-white/70 p-3"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClass[tone]}`}
                        >
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium leading-snug">{title}</p>
                          <p className="mt-0.5 text-xs leading-snug text-gray-500">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-3 grid gap-4 sm:mx-4 md:mx-8 md:gap-6 lg:grid-cols-2">
              <div className={card}>
                <p className="text-sm font-semibold">Recent transactions</p>
                {!loading && data?.recentTransactions.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    No transactions yet. Add your first one to see it here.
                  </p>
                )}
                <ul className="mt-2 divide-y divide-neutral-100">
                  {data?.recentTransactions.map((t) => (
                    <li
                      key={t._id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.category}</p>
                        <p className="truncate text-xs text-gray-500">
                          {t.note ? `${t.note} · ` : ""}
                          {day(t.date)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-medium ${
                          t.type === "income" ? "text-green-600" : "text-[#ff4d52]"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {ksh(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={card}>
                <p className="text-sm font-semibold">Saving goals</p>
                {!loading && data?.goals.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
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
                          <span className="text-xs text-gray-500 sm:text-sm">
                            {ksh(g.savedAmount)} of {ksh(g.targetAmount)}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;