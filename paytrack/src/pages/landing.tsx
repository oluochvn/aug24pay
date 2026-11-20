import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ArrowLeftRight,
    title: "Know where it goes",
    description:
      "Keep income and expenses together, so your day-to-day money is easier to understand.",
  },
  {
    icon: PiggyBank,
    title: "Make room to save",
    description:
      "Set savings goals, track your progress, and keep the next milestone in sight.",
  },
  {
    icon: BarChart3,
    title: "See the bigger picture",
    description:
      "Turn your activity into clear reports that help you make your next move.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#09090a] text-white">
      <header className="sticky top-0 z-20 border-b border-[#202023]/70 bg-[#09090a]/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8 lg:px-12">
          <Link
            to="/landing"
            className="justify-self-start text-base font-semibold tracking-wide"
            aria-label="PayTrack home"
          >
            paytrack
          </Link>
          <nav
            className="flex items-center gap-2 text-[11px] text-[#97979a] sm:gap-8 sm:text-sm"
            aria-label="Main navigation"
          >
            <a href="#about" className="transition-colors hover:text-white">
              About
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-white"
            >
              Features
            </a>
            <button
              type="button"
              aria-describedby="pricing-tooltip"
              className="group relative whitespace-nowrap transition-colors hover:text-white hover:line-through focus-visible:text-white focus-visible:line-through"
            >
              Pricing
              <span
                id="pricing-tooltip"
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-44 -translate-x-1/2 border border-[#34353a] bg-[#151517] px-3 py-2 text-center text-xs text-[#e2e3e5] opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Working on paid features
              </span>
            </button>
          </nav>
          <div className="flex items-center justify-self-end gap-2 sm:gap-6">
            <Link
              to="/login"
              className="whitespace-nowrap text-xs font-medium text-[#d5d5d8] transition-colors hover:text-white sm:text-sm"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="whitespace-nowrap bg-[#4ade80] px-2.5 py-2 text-xs font-semibold text-[#09090a] transition-colors hover:bg-[#4ade80] sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className="scroll-mt-24 relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-16">
          <div className="absolute -left-48 top-8 h-96 w-96 bg-[#292a2d]/40 blur-[120px]" />
          <div className="relative z-[1] max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#292a2d] bg-[#121213] px-3 py-2 text-xs font-medium text-[#b6b6ba]">
              <span className="h-1.5 w-1.5 bg-[#a3a3a7]" />
              A clearer way to manage your money
            </div>
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Your money,
              <br />
              <span className="text-white">in better focus.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#a3a3a7] sm:text-lg sm:leading-8">
              Track what comes in, understand what goes out, and make progress
              toward what matters to you—all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#4ade80] px-5 py-3.5 text-sm font-semibold text-[#09090a] transition-colors hover:bg-[#4ade80]"
              >
                Start tracking for free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center border border-[#35363a] px-5 py-3.5 text-sm font-medium text-[#e2e3e5] transition-colors hover:bg-[#151517]"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8e8e93]">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#97979a]" />
                Income and expenses
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#97979a]" />
                Savings goals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-[#97979a]" />
                Clear reports
              </span>
            </div>
          </div>

          <div className="relative z-[1] mx-auto w-full max-w-[560px] lg:ml-auto">
            <div className="absolute -right-8 -top-8 h-32 w-32 border-r border-t border-[#343638]" />
            <div className="relative border border-[#2b2c31] bg-[#101012] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.42)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[#26272b] pb-4">
                <div>
                  <p className="text-sm font-semibold">Your overview</p>
                  <p className="mt-1 text-xs text-[#85858b]">A snapshot of your finances</p>
                </div>
                <span className="border border-[#34353a] px-2.5 py-1.5 text-xs text-[#b8b8be]">
                  This month
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-[#292a2e] bg-[#151517] p-3.5 sm:p-4">
                  <p className="text-xs text-[#96969c]">Income</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                    KSH 84,500
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#4ade80]">
                    <ArrowUpRight size={13} />
                    Money in
                  </div>
                </div>
                <div className="border border-[#292a2e] bg-[#151517] p-3.5 sm:p-4">
                  <p className="text-xs text-[#96969c]">Expenses</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                    KSH 32,800
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#a3a3a7]">
                    <ArrowDownRight size={13} />
                    Money out
                  </div>
                </div>
              </div>

              <div className="mt-4 border border-[#292a2e] bg-[#151517] p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#96969c]">Spending overview</p>
                    <p className="mt-1 text-sm font-medium">A little more clarity, every week</p>
                  </div>
                  <BarChart3 size={17} className="text-[#a3a3a7]" />
                </div>
                <div className="mt-5 h-28 sm:h-32">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 480 120"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Illustrative spending trend chart"
                  >
                    <defs>
                      <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity=".2" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 92 C28 84 39 88 64 72 S103 68 128 78 S168 57 192 62 S231 72 256 49 S295 52 320 42 S360 55 384 37 S426 39 448 20 S467 26 480 12 V120 H0 Z"
                      fill="url(#chart-fill)"
                    />
                    <path
                      d="M0 92 C28 84 39 88 64 72 S103 68 128 78 S168 57 192 62 S231 72 256 49 S295 52 320 42 S360 55 384 37 S426 39 448 20 S467 26 480 12"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="2.5"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path d="M0 119 H480 M0 79 H480 M0 39 H480" stroke="#2b2c31" strokeWidth="1" />
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[#77777d] sm:text-xs">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border border-[#292a2e] bg-[#151517] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#242526] text-[#a3a3a7]">
                    <PiggyBank size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-medium">Next savings goal</p>
                    <p className="mt-1 text-[11px] text-[#8b8b91]">Build your safety net</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#a3a3a7]">Keep going →</span>
              </div>
              <p className="mt-3 text-center text-[10px] text-[#73737a]">
                Illustrative preview · Your dashboard reflects your activity
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-t border-[#202023] bg-[#0d0d0f]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#97979a]">
                Everything in one view
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Small steps. A stronger picture.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#96969c] sm:text-base">
                A straightforward toolkit to help you stay informed and move
                toward your financial goals.
              </p>
            </div>
            <div className="mt-10 grid gap-px border border-[#292a2e] bg-[#292a2e] md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="bg-[#0d0d0f] p-6 sm:p-7">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#343638] bg-[#171819] text-[#a3a3a7]">
                    <Icon size={19} />
                  </div>
                  <p className="mt-6 text-xs font-medium text-[#77777d]">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#96969c]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-12">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Ready to get a clearer picture?
            </h2>
            <p className="mt-2 text-sm text-[#96969c]">
              Start with your first transaction and build from there.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-2 bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#09090a] transition-colors hover:bg-[#4ade80]"
          >
            Create your account
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#202023]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-[#77777d] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link to="/landing" className="flex items-center gap-2 font-semibold text-[#d5d5d8]">
            <Wallet size={15} className="text-[#a3a3a7]" />
            paytrack
          </Link>
          <p>Take control of your money, one step at a time.</p>
          <Link to="/login" className="transition-colors hover:text-white">
            Log in to your account
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
