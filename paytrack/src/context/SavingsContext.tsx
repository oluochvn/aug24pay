import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SavingsGoal } from "../types";

interface SavingsContextType {
  goals: SavingsGoal[];
  addGoal: (g: Omit<SavingsGoal, "id" | "savedAmount">) => void;
  contribute: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);
const STORAGE_KEY = "paytrack_savings_goals";

export function SavingsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = (g: Omit<SavingsGoal, "id" | "savedAmount">) => {
    setGoals((prev) => [...prev, { ...g, id: crypto.randomUUID(), savedAmount: 0 }]);
  };

  const contribute = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, savedAmount: Math.max(0, g.savedAmount + amount) } : g
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <SavingsContext.Provider value={{ goals, addGoal, contribute, deleteGoal }}>
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const ctx = useContext(SavingsContext);
  if (!ctx) throw new Error("useSavings must be used within SavingsProvider");
  return ctx;
}