import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, ChartNoAxesCombined, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAnalyticsSummary } from "../lib/api";
import { formatCurrency } from "../lib/format";
import type { Profile } from "../lib/types";

interface AnalyticsProps {
  profile: Profile;
  refreshKey: number;
}

const chartColors = ["#ec4899", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export function Analytics({ profile, refreshKey }: AnalyticsProps) {
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; amount: number }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await fetchAnalyticsSummary(profile.id);
        setCategoryData(data.categoryData);
        setMonthlyData(data.monthlyData);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load analytics.");
      }
    }

    loadAnalytics();
  }, [profile.id, refreshKey]);

  const pieData = useMemo(
    () => categoryData.map((item, index) => ({ ...item, color: chartColors[index % chartColors.length] })),
    [categoryData],
  );
  const totalSpent = pieData.reduce((sum, item) => sum + item.value, 0);
  const averageMonthly = monthlyData.length > 0 ? totalSpent / monthlyData.length : 0;
  const highestMonth = monthlyData.length > 0 ? Math.max(...monthlyData.map((item) => item.amount)) : 0;

  return (
    <div className="min-h-screen bg-transparent px-4 pb-28 pt-6 text-slate-900">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-500">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Spending insights</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Real category and monthly trends for {profile.full_name}.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 shadow-[0_12px_30px_rgba(37,99,235,0.12)]">
          <ChartNoAxesCombined className="h-5 w-5 text-sky-600" />
        </div>
      </motion.div>

      {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="rounded-[32px] bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_48%,#38bdf8_100%)] p-6 text-white shadow-[0_30px_60px_rgba(37,99,235,0.24)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70">Total spent</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">{formatCurrency(totalSpent)}</h2>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/85">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              {monthlyData.length > 0 ? `${monthlyData.length} month(s) tracked` : "No expenses yet"}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <Calendar className="h-5 w-5 text-white/85" />
          </div>
        </div>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Category split</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Where the money is going</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {pieData.length} categories
          </span>
        </div>

        {pieData.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            Add a few expenses to generate analytics.
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <div className="mx-auto h-[250px] w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={62} outerRadius={100} paddingAngle={4} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "white", border: "1px solid rgba(226, 232, 240, 1)", borderRadius: "16px", boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {pieData.map((category, index) => {
                const percentage = ((category.value / totalSpent) * 100).toFixed(1);
                return (
                  <motion.div key={category.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + index * 0.05 }} className="rounded-[24px] bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium text-slate-800">{category.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">{percentage}%</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{formatCurrency(category.value)}</span>
                      <span>Tracked total</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Monthly trend</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Monthly spend pattern</h3>
          </div>
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>

        {monthlyData.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            No monthly data yet. Save expenses to start building trends.
          </div>
        ) : (
          <>
            <div className="mt-6 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="barColorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "white", border: "1px solid rgba(226, 232, 240, 1)", borderRadius: "16px", boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)" }} cursor={{ fill: "rgba(37, 99, 235, 0.06)" }} />
                  <Bar dataKey="amount" fill="url(#barColorGradient)" radius={[14, 14, 0, 0]}>
                    {monthlyData.map((entry) => (
                      <Cell key={entry.month} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[24px] bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Average monthly</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{formatCurrency(averageMonthly)}</p>
              </div>
              <div className="rounded-[24px] bg-sky-50 p-4">
                <p className="text-sm text-sky-700">Highest month</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{formatCurrency(highestMonth)}</p>
              </div>
            </div>
          </>
        )}
      </motion.section>
    </div>
  );
}
