export const colors = {
  background: "#09090a",
  surface: "#121213",
  text: "#f5f5f5",
  muted: "#a3a3a7",
  border: "#292a2d",
  accent: "#4ade80",
  accentLight: "#14251b",
  positive: "#4ade80",
  negative: "#a3a3a7",
};

export const formatMoney = (amount: number | undefined) =>
  `KSH ${Number(amount || 0).toLocaleString("en-KE")}`;

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
