import { useState } from "react";
import { Settings, Bell, Wallet } from "lucide-react";

const tabs = ["Dashboard", "Transactions", "Savings", "Reports"];

function Dashboard() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="dashboard m-2 p-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Wallet size={18} />
          </div>
          <h1 className="text-sm font-semibold">paytrack</h1>
        </div>

        <ul className="flex items-center gap-2">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setActive(tab)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active === tab
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Settings size={16} />
          </button>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 text-xs font-medium">
              U
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>
      </nav>

      <div className="flex gap-6 m-8 mt-12">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <h1 className="text-sm text-gray-600">Total Balance</h1>
          <h1 className="mt-1 text-2xl font-semibold">KSH 2000</h1>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <h1 className="text-sm text-gray-600">Income</h1>
          <h1 className="mt-1 text-2xl font-semibold">KSH 2000</h1>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <h1 className="text-sm text-gray-600">Expense</h1>
          <h1 className="mt-1 text-2xl font-semibold">KSH 2000</h1>
        </div>
      </div>

      <div className="mx-8 mb-6 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold">Recent transactions</p>
      </div>

      <div className="mx-8 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold">Saving goals</p>
      </div>
    </div>
  );
}

export default Dashboard;