import { motion } from "motion/react";
import { useState } from "react";
import {
  Car,
  Gift,
  Heart,
  LoaderCircle,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { createExpense } from "../lib/api";
import { formatCurrency } from "../lib/format";
import type { Profile } from "../lib/types";

interface AddExpenseProps {
  profile: Profile;
  onExpenseCreated: () => Promise<void>;
}

export function AddExpense({ profile, onExpenseCreated }: AddExpenseProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const categories = [
    { id: "Food", name: "Food", icon: UtensilsCrossed, color: "from-rose-500 to-pink-500" },
    { id: "Travel", name: "Travel", icon: Car, color: "from-sky-500 to-blue-500" },
    { id: "Shopping", name: "Shopping", icon: ShoppingBag, color: "from-violet-500 to-fuchsia-500" },
    { id: "Bills", name: "Bills", icon: Zap, color: "from-amber-400 to-orange-500" },
    { id: "Gifts", name: "Gifts", icon: Gift, color: "from-red-400 to-rose-500" },
    { id: "Health", name: "Health", icon: Heart, color: "from-emerald-500 to-teal-500" },
  ];

  const selectedCategoryItem = categories.find((category) => category.id === selectedCategory);
  const amountValue = Number(amount || 0);
  const formattedAmount = formatCurrency(amountValue);

  async function handleAddExpense() {
    if (!title || !amount || !selectedCategory) {
      setMessage("Add a title, amount, and category first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await createExpense({
        profileId: profile.id,
        title,
        amount: amountValue,
        category: selectedCategory,
        note,
      });

      confetti({
        particleCount: 100,
        spread: 72,
        origin: { y: 0.65 },
        colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
      });

      setTitle("");
      setAmount("");
      setNote("");
      setSelectedCategory(null);
      setMessage("Expense saved successfully.");
      await onExpenseCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save expense.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-4 pb-28 pt-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-500">
              Quick add
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Add a new expense
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              Save spending for {profile.full_name} and keep your budget in view.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 shadow-[0_12px_30px_rgba(76,29,149,0.12)]">
            <Wallet className="h-5 w-5 text-fuchsia-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Monthly spending limit</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {formatCurrency(profile.monthly_budget)}
            </p>
          </div>
          <div className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1 text-xs font-medium text-white">
            {profile.email}
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative mt-5 overflow-hidden rounded-[32px] bg-[linear-gradient(140deg,#ffffff_0%,#fdf4ff_35%,#eef4ff_100%)] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.08)]"
      >
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sky-200/45 blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Amount</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {amountValue > 0 ? formattedAmount : "Enter your spend"}
              </h2>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <Sparkles className="h-5 w-5 text-fuchsia-500" />
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-500">Expense title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Coffee, Uber, rent..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
            />
          </label>

          <div className="rounded-[28px] bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <label className="mb-3 block text-sm font-medium text-slate-500">
              How much did you spend?
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <span className="text-2xl font-semibold text-slate-400">{"\u20B9"}</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-4xl font-semibold tracking-tight text-slate-950 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-500">Optional note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a quick note"
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300"
            />
          </label>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Category</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Pick where the money went
            </h3>
          </div>
          {selectedCategoryItem && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              {selectedCategoryItem.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.22 + index * 0.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-[26px] border p-4 text-left shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition-all ${
                  isSelected
                    ? "border-violet-300 bg-white shadow-[0_16px_38px_rgba(139,92,246,0.18)]"
                    : "border-white/70 bg-white/92"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">{category.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {isSelected ? "Selected" : "Tap to choose"}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Preview</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {amountValue > 0 ? formattedAmount : "\u20B90"}
            </p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {selectedCategoryItem?.name ?? "No category"}
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-500">{title || "No title yet"}</p>
        {message && <p className="mt-3 text-sm text-violet-700">{message}</p>}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddExpense}
        disabled={isSaving || !amount || !selectedCategory || !title}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-[28px] px-6 py-5 text-base font-semibold text-white shadow-[0_20px_45px_rgba(76,29,149,0.25)] transition-all ${
          amount && selectedCategory && title
            ? "bg-[linear-gradient(90deg,#6d28d9_0%,#db2777_55%,#2563eb_100%)]"
            : "bg-slate-300 shadow-none"
        }`}
      >
        {isSaving && <LoaderCircle className="h-5 w-5 animate-spin" />}
        Save expense
      </motion.button>
    </div>
  );
}
