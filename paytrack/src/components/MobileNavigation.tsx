import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { logout } from "../lib/useApi";

interface NavigationItem {
  label: string;
  to: string;
}

export default function MobileNavigation({
  items,
}: {
  items: NavigationItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-3 mt-4 sm:mx-4 lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-gray-600"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mt-2 flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-2"
        >
          {items.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm ${
                  isActive
                    ? "bg-[#111827] font-medium text-white"
                    : "text-gray-600 hover:bg-neutral-50"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-neutral-50"
          >
            Log out
          </button>
        </nav>
      )}
    </div>
  );
}
