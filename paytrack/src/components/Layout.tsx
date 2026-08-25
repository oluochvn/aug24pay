import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, History, PieChart, PiggyBank, LogOut, Triangle } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Add Transaction", icon: PlusCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/reports", label: "Reports", icon: PieChart },
];

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-60 flex-col border-r border-neutral-200 bg-white px-4 py-5">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900">
            <Triangle className="h-3.5 w-3.5 fill-white text-white" strokeWidth={0} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Paytrack
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}