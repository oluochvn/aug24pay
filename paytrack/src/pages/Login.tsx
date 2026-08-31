import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Triangle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("invalid password or email. Please check and try again");
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen w-full bg-black">
      <header className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
          <Triangle className="h-3.5 w-3.5 fill-black text-black" strokeWidth={0} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Paytrack
        </span>
      </header>

      <main className="flex justify-center px-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back!
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Log in to your <span className="font-medium text-neutral-200">paytrack</span> account
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 py-2.5 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-900"
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
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-xs text-neutral-500">OR</span>
            <div className="h-px flex-1 bg-neutral-700" />
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                Email
              </label>
              <input
               required
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="myemail@gmail.com"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                required
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 pr-10 text-sm text-white placeholder-neutral-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-neutral-400">
              Forgot your password?{" "}
              <a href="#" className="text-orange-400 hover:underline">
                Reset
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-orange-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              Log in
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            Don't have an account?
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-3 w-full rounded-lg border border-neutral-700 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-900"
          >
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
}