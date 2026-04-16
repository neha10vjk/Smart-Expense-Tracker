import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Coins,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { fetchDashboardSummary } from "../lib/api";
import { formatCurrency } from "../lib/format";
import type { Profile } from "../lib/types";

interface DashboardProps {
  profile: Profile;
  refreshKey: number;
}

const categoryColors: Record<string, string> = {
  Food: "from-rose-400 to-pink-500",
  Travel: "from-sky-400 to-blue-500",
  Shopping: "from-violet-400 to-fuchsia-500",
  Bills: "from-amber-400 to-orange-500",
  Health: "from-emerald-400 to-teal-500",
  Gifts: "from-red-400 to-rose-500",
};

export function Dashboard({ profile, refreshKey }: DashboardProps) {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await fetchDashboardSummary(profile.id);
        setSummary(data.summary);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load dashboard.");
      }
    }

    loadSummary();
  }, [profile.id, refreshKey]);

  const effectiveProfile = summary?.profile ?? profile;
  const remainingBudget = summary?.remainingBudget ?? effectiveProfile.monthly_budget;
  const spentToday = summary?.spentToday ?? 0;
  const spentThisMonth = summary?.spentThisMonth ?? 0;
  const goalProgress = summary?.goalProgress ?? 0;
  const recentExpenses = summary?.recentExpenses ?? [];
  const highlights = [
    {
      label: "Saved from budget",
      value: formatCurrency(Math.max(effectiveProfile.monthly_budget - spentThisMonth, 0)),
      icon: TrendingUp,
      tone: "from-emerald-100 to-teal-50 text-emerald-700",
    },
    {
      label: "Daily streak",
      value: `${effectiveProfile.current_streak} days`,
      icon: Sparkles,
      tone: "from-amber-100 to-orange-50 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent px-4 pb-28 pt-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-500">
            Smart money
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back, {effectiveProfile.full_name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            {recentExpenses.length > 0
              ? "Your latest activity is live from your own account data."
              : "You have a clean slate. Add your first expense to start tracking."}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-[0_12px_30px_rgba(76,29,149,0.12)]">
          <WalletCards className="h-5 w-5 text-violet-600" />
        </div>
      </motion.div>

      {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#2e1065_0%,#7c3aed_36%,#ec4899_100%)] p-6 text-white shadow-[0_30px_60px_rgba(124,58,237,0.35)]"
      >
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-8 h-24 w-24 rounded-full bg-fuchsia-200/15 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-sm text-white/75">
            <span>Spending limit left</span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
              {effectiveProfile.level_name}
            </span>
          </div>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            {formatCurrency(remainingBudget)}
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                This month
              </p>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">{formatCurrency(spentThisMonth)} spent</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Target progress
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-sky-200" />
                <span className="text-sm font-medium">{Math.round(goalProgress)}% of target</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-5 grid grid-cols-2 gap-3"
      >
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Today spent</p>
            <div className="rounded-2xl bg-rose-50 p-2 text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(spentToday)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Based on today&apos;s saved expenses.</p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Target fund goal</p>
            <div className="rounded-2xl bg-violet-50 p-2 text-violet-500">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(effectiveProfile.savings_goal)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Your personal target from profile setup.</p>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-6 rounded-[30px] border border-white/65 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Level journey</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Progress to the next tier
            </h3>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            {effectiveProfile.level_name}
          </span>
        </div>

        <div className="mt-6 rounded-[26px] bg-slate-50/90 p-4">
          <div className="flex items-start justify-between gap-1">
            {(effectiveProfile.level_path ?? []).map((level, index, levels) => (
              <div key={level.level} className="flex flex-1 items-start">
                <div className="flex w-full flex-col items-center text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold ${
                      level.reached
                        ? "border-violet-200 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    } ${level.current ? "ring-4 ring-violet-100" : ""}`}
                  >
                    {level.level}
                  </div>
                  <p className={`mt-2 text-[11px] font-medium leading-4 ${level.current ? "text-violet-700" : "text-slate-500"}`}>
                    {level.label}
                  </p>
                </div>

                {index < levels.length - 1 && (
                  <div className="mx-2 mt-5 h-[2px] flex-1 rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${level.reached ? "bg-violet-500" : "bg-slate-200"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-100 bg-white px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Current tier</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {effectiveProfile.level_name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {recentExpenses.length > 0
                  ? "Your target progress is based on how much spending limit is still left."
                  : "Your first saved expense will start building your monthly picture."}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {Math.round(goalProgress)}%
            </div>
          </div>

          <div className="mb-2 mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Target progress</span>
            <span>{formatCurrency(Math.max(effectiveProfile.savings_goal - remainingBudget, 0))} toward target</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#06b6d4_100%)]"
            />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mt-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Recent activity</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Latest expenses from your profile
            </h3>
          </div>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-5 py-10 text-center text-sm text-slate-500">
            No expenses yet. Create your first expense from the Add tab.
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense: any, index: number) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                className="flex items-center gap-4 rounded-[28px] border border-white/65 bg-white/90 p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryColors[expense.category] || "from-slate-400 to-slate-500"}`}>
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{expense.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {expense.category} · {new Date(expense.spent_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-base font-semibold text-slate-900">
                  -{formatCurrency(expense.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 grid grid-cols-2 gap-3">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className={`rounded-[28px] bg-gradient-to-br p-5 shadow-[0_16px_35px_rgba(15,23,42,0.05)] ${item.tone}`}>
              <Icon className="h-5 w-5" />
              <p className="mt-4 text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

