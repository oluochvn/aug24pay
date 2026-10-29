import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Wallet, Bell, Settings } from "lucide-react";
import { useApi } from "../lib/useApi";

interface MonthData {
  label: string;
  year: number;
  income: number;
  expenses: number;
}

interface CategoryData {
  category: string;
  total: number;
}

interface Report {
  months: MonthData[];
  categories: CategoryData[];
  income: number;
  expenses: number;
}

const ranges = [
  { label: "1M", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
];

const ksh = (n?: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
    isActive ? "bg-white text-black" : "text-gray-400 hover:bg-neutral-800"
  }`;

function Reports() {
  const [months, setMonths] = useState(6);
  const { data: report, loading, error } = useApi<Report>(
    `/reports?months=${months}`
  );

  const income = report?.income || 0;
  const expenses = report?.expenses || 0;
  const net = income - expenses;
  const rate = income > 0 ? Math.round((net / income) * 100) : 0;

  const chartMax = Math.max(
    1,
    ...(report?.months.flatMap((m) => [m.income, m.expenses]) || [])
  );
  const barHeight = (v: number) => (v > 0 ? Math.max(2, (v / chartMax) * 100) : 0);

  const categoryTotal = report?.categories.reduce((s, c) => s + c.total, 0) || 0;

  const stats = [
    { label: "Income", value: ksh(income), color: "text-green-400" },
    { label: "Expenses", value: ksh(expenses), color: "text-[#ff4d52]" },
    {
      label: "Net savings",
      value: `${net < 0 ? "-" : ""}${ksh(Math.abs(net))}`,
      color: net < 0 ? "text-[#ff4d52]" : "text-white",
    },
    { label: "Savings rate", value: `${rate}%`, color: "text-white" },
  ];

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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Reports</h2>
          <div className="flex items-center gap-2">
            {ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setMonths(r.value)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  months === r.value
                    ? "bg-white text-black"
                    : "text-gray-400 hover:bg-neutral-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && !report && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-gray-400">
            {error}
          </div>
        )}

        {(!error || report) && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
                >
                  <h1 className="text-sm text-gray-400">{s.label}</h1>
                  <h1
                    className={`mt-1 break-words text-lg font-semibold sm:text-2xl ${s.color}`}
                  >
                    {loading ? "..." : s.value}
                  </h1>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Income vs expenses</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff4d52]" />
                    Expenses
                  </span>
                </div>
              </div>

              {!loading && income === 0 && expenses === 0 ? (
                <p className="mt-3 text-sm text-gray-400">
                  No transactions in this period yet.
                </p>
              ) : (
                <div className="mt-4 flex h-44 items-end gap-2 sm:gap-4">
                  {report?.months.map((m) => (
                    <div
                      key={`${m.year}-${m.label}`}
                      className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex w-full flex-1 items-end justify-center gap-1">
                        <div
                          title={`Income ${ksh(m.income)}`}
                          className="w-full max-w-[18px] rounded-t-md bg-green-400"
                          style={{ height: `${barHeight(m.income)}%` }}
                        />
                        <div
                          title={`Expenses ${ksh(m.expenses)}`}
                          className="w-full max-w-[18px] rounded-t-md bg-[#ff4d52]"
                          style={{ height: `${barHeight(m.expenses)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-sm font-semibold">Spending by category</p>

              {!loading && report?.categories.length === 0 && (
                <p className="mt-3 text-sm text-gray-400">
                  No expenses in this period yet.
                </p>
              )}

              <ul className="mt-3 space-y-4">
                {report?.categories.map((c) => {
                  const pct = categoryTotal
                    ? Math.round((c.total / categoryTotal) * 100)
                    : 0;
                  return (
                    <li key={c.category}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium">{c.category}</span>
                        <span className="shrink-0 text-xs text-gray-400 sm:text-sm">
                          {ksh(c.total)} · {pct}%
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
    </div>
  );
}

export default Reports;