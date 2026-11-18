export const colors = {
  background: "#f4f4f5",
  surface: "#ffffff",
  text: "#171717",
  muted: "#737373",
  border: "#e5e5e5",
  accent: "#6d78d5",
  accentLight: "#eef0ff",
  positive: "#16834a",
  negative: "#d94b51",
};

export const formatMoney = (amount: number | undefined) =>
  `KSH ${Number(amount || 0).toLocaleString("en-KE")}`;

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
