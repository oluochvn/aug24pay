export type Currency = "KSH" | "USD";

export function formatCurrency(
  amount: number | undefined,
  currency: Currency,
  kesPerUsd: number | null
) {
  const value = Number(amount || 0);
  if (currency === "KSH") {
    return `KSH ${value.toLocaleString("en-KE")}`;
  }
  if (kesPerUsd === null) return "USD unavailable";
  return `USD ${(value / kesPerUsd).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
