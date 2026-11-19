import { useEffect, useState } from "react";
import { CurrencyContext } from "./currency-context";
import { formatCurrency, type Currency } from "./currency-utils";

interface ExchangeRateResponse {
  result: string;
  time_last_update_utc: string;
  rates?: { KES?: number };
}

const STORAGE_KEY = "paytrack-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() =>
    localStorage.getItem(STORAGE_KEY) === "USD" ? "USD" : "KSH"
  );
  const [kesPerUsd, setKesPerUsd] = useState<number | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState("");
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Exchange-rate service returned ${response.status}.`);
        }

        const result = (await response.json()) as ExchangeRateResponse;
        const rate = result.rates?.KES;
        if (
          result.result !== "success" ||
          typeof rate !== "number" ||
          !Number.isFinite(rate) ||
          rate <= 0
        ) {
          throw new Error("A USD to KSH exchange rate was not provided.");
        }

        setKesPerUsd(rate);
        setRateUpdatedAt(result.time_last_update_utc);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setRateError(
          err instanceof Error
            ? err.message
            : "Could not load the exchange rate."
        );
      } finally {
        if (!controller.signal.aborted) setRateLoading(false);
      }
    };

    void fetchExchangeRate();
    return () => controller.abort();
  }, []);

  const formatMoney = (amount?: number) =>
    formatCurrency(amount, currency, kesPerUsd);
  const toKsh = (amount: number) =>
    currency === "KSH"
      ? amount
      : kesPerUsd === null
        ? null
        : Math.round(amount * kesPerUsd * 100) / 100;
  const fromKsh = (amount: number) =>
    currency === "KSH"
      ? amount
      : kesPerUsd === null
        ? null
        : amount / kesPerUsd;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        kesPerUsd,
        rateUpdatedAt,
        rateLoading,
        rateError,
        formatMoney,
        toKsh,
        fromKsh,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
