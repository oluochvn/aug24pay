import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { setApiToken, setUnauthorizedHandler } from "./api";

const TOKEN_KEY = "paytrack.auth-token";

type SessionValue = {
  token: string | null;
  ready: boolean;
  storageError: string;
  signIn: (value: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;

    SecureStore.getItemAsync(TOKEN_KEY)
      .then((savedToken) => {
        if (!active) return;
        setApiToken(savedToken);
        setToken(savedToken);
      })
      .catch((error: unknown) => {
        if (active) {
          setStorageError(
            error instanceof Error ? error.message : "Could not read saved login.",
          );
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (value: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, value);
    setApiToken(value);
    setToken(value);
    setStorageError("");
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setApiToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setApiToken(null);
      setToken(null);
      SecureStore.deleteItemAsync(TOKEN_KEY).catch((error: unknown) => {
        setStorageError(
          error instanceof Error ? error.message : "Could not clear saved login.",
        );
      });
    });

    return () => setUnauthorizedHandler(() => {});
  }, []);

  const value = useMemo(
    () => ({ token, ready, storageError, signIn, signOut }),
    [token, ready, storageError, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
