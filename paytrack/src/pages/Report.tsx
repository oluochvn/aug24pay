import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { NavLink } from "react-router-dom";
import {
  Wallet,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Download,
} from "lucide-react";
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

interface Summary {
  user?: { username?: string };
}

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: string;
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://pay-8mq3.onrender.com";

const ranges = [
  { label: "1M", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
];

const menu = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Savings", to: "/savings", icon: PiggyBank },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

const ksh = (n?: number) => `KSH ${Number(n || 0).toLocaleString("en-KE")}`;

const signedKsh = (n: number) => `${n < 0 ? "-" : ""}${ksh(Math.abs(n))}`;

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

/* ---------- PDF export ---------- */

// Loads every transaction in the selected range, newest first.
async function fetchTransactions(months: number): Promise<Transaction[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/transactions`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) throw new Error("Could not load transactions.");

  const result = await response.json().catch(() => null);
  const list: Transaction[] = Array.isArray(result)
    ? result
    : Array.isArray(result?.transactions)
      ? result.transactions
      : [];

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  return list
    .filter((t) => new Date(t.date) >= from)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function downloadPdf(
  report: Report,
  months: number,
  transactions: Transaction[]
) {
  // Loaded on demand so jsPDF stays out of the main bundle.
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const right = W - M;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const income = report.income || 0;
  const expenses = report.expenses || 0;
  const net = income - expenses;
  const rate = income > 0 ? Math.round((net / income) * 100) : 0;
  const categoryTotal = report.categories.reduce((s, c) => s + c.total, 0);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("paytrack", M, y + 8);
  y += 28;

  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text("Financial report", M, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  const period = months === 1 ? "Last month" : `Last ${months} months`;
  const generated = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`${period}  |  Generated ${generated}`, M, y);
  y += 28;

  // Summary boxes
  const gap = 10;
  const boxW = (W - 2 * M - 3 * gap) / 4;
  const boxH = 54;
  const boxes = [
    { label: "Income", value: ksh(income), color: [22, 163, 74] },
    { label: "Expenses", value: ksh(expenses), color: [255, 77, 82] },
    {
      label: "Net savings",
      value: signedKsh(net),
      color: net < 0 ? [255, 77, 82] : [17, 24, 39],
    },
    { label: "Savings rate", value: `${rate}%`, color: [17, 24, 39] },
  ];

  boxes.forEach((b, i) => {
    const x = M + i * (boxW + gap);
    doc.setDrawColor(229, 229, 229);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, boxW, boxH, 8, 8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(b.label, x + 10, y + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.value, x + 10, y + 38);
  });
  y += boxH + 30;

  // Monthly breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("Income vs expenses by month", M, y);
  y += 16;

  const cols = {
    month: M,
    income: M + 250,
    expenses: M + 370,
    net: right,
  };

  const tableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Month", cols.month, y);
    doc.text("Income", cols.income, y, { align: "right" });
    doc.text("Expenses", cols.expenses, y, { align: "right" });
    doc.text("Net", cols.net, y, { align: "right" });
    y += 6;
    doc.setDrawColor(229, 229, 229);
    doc.line(M, y, right, y);
    y += 14;
  };

  tableHeader();

  if (report.months.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("No transactions in this period yet.", M, y);
    y += 20;
  }

  report.months.forEach((m) => {
    if (y + 20 > H - M) {
      doc.addPage();
      y = M;
      tableHeader();
    }
    const mNet = m.income - m.expenses;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`${m.label} ${m.year}`, cols.month, y);

    doc.setTextColor(22, 163, 74);
    doc.text(ksh(m.income), cols.income, y, { align: "right" });

    doc.setTextColor(255, 77, 82);
    doc.text(ksh(m.expenses), cols.expenses, y, { align: "right" });

    if (mNet < 0) doc.setTextColor(255, 77, 82);
    else doc.setTextColor(17, 24, 39);
    doc.text(signedKsh(mNet), cols.net, y, { align: "right" });

    y += 8;
    doc.setDrawColor(240, 240, 240);
    doc.line(M, y, right, y);
    y += 14;
  });

  y += 16;

  // Spending by category
  ensure(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text("Spending by category", M, y);
  y += 18;

  if (report.categories.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("No expenses in this period yet.", M, y);
    y += 20;
  }

  report.categories.forEach((c) => {
    ensure(36);
    const pct = categoryTotal ? Math.round((c.total / categoryTotal) * 100) : 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(c.category, M, y);

    doc.setTextColor(107, 114, 128);
    doc.text(`${ksh(c.total)} - ${pct}%`, right, y, { align: "right" });

    y += 8;
    const trackW = right - M;
    doc.setFillColor(229, 229, 229);
    doc.roundedRect(M, y, trackW, 6, 3, 3, "F");
    if (pct > 0) {
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(M, y, Math.max(6, (trackW * pct) / 100), 6, 3, 3, "F");
    }
    y += 24;
  });

  // All transactions
  y += 10;
  ensure(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text(`All transactions (${transactions.length})`, M, y);
  y += 16;

  const tc = { date: M, category: M + 80, note: M + 195, amount: right };

  const clip = (text: string, width: number) => {
    if (doc.getTextWidth(text) <= width) return text;
    let out = text;
    while (out.length > 1 && doc.getTextWidth(`${out}...`) > width) {
      out = out.slice(0, -1);
    }
    return `${out}...`;
  };

  const txHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Date", tc.date, y);
    doc.text("Category", tc.category, y);
    doc.text("Note", tc.note, y);
    doc.text("Amount", tc.amount, y, { align: "right" });
    y += 6;
    doc.setDrawColor(229, 229, 229);
    doc.line(M, y, right, y);
    y += 14;
  };

  txHeader();

  if (transactions.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("No transactions in this period yet.", M, y);
    y += 20;
  }

  transactions.forEach((t) => {
    if (y + 20 > H - M) {
      doc.addPage();
      y = M;
      txHeader();
    }

    const isIncome = t.type === "income";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.setTextColor(107, 114, 128);
    doc.text(
      new Date(t.date).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      tc.date,
      y
    );

    doc.setTextColor(17, 24, 39);
    doc.text(clip(t.category || "-", 105), tc.category, y);

    doc.setTextColor(107, 114, 128);
    doc.text(clip(t.note || "-", 175), tc.note, y);

    if (isIncome) doc.setTextColor(22, 163, 74);
    else doc.setTextColor(255, 77, 82);
    doc.text(`${isIncome ? "+" : "-"}${ksh(t.amount)}`, tc.amount, y, {
      align: "right",
    });

    y += 7;
    doc.setDrawColor(240, 240, 240);
    doc.line(M, y, right, y);
    y += 13;
  });

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pages}`, right, H - 20, { align: "right" });
    doc.text("paytrack", M, H - 20);
  }

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`paytrack-report-${months}m-${date}.pdf`);
}

