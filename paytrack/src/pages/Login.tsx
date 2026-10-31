import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Wallet } from "lucide-react";
import { clearCache } from "../lib/useApi";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://pay-8mq3.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.message ||
            data?.error ||
            "Invalid email or password. Please check and try again."
        );
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Drop anything cached by a previous session so a new login never sees it.
      clearCache();

      navigate("/dashboard");
    } catch (err) {
      setError(
        "Could not reach the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://pay-8mq3.onrender.com/api/auth/google";
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#F2F2F2] text-[#111827]"
      style={{ colorScheme: "light" }}
    >
      {/* Soft background glows, same palette as the dashboard */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <header className="relative flex items-center gap-2 px-6 py-5 sm:px-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/70 text-white">
          <Wallet size={18} />
        </div>

        <span className="text-sm font-semibold">paytrack</span>
      </header>

      <main className="relative flex justify-center px-4 pb-10 pt-6 sm:pt-12">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(17,24,39,0.35)] sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Log in to your paytrack account
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-neutral-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.82z"
              />

              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1C3.24 21.3 7.26 24 12 24z"
              />

              <path
                fill="#FBBC05"
                d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.26A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.26 5.38l4.01-3.1z"
              />

              <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.26 0 3.24 2.7 1.26 6.62l4.01 3.1c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>

            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />

            <span className="text-xs text-gray-400">or</span>

            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Email
              </label>

              <input
                required
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-600"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  required
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#111827]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#111827] py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-[#111827] hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}