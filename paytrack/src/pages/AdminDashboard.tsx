import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Check, LogOut, Plus, Shield, Trash2, Users } from "lucide-react";
import { logout } from "../lib/useApi";

const API = "/api";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "pending" | "approved";
  lastLoginAt: string | null;
  createdAt: string;
};

type UsersResponse = {
  users?: AdminUser[];
  message?: string;
  error?: string;
};

type ProfileResponse = {
  user?: {
    id?: string;
    role?: string;
  };
  message?: string;
  error?: string;
};

type UserForm = {
  username: string;
  email: string;
  password: string;
};

async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please log in to continue.");

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body: unknown = await response.json().catch(() => null);
  const message =
    typeof body === "object" && body !== null && "message" in body
      ? String(body.message)
      : typeof body === "object" && body !== null && "error" in body
        ? String(body.error)
        : "";

  if (response.status === 401) {
    logout();
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(message || `Request failed (${response.status}).`);
  }

  return body as T;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<UserForm>({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    const result = await adminRequest<UsersResponse>("/admin/users");
    if (!Array.isArray(result.users)) {
      throw new Error("The server returned an invalid user list.");
    }
    setUsers(result.users);
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const profile = await adminRequest<ProfileResponse>("/me");
        if (!profile.user?.role) {
          throw new Error("The server did not return your account role.");
        }
        if (profile.user.role !== "admin") {
          if (active) setAuthorized(false);
          return;
        }

        if (active) {
          setCurrentUserId(profile.user.id || "");
          setAuthorized(true);
        }
        const result = await adminRequest<UsersResponse>("/admin/users");
        if (!Array.isArray(result.users)) {
          throw new Error("The server returned an invalid user list.");
        }
        if (active) setUsers(result.users);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load admin data."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  const runUserAction = async (
    user: AdminUser,
    action: "approve" | "delete"
  ) => {
    if (
      action === "delete" &&
      !window.confirm(`Permanently delete ${user.username || user.email}?`)
    ) {
      return;
    }

    setBusyUserId(user.id);
    setError("");
    setNotice("");
    try {
      await adminRequest(
        `/admin/users/${encodeURIComponent(user.id)}${
          action === "approve" ? "/approve" : ""
        }`,
        { method: action === "approve" ? "PATCH" : "DELETE" }
      );
      await loadUsers();
      setNotice(action === "approve" ? "User approved." : "User deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user.");
    } finally {
      setBusyUserId("");
    }
  };

  const addUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ username: "", email: "", password: "" });
      await loadUsers();
      setNotice("User created and approved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  if (authorized === false) return <Navigate to="/dashboard" replace />;
  if (authorized === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2F2F2] px-4 text-[#111827]">
        <div className="max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center">
          <p role={error ? "alert" : "status"} className="text-sm text-gray-600">
            {error || "Verifying admin access..."}
          </p>
          {error && (
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="mt-4 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white"
            >
              Return to login
            </button>
          )}
        </div>
      </main>
    );
  }

  const pendingCount = users.filter((user) => user.status === "pending").length;

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-4 py-6 text-[#111827] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-white">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin dashboard</h1>
              <p className="text-sm text-gray-500">Manage Paytrack accounts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </header>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {notice}
          </p>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Users size={19} />
                  Users
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {users.length} total · {pendingCount} awaiting approval
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  void loadUsers().catch((err: unknown) =>
                    setError(
                      err instanceof Error ? err.message : "Could not refresh users."
                    )
                  );
                }}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No users found.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs uppercase text-gray-500">
                      <th className="pb-3 pr-4 font-medium">User</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Last login</th>
                      <th className="pb-3 pr-4 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="py-4 pr-4">
                          <p className="font-medium">{user.username}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {user.email}
                          </p>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.status === "approved"
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-gray-600">
                          {formatDate(user.lastLoginAt)}
                        </td>
                        <td className="py-4 pr-4 text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {user.status === "pending" && (
                              <button
                                type="button"
                                disabled={busyUserId === user.id}
                                onClick={() => void runUserAction(user, "approve")}
                                className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                <Check size={14} />
                                Approve
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={
                                busyUserId === user.id ||
                                user.id === currentUserId
                              }
                              onClick={() => void runUserAction(user, "delete")}
                              aria-label={`Delete ${user.username || user.email}`}
                              title={
                                user.id === currentUserId
                                  ? "You cannot delete your own account here."
                                  : "Delete user"
                              }
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <section className="h-fit rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Plus size={19} />
              Add user
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Admin-created accounts are approved immediately.
            </p>
            <form onSubmit={addUser} className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                Username
                <input
                  required
                  autoComplete="off"
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block text-sm font-medium">
                Temporary password
                <input
                  required
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-[#111827] px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create approved user"}
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
