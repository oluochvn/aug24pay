export type TransactionType = "income" | "expense";

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

export interface Summary {
  user?: { username?: string };
  balance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
  goals: Goal[];
}

export interface Report {
  months: {
    label: string;
    year: number;
    income: number;
    expenses: number;
  }[];
  categories: { category: string; total: number }[];
  income: number;
  expenses: number;
}
