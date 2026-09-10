"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { login_admin_action } from "@/app/actions/admin/auth.actions";

export function AuthScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    try {
      setIsLoading(true);

      await login_admin_action({
        username,
        password,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-white/20 bg-white text-xl font-black text-black">
              ◒
            </span>

            <div>
              <p className="font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
                Blue Crescent
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Admin console
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="border border-white/15 bg-white p-6 text-black shadow-[12px_12px_0_rgb(255_255_255/0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                Private workspace
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-black">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-black/55">
                Sign in to manage bookings, services, and availability.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Username */}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/65">
                  Username
                </span>

                <span className="flex h-11 items-center gap-3 border border-black/20 bg-black/[0.03] px-3 transition focus-within:border-black focus-within:bg-white">
                  <UserRound
                    aria-hidden="true"
                    className="size-4 shrink-0 text-black/45"
                  />

                  <input
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter username"
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/35 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </span>
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/65">
                  Password
                </span>

                <span className="flex h-11 items-center gap-3 border border-black/20 bg-black/[0.03] px-3 transition focus-within:border-black focus-within:bg-white">
                  <LockKeyhole
                    aria-hidden="true"
                    className="size-4 shrink-0 text-black/45"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    disabled={isLoading}
                    className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/35 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-black/45 transition hover:text-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-4 shrink-0" />
                    ) : (
                      <Eye aria-hidden="true" className="size-4 shrink-0" />
                    )}
                  </button>
                </span>
              </label>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="border border-black/15 bg-black/[0.04] px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-black">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 border border-black bg-black text-sm font-semibold text-white transition hover:bg-black/80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Logging in..." : "Log in"}

                {!isLoading && <ArrowRight className="size-4" />}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-white/35">
            Admin access only
          </p>
        </section>
      </div>
    </main>
  );
}
