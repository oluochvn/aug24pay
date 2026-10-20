import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/savings" element={<div className="m-8">Savings</div>} />
      <Route path="/reports" element={<div className="m-8">Reports</div>} />
      <Route path="/settings" element={<div className="m-8">Settings</div>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}