/* ---------- Trend chart ---------- */

const CHART_W = 600;
const CHART_H = 200;
const X_START = 3;
const X_SPAN = 94;

const compact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(Math.round(n));
};

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = [1, 2, 4, 6, 8, 10].find((s) => n <= s) ?? 10;
  return step * pow;
};

const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
};

function TrendChart({ months }: { months: MonthData[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = months.length;
  if (n === 0) return null;

  const max = niceMax(Math.max(...months.flatMap((m) => [m.income, m.expenses])));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);

  const xPct = (i: number) => (n === 1 ? 50 : X_START + (i / (n - 1)) * X_SPAN);
  const yPct = (v: number) => 100 - (v / max) * 100;

  const toPoints = (key: "income" | "expenses") =>
    months.map((m, i) => ({
      x: (xPct(i) / 100) * CHART_W,
      y: (yPct(m[key]) / 100) * CHART_H,
    }));

  const inc = toPoints("income");
  const exp = toPoints("expenses");
  const incPath = smoothPath(inc);
  const areaPath =
    n > 1 ? `${incPath} L ${inc[n - 1].x} ${CHART_H} L ${inc[0].x} ${CHART_H} Z` : "";

  const active = hover ?? n - 1;
  const am = months[active];
  const activeLeft = `${xPct(active)}%`;

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (n === 1) {
      setHover(0);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const idx = Math.round(((pct - X_START) / X_SPAN) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  };

  return (
    <div className="mt-4 pt-16">
      <div className="flex">
        {/* Y axis */}
        <div className="relative h-48 w-11 shrink-0">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="absolute right-2 translate-y-1/2 text-xs tabular-nums text-gray-500"
              style={{ bottom: `${(i / 4) * 100}%` }}
            >
              {compact(t)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div
          className="relative h-48 min-w-0 flex-1 touch-pan-y"
          onPointerMove={handleMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-t border-neutral-100"
              style={{ bottom: `${(i / 4) * 100}%` }}
            />
          ))}

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
            </defs>

            {n > 1 && <path d={areaPath} fill="url(#trend-fill)" />}

            {n > 1 && (
              <path
                d={smoothPath(exp)}
                fill="none"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {n > 1 && (
              <path
                d={incPath}
                fill="none"
                stroke="#000000"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Guide line */}
          <div
            className="pointer-events-none absolute inset-y-0 border-l border-dashed border-black/20"
            style={{ left: activeLeft }}
          />

          {/* Points */}
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-400"
            style={{ left: activeLeft, top: `${yPct(am.expenses)}%` }}
          />
          <span
            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow"
            style={{ left: activeLeft, top: `${yPct(am.income)}%` }}
          />

          {/* Tooltip */}
          <div
            className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg"
            style={{
              left: `clamp(70px, ${xPct(active)}%, calc(100% - 70px))`,
              top: `calc(${yPct(Math.max(am.income, am.expenses))}% - 16px)`,
            }}
          >
            <p className="text-xs font-semibold">
              {am.label} {am.year}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-black" />
              Income: {ksh(am.income)}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Expenses: {ksh(am.expenses)}
            </p>
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="flex">
        <div className="w-11 shrink-0" />
        <div className="relative mt-2 h-4 min-w-0 flex-1">
          {months.map((m, i) => (
            <span
              key={`${m.year}-${m.label}`}
              className={`absolute -translate-x-1/2 text-xs text-gray-500 ${
                i % 2 === 1 && n > 6 ? "hidden sm:block" : ""
              }`}
              style={{ left: `${xPct(i)}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

function Reports() {
  const [months, setMonths] = useState(6);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { data: report, loading, error } = useApi<Report>(
    `/reports?months=${months}`
  );
  const { data: summary } = useApi<Summary>("/summary");

  const username = summary?.user?.username || "";

  const income = report?.income || 0;
  const expenses = report?.expenses || 0;
  const net = income - expenses;
  const rate = income > 0 ? Math.round((net / income) * 100) : 0;

  const categoryTotal = report?.categories.reduce((s, c) => s + c.total, 0) || 0;

  const stats = [
    { label: "Income", value: ksh(income), color: "text-black" },
    { label: "Expenses", value: ksh(expenses), color: "text-black" },
    {
      label: "Net savings",
      value: signedKsh(net),
      color: net < 0 ? "text-[#ff4d52]" : "text-[#111827]",
    },
    { label: "Savings rate", value: `${rate}%`, color: "text-[#111827]" },
  ];

  const handleDownload = async () => {
    if (!report || exporting) return;
    setExportError("");
    setExporting(true);
    try {
      const transactions = await fetchTransactions(months);
      await downloadPdf(report, months, transactions);
    } catch (err) {
      setExportError(
        err instanceof Error && err.message
          ? err.message
          : "Could not create the PDF. Please try again."
      );
    } finally {
      setExporting(false);
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

        {/* Title + controls */}
        <div className="mx-3 mt-6 flex flex-wrap items-end justify-between gap-3 sm:mx-4 md:mx-8">
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-gray-500">See where your money goes</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setMonths(r.value)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  months === r.value
                    ? "bg-[#111827] text-white"
                    : "bg-white text-gray-600 hover:bg-white/60"
                }`}
              >
                {r.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleDownload}
              disabled={!report || loading || exporting}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-[#111827] transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        </div>

        {exportError && (
          <p className="mx-3 mt-3 text-xs text-red-500 sm:mx-4 md:mx-8">
            {exportError}
          </p>
        )}

        {error && !report && (
          <div className={`mx-3 mt-6 text-sm text-gray-500 sm:mx-4 md:mx-8 md:mt-8 ${card}`}>
            {error}
          </div>
        )}

        {(!error || report) && (
          <>
            {/* Stats */}
            <div className="m-3 mt-5 grid grid-cols-2 gap-3 sm:m-4 sm:mt-6 md:m-8 md:mt-6 md:grid-cols-4 md:gap-6">
              {stats.map((s) => (
                <div key={s.label} className={card}>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p
                    className={`mt-1 break-words text-lg font-semibold sm:text-2xl ${s.color}`}
                  >
                    {loading ? "..." : s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mx-3 space-y-4 sm:mx-4 md:mx-8 md:space-y-6">
              {/* Income vs expenses */}
              <div className={card}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Income vs expenses</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded-full bg-black" />
                      Income
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 border-t-2 border-dashed border-gray-400" />
                      Expenses
                    </span>
                  </div>
                </div>

                {!loading && income === 0 && expenses === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">
                    No transactions in this period yet.
                  </p>
                ) : (
                  <TrendChart months={report?.months ?? []} />
                )}
              </div>

              {/* Spending by category */}
              <div className={card}>
                <p className="text-sm font-semibold">Spending by category</p>

                {!loading && report?.categories.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
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
                        <div className="mb-1 flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <span className="truncate font-medium">{c.category}</span>
                          <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
                            {ksh(c.total)} · {pct}%
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

export default Reports;