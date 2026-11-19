import { useEffect, useState } from "react";
import { CurrencyContext } from "./currency-context";
import { formatCurrency, type Currency } from "./currency-utils";

interface ExchangeRateResponse {
  result: string;
  time_last_update_utc: string;
  rates?: { KES?: number };
}

interface BitcoinPriceResponse {
  bitcoin?: { kes?: number; last_updated_at?: number };
}

const STORAGE_KEY = "paytrack-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() =>
    localStorage.getItem(STORAGE_KEY) === "USD"
      ? "USD"
      : localStorage.getItem(STORAGE_KEY) === "BTC"
        ? "BTC"
        : "KSH"
  );
  const [kesPerUsd, setKesPerUsd] = useState<number | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState("");
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState("");
  const [kesPerBtc, setKesPerBtc] = useState<number | null>(null);
  const [btcRateUpdatedAt, setBtcRateUpdatedAt] = useState("");
  const [btcRateLoading, setBtcRateLoading] = useState(true);
  const [btcRateError, setBtcRateError] = useState("");

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

  useEffect(() => {
    const controller = new AbortController();

    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes&include_last_updated_at=true",
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Bitcoin price service returned ${response.status}.`);
        }

        const result = (await response.json()) as BitcoinPriceResponse;
        const rate = result.bitcoin?.kes;
        if (
          typeof rate !== "number" ||
          !Number.isFinite(rate) ||
          rate <= 0
        ) {
          throw new Error("A BTC to KSH exchange rate was not provided.");
        }

        setKesPerBtc(rate);
        if (result.bitcoin?.last_updated_at) {
          setBtcRateUpdatedAt(
            new Date(result.bitcoin.last_updated_at * 1000).toUTCString()
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setBtcRateError(
          err instanceof Error
            ? err.message
            : "Could not load the BTC exchange rate."
        );
      } finally {
        if (!controller.signal.aborted) setBtcRateLoading(false);
      }
    };

    void fetchBitcoinPrice();
    return () => controller.abort();
  }, []);

  const formatMoney = (amount?: number) =>
    formatCurrency(amount, currency, kesPerUsd, kesPerBtc);
  const toKsh = (amount: number) =>
    currency === "KSH"
      ? amount
      : currency === "USD"
        ? kesPerUsd === null
          ? null
          : Math.round(amount * kesPerUsd * 100) / 100
        : kesPerBtc === null
        ? null
        : Math.round(amount * kesPerBtc * 100) / 100;
  const fromKsh = (amount: number) =>
    currency === "KSH"
      ? amount
      : currency === "USD"
        ? kesPerUsd === null
          ? null
          : amount / kesPerUsd
        : kesPerBtc === null
        ? null
        : amount / kesPerBtc;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        kesPerUsd,
        kesPerBtc,
        rateUpdatedAt,
        btcRateUpdatedAt,
        rateLoading,
        rateError,
        btcRateLoading,
        btcRateError,
        formatMoney,
        toKsh,
        fromKsh,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
