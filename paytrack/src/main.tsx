import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TransactionsProvider } from "./context/TransactionsContext";
import { SavingsProvider } from "./context/SavingsContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TransactionsProvider>
        <SavingsProvider>
          <App />
        </SavingsProvider>
      </TransactionsProvider>
    </BrowserRouter>
  </StrictMode>
);