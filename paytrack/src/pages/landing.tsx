
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  PiggyBank,
  ReceiptText,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: ReceiptText,
    preview: "transactions",
    title: "Track every transaction",
    description:
      "Log income and expenses in seconds, then see exactly what moved your balance.",
  },
  {
    icon: PiggyBank,
    preview: "savings",
    title: "Build toward a goal",
    description:
      "Create savings targets and follow your progress without losing sight of today.",
  },
  {
    icon: BarChart3,
    preview: "report",
    title: "Understand the bigger picture",
    description:
      "Turn your activity into clear reports that make the next decision easier.",
  },
] as const;

function FeaturePreview({
  type,
}: {
  type: "transactions" | "savings" | "report";
}) {
  return (
    <div className="landing-feature-preview flex h-44 items-center justify-center overflow-hidden border border-white/10 bg-[#0d0d0d] p-4">
      {type === "transactions" && (
        <div className="w-full max-w-sm border border-white/10 bg-black p-3 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <p className="text-[11px] font-semibold text-white/85">Recent transactions</p>
              <p className="mt-0.5 text-[9px] text-white/45">Your latest account activity</p>
            </div>
            <span className="text-[9px] text-white/50">View all</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-2">
            <div>
              <p className="text-[10px] font-medium text-white/80">Salary</p>
              <p className="mt-0.5 text-[9px] text-white/40">Income · 18 Nov</p>
            </div>
            <p className="landing-transaction-income text-[10px] font-semibold text-white/80">+ KSH 45,000</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-[10px] font-medium text-white/80">Groceries</p>
              <p className="mt-0.5 text-[9px] text-white/40">Food · 16 Nov</p>
            </div>
            <p className="text-[10px] font-semibold text-white/60">- KSH 3,200</p>
          </div>
        </div>
      )}
      {type === "savings" && (
        <div className="w-full max-w-sm border border-white/10 bg-black p-3 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white/85">Overall progress</p>
              <p className="mt-0.5 text-[9px] text-white/45">Across all savings goals</p>
            </div>
            <span className="text-[11px] font-semibold text-white/75">62%</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/15">
            <div className="landing-savings-progress h-1.5 w-[62%] rounded-full bg-white/70 transition-colors duration-300" />
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-white/45">
            <span>KSH 18,600 saved</span>
            <span>KSH 30,000 target</span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-2">
            <p className="text-[10px] font-medium text-white/80">Emergency fund</p>
            <p className="mt-0.5 text-[9px] text-white/45">Keep building your safety net</p>
          </div>
        </div>
      )}
      {type === "report" && (
        <div className="w-full max-w-sm border border-white/10 bg-black p-3 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white/85">Income vs expenses</p>
              <p className="mt-0.5 text-[9px] text-white/45">See where your money goes</p>
            </div>
            <span className="border border-white/15 px-1.5 py-1 text-[9px] text-white/55">6 months</span>
          </div>
          <svg
            viewBox="0 0 300 90"
            preserveAspectRatio="none"
            className="mt-3 h-20 w-full"
            role="img"
            aria-label="Sample income and expense report chart"
          >
            <path d="M0 75H300M0 48H300M0 21H300" stroke="#333" strokeWidth="1" />
            <path
              className="landing-report-expense transition-[stroke] duration-300"
              d="M5 60C35 53 48 67 75 54S115 47 145 56 185 40 215 48 260 35 295 40"
              fill="none"
              stroke="#b5b5b5"
              strokeWidth="2"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="landing-report-income transition-[stroke] duration-300"
              d="M5 68C32 61 49 37 75 45S115 24 145 34 182 18 215 29 260 12 295 17"
              fill="none"
              stroke="#f5f5f5"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-1 flex justify-between text-[9px] text-white/40">
            <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Landing() {
  return (
    <div className="landing-grain min-h-screen overflow-x-hidden bg-black text-white">
      <style>{`
        .landing-grain {
          position: relative;
          isolation: isolate;
        }
        .landing-grain::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          opacity: 0.12;
          filter: blur(0.5px);
          transform: scale(1.01);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.5'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }
        .landing-overview:hover .landing-balance-line {
          stroke: #4ade80;
        }
        .landing-overview:hover .landing-income {
          color: #4ade80;
        }
        .landing-overview:hover .landing-expense {
          color: #97979a;
        }
        .landing-overview:hover .landing-report-income {
          stroke: #4ade80;
        }
        .landing-overview:hover .landing-report-expense {
          stroke: #97979a;
        }
        .landing-feature-preview:hover .landing-transaction-income {
          color: #4ade80;
        }
        .landing-feature-preview:hover .landing-savings-progress {
          background-color: #4ade80;
        }
        .landing-feature-preview:hover .landing-report-income {
          stroke: #4ade80;
        }
        .landing-feature-preview:hover .landing-report-expense {
          stroke: #97979a;
        }
      `}</style>
      <header className="sticky top-0 z-30 border-b border-white/15 bg-black">
        <nav
          className="sticky top-0 z-40 mx-auto flex h-16 w-full max-w-7xl items-center justify-between bg-black pl-5 pr-16 sm:pl-8 sm:pr-16 lg:pl-12 lg:pr-16"
          aria-label="Main navigation"
        >
          <Link
            to="/landing"
            className="text-base font-bold tracking-tight text-white"
            aria-label="Pesatrack home"
          >
            Pesatrack
          </Link>

          <ul className="hidden items-center gap-7 text-sm text-white/65 md:flex">
            <li>
              <a className="transition-colors hover:text-white" href="#about">
                About
              </a>
            </li>
            <li>
              <a className="transition-colors hover:text-white" href="#features">
                Features
              </a>
            </li>
            <li>
              <a className="transition-colors hover:text-white" href="#pricing">
                Pricing
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/login"
              className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-sm bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:px-4"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="about"
          className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:pb-28 lg:pt-24"
        >
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Personal finance, simplified
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Make every
              <br />
              shilling count.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/60 sm:text-lg">
              Track your money, build your savings, and understand where your
              finances are going—all in one focused workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/50"
              >
                Log in
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} /> No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} /> Clear reports
              </span>
            </div>
          </div>

          <div className="landing-overview group relative mx-auto w-full max-w-[620px] border border-white/15 bg-black p-3 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-white/15">
                  <Wallet size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Overview</p>
                  <p className="text-xs text-white/45">November 2026</p>
                </div>
              </div>
              <span className="border border-white/15 px-2.5 py-1.5 text-xs text-white/60">
                This month
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="border border-white/10 p-4">
                <p className="text-xs text-white/45">Income</p>
                <p className="landing-income mt-2 text-xl font-semibold transition-colors duration-300 sm:text-2xl">KSH 84,500</p>
              </div>
              <div className="border border-white/10 p-4">
                <p className="text-xs text-white/45">Expenses</p>
                <p className="landing-expense mt-2 text-xl font-semibold transition-colors duration-300 sm:text-2xl">KSH 32,800</p>
              </div>
            </div>

            <div className="mt-3 border border-white/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50">Balance trend</p>
                <img
                  src="/dashoutline.svg"
                  alt=""
                  className="h-5 w-5 grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                />
              </div>
              <svg
                className="mt-5 h-36 w-full grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                viewBox="0 0 520 140"
                preserveAspectRatio="none"
                role="img"
                aria-label="Illustrative balance trend"
              >
                <path d="M0 118H520M0 78H520M0 38H520" stroke="#2a2a2a" />
                <path
                  className="landing-balance-line transition-[stroke] duration-300"
                  d="M0 112C38 104 55 115 92 88C128 61 158 78 194 67C230 56 251 75 286 48C321 21 350 44 386 31C422 18 454 28 520 8"
                  fill="none"
                  stroke="#f5f5f5"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-white/35">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-white/15">
                  <PiggyBank size={16} />
                </span>
                <div>
                  <p className="text-xs font-semibold">Emergency fund</p>
                  <p className="mt-1 text-[11px] text-white/45">KSH 18,600 saved</p>
                </div>
              </div>
              <span className="text-xs text-white/55">62%</span>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 border-y border-white/10"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Everything in one view
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A clearer way to manage money
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, preview, title, description }) => (
                <article
                  key={title}
                  className="group border border-white/10 bg-black p-5 transition-colors hover:border-white/30"
                >
                  <div className="grayscale transition-[filter] duration-300 group-hover:grayscale-0">
                    <FeaturePreview type={preview} />
                  </div>
                  <div className="mt-5 flex h-9 w-9 items-center justify-center border border-white/15">
                    <Icon size={17} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-20 mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 lg:px-12"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Simple pricing
            </p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with the essentials. Grow from there.
            </h2>
          </div>
          <div className="border border-white/15 p-6 sm:p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-white/55">Personal</p>
                <p className="mt-2 text-4xl font-semibold">Free</p>
              </div>
              <span className="border border-white/15 px-3 py-1.5 text-xs text-white/60">
                Available now
              </span>
            </div>
            <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
              <li className="flex items-center gap-2"><Check size={14} /> Unlimited transactions</li>
              <li className="flex items-center gap-2"><Check size={14} /> Savings goals</li>
              <li className="flex items-center gap-2"><Check size={14} /> Financial reports</li>
            </ul>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/85"
            >
              Create an account
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link to="/landing" className="font-semibold text-white/80">
            Pesatrack
          </Link>
          <p>One clear view of your money.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
