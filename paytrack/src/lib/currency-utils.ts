export type Currency = "KSH" | "USD" | "BTC";

export function formatCurrency(
  amount: number | undefined,
  currency: Currency,
  kesPerUsd: number | null,
  kesPerBtc: number | null
) {
  const value = Number(amount || 0);
  if (currency === "KSH") {
    return `KSH ${value.toLocaleString("en-KE")}`;
  }
  if (currency === "BTC") {
    if (kesPerBtc === null) return "BTC unavailable";
    return `BTC ${(value / kesPerBtc).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })}`;
  }
  if (kesPerUsd === null) return "USD unavailable";
  return `USD ${(value / kesPerUsd).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
