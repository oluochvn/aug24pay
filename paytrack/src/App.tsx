import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/landing";
import Transactions from "./pages/Transactions";
import Savings from "./pages/Saving";
import Reports from "./pages/Report";
import { CurrencyProvider } from "./lib/currency";
export default function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </CurrencyProvider>
  );
}