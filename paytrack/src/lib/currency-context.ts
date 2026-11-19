import { createContext } from "react";
import type { Currency } from "./currency-utils";

export interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  kesPerUsd: number | null;
  kesPerBtc: number | null;
  rateUpdatedAt: string;
  btcRateUpdatedAt: string;
  rateLoading: boolean;
  rateError: string;
  btcRateLoading: boolean;
  btcRateError: string;
  formatMoney: (amount?: number) => string;
  toKsh: (amount: number) => number | null;
  fromKsh: (amount: number) => number | null;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);
