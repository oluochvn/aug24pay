import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { apiRequest } from "../api";

export function useApiResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest<T>(path);
      if (isActive()) setData(result);
    } catch (reason) {
      if (isActive()) {
        setError(
          reason instanceof Error ? reason.message : "Could not load data.",
        );
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [path]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void load(() => active);

      return () => {
        active = false;
      };
    }, [load]),
  );

  return {
    data,
    loading,
    error,
    refresh: () => load(),
    setData,
  };
}
