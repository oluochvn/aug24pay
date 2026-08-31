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
    setError("Incorrect password. Please check and try again");
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900">
          <Triangle className="h-3.5 w-3.5 fill-white text-white" strokeWidth={0} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Paytrack
        </span>
      </header>

      <main className="flex justify-center px-4 pt-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Welcome back!
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Log in to your <span className="font-medium text-neutral-700">paytrack</span> account
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="myemail@gmail.com"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 pr-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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

            <div className="text-sm text-neutral-500">
              Forgot your password?{" "}
              <a href="#" className="text-orange-500 hover:underline">
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

          <div className="mt-6 text-center text-xs text-neutral-400">
            Don't have an account?
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="mt-3 w-full rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
          >
            Sign up
          </button>
        </div>
      </main>
    </div>
  );
}