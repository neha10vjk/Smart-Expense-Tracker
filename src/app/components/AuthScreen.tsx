import { motion } from "motion/react";
import { LoaderCircle, LogIn, UserRoundPlus, WalletCards } from "lucide-react";
import { useState } from "react";

interface AuthScreenProps {
  onLogin: (email: string) => Promise<void>;
  onCreateProfile: (payload: {
    fullName: string;
    email: string;
    monthlyBudget: number;
    savingsGoal: number;
  }) => Promise<void>;
}

export function AuthScreen({ onLogin, onCreateProfile }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "create">("login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("25000");
  const [savingsGoal, setSavingsGoal] = useState("50000");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await onLogin(email);
      } else {
        await onCreateProfile({
          fullName,
          email,
          monthlyBudget: Number(monthlyBudget),
          savingsGoal: Number(savingsGoal),
        });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[36px] border border-white/70 bg-white/92 p-6 shadow-[0_30px_80px_rgba(76,29,149,0.14)]"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#6d28d9_0%,#db2777_100%)] shadow-[0_20px_50px_rgba(109,40,217,0.25)]">
          <WalletCards className="h-7 w-7 text-white" />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-500">
            Smart Expense Tracker
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {mode === "login" ? "Welcome back" : "Create your profile"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "Log in with your email to continue with your personal expense data."
              : "Start with a clean account and save expenses under your own profile."}
          </p>
        </div>

        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
              mode === "login" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("create")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${
              mode === "create" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
            }`}
          >
            Create profile
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {mode === "create" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Neha Sharma"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
            />
          </label>

          {mode === "create" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Monthly spending limit</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(event) => setMonthlyBudget(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Target fund goal</span>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(event) => setSavingsGoal(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
                />
              </label>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[26px] bg-[linear-gradient(90deg,#111827_0%,#7c3aed_50%,#ec4899_100%)] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_45px_rgba(76,29,149,0.22)] disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : mode === "login" ? (
            <LogIn className="h-5 w-5" />
          ) : (
            <UserRoundPlus className="h-5 w-5" />
          )}
          {mode === "login" ? "Continue" : "Create profile"}
        </button>
      </motion.div>
    </div>
  );
}
