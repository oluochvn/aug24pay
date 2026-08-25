export type TransactionType = "income" | "expense";

export type Category =
  | "Food"
  | "Transport"
  | "Bills"
  | "Shopping"
  | "Salary"
  | "Other";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note?: string;
}

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Salary",
  "Other",
];
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
}