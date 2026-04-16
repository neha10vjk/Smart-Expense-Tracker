import { motion } from "motion/react";
import {
  Award,
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  Flame,
  Gift,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Settings,
  ShieldCheck,
  Trophy,
  UserPen,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProfile, updateProfile } from "../lib/api";
import { formatCurrency } from "../lib/format";
import type { Profile as ProfileType } from "../lib/types";
import { Switch } from "./ui/switch";

interface ProfileProps {
  profile: ProfileType;
  refreshKey: number;
  onLogout: () => void;
  onProfileRefresh: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = "smart-expense-settings";

type PreferenceState = {
  dailyReminders: boolean;
  spendingAlerts: boolean;
  weeklySummary: boolean;
  appLock: boolean;
  biometricPrompt: boolean;
  soundEffects: boolean;
};

const defaultPreferences: PreferenceState = {
  dailyReminders: true,
  spendingAlerts: true,
  weeklySummary: true,
  appLock: false,
  biometricPrompt: false,
  soundEffects: true,
};

export function Profile({ profile, refreshKey, onLogout, onProfileRefresh }: ProfileProps) {
  const [liveProfile, setLiveProfile] = useState<ProfileType>(profile);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [preferences, setPreferences] = useState<PreferenceState>(defaultPreferences);
  const [selectedSupportKey, setSelectedSupportKey] = useState("help");
  const [editForm, setEditForm] = useState({
    fullName: profile.full_name,
    email: profile.email,
    monthlyBudget: String(profile.monthly_budget),
    savingsGoal: String(profile.savings_goal),
  });
  const profileSettingsRef = useRef<HTMLElement | null>(null);
  const preferencesRef = useRef<HTMLElement | null>(null);

  function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile(profile.id);
        setLiveProfile(data.profile);
        setEditForm({
          fullName: data.profile.full_name,
          email: data.profile.email,
          monthlyBudget: String(data.profile.monthly_budget),
          savingsGoal: String(data.profile.savings_goal),
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadProfile();
  }, [profile.id, refreshKey]);

  useEffect(() => {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const stats = useMemo(
    () => [
      { label: "Current streak", value: `${liveProfile.current_streak} days`, icon: Flame, tone: "bg-orange-50 text-orange-600" },
      { label: "Spending limit", value: formatCurrency(liveProfile.monthly_budget), icon: Trophy, tone: "bg-amber-50 text-amber-600" },
      { label: "Badges earned", value: String(liveProfile.badges_earned), icon: Award, tone: "bg-violet-50 text-violet-600" },
      { label: "Current level", value: liveProfile.level_name, icon: Crown, tone: "bg-sky-50 text-sky-600" },
    ],
    [liveProfile],
  );

  const accountSettings = [
    { title: "Profile settings", description: "Edit your name, email, limit, and target goal below", icon: UserPen, tone: "bg-sky-50 text-sky-600", action: () => scrollToSection(profileSettingsRef) },
    { title: "Notifications", description: "Manage reminders, alerts, and weekly summaries", icon: Bell, tone: "bg-amber-50 text-amber-600", action: () => scrollToSection(preferencesRef) },
    { title: "Privacy and security", description: "Control app lock and biometric prompts on this device", icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-600", action: () => scrollToSection(preferencesRef) },
  ];

  const supportSettings = [
    { key: "preferences", title: "App preferences", description: "Sound effects and behavior preferences are saved locally", icon: Settings, tone: "bg-violet-50 text-violet-600" },
    { key: "help", title: "Help center", description: "Static support section for now, easy to connect later", icon: CircleHelp, tone: "bg-fuchsia-50 text-fuchsia-600" },
    { key: "security", title: "Login and security", description: "Email profile access now, full password auth can come next", icon: LockKeyhole, tone: "bg-rose-50 text-rose-600" },
  ];

  async function handleRefresh() {
    setIsRefreshing(true);
    await onProfileRefresh();
    const data = await fetchProfile(profile.id);
    setLiveProfile(data.profile);
    setEditForm({
      fullName: data.profile.full_name,
      email: data.profile.email,
      monthlyBudget: String(data.profile.monthly_budget),
      savingsGoal: String(data.profile.savings_goal),
    });
    setSettingsMessage("Profile refreshed.");
    setIsRefreshing(false);
  }

  async function handleProfileSave() {
    setIsSavingProfile(true);
    setSettingsMessage("");

    try {
      const data = await updateProfile(profile.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        monthlyBudget: Number(editForm.monthlyBudget),
        savingsGoal: Number(editForm.savingsGoal),
      });

      setLiveProfile((current) => ({ ...current, ...data.profile }));
      setSettingsMessage("Profile settings saved.");
      await onProfileRefresh();
    } catch (error) {
      setSettingsMessage(error instanceof Error ? error.message : "Could not save profile settings.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  function updatePreference(key: keyof PreferenceState, value: boolean) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSettingsMessage("Settings updated on this device.");
  }

  return (
    <div className="min-h-screen bg-transparent px-4 pb-28 pt-6 text-slate-900">
      <motion.section initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#111827_0%,#7c3aed_55%,#ec4899_100%)] px-6 pb-7 pt-6 text-white shadow-[0_32px_70px_rgba(124,58,237,0.25)]">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm">
              {liveProfile.full_name.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 shadow-lg">
              <Crown className="h-5 w-5 text-slate-950" />
            </div>
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.22em] text-white/65">{liveProfile.level_name} account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{liveProfile.full_name}</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{liveProfile.email}</p>

          <div className="mt-5 w-full rounded-[26px] border border-white/12 bg-white/10 p-4 text-left backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Target fund goal</span>
              <span>{formatCurrency(liveProfile.savings_goal)}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((liveProfile.spent_this_month || 0) / Math.max(liveProfile.savings_goal, 1)) * 100, 100)}%` }} transition={{ duration: 0.9, delay: 0.15 }} className="h-full rounded-full bg-[linear-gradient(90deg,#f9a8d4_0%,#fde68a_100%)]" />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6 grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 + index * 0.05 }} className="rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
              <div className={`inline-flex rounded-2xl p-3 ${stat.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-600">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Account overview</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Your personal tracker setup</h3>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-[linear-gradient(145deg,#faf5ff_0%,#fdf2f8_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-950">Spending limit {formatCurrency(liveProfile.monthly_budget)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Spent this month: {formatCurrency(liveProfile.spent_this_month || 0)}</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-violet-700 shadow-sm">{liveProfile.level_name}</div>
          </div>
        </div>
      </motion.section>

      <motion.section ref={profileSettingsRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Profile settings</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Edit personal details</h3>
          </div>
          <button onClick={handleRefresh} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Full name</span>
            <input value={editForm.fullName} onChange={(event) => setEditForm((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
            <input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Monthly spending limit</span>
              <input type="number" value={editForm.monthlyBudget} onChange={(event) => setEditForm((current) => ({ ...current, monthlyBudget: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Target fund goal</span>
              <input type="number" value={editForm.savingsGoal} onChange={(event) => setEditForm((current) => ({ ...current, savingsGoal: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-violet-300" />
            </label>
          </div>

          {settingsMessage && <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">{settingsMessage}</div>}

          <button onClick={handleProfileSave} disabled={isSavingProfile} className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(90deg,#111827_0%,#7c3aed_50%,#ec4899_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(76,29,149,0.22)] disabled:opacity-70">
            {isSavingProfile && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Save profile changes
          </button>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Settings</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Manage your account</h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {accountSettings.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button key={item.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 + index * 0.04 }} whileTap={{ scale: 0.99 }} onClick={item.action} className="flex w-full items-center gap-4 rounded-[24px] bg-slate-50 px-4 py-4 text-left">
                <div className={`rounded-2xl p-3 ${item.tone}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section ref={preferencesRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm font-medium text-slate-500">Notifications and privacy</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Control local app behavior</h3>
        </div>

        <div className="mt-5 space-y-4">
          {[
            { key: "dailyReminders", label: "Daily reminders", description: "Get a gentle reminder to log spending." },
            { key: "spendingAlerts", label: "Spending alerts", description: "Warn when you move close to your limit." },
            { key: "weeklySummary", label: "Weekly summary", description: "Show a quick weekly recap in the app." },
            { key: "appLock", label: "App lock", description: "Require a device lock before opening the app." },
            { key: "biometricPrompt", label: "Biometric prompt", description: "Ask for device biometrics when available." },
            { key: "soundEffects", label: "Sound effects", description: "Play lightweight feedback sounds in-app." },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-100 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
              </div>
              <Switch checked={preferences[item.key as keyof PreferenceState]} onCheckedChange={(checked) => updatePreference(item.key as keyof PreferenceState, checked)} />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="mt-6 rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm font-medium text-slate-500">More options</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Preferences and support</h3>
        </div>

        <div className="mt-5 space-y-3">
          {supportSettings.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button key={item.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.46 + index * 0.04 }} whileTap={{ scale: 0.99 }} onClick={() => setSelectedSupportKey(item.key)} className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${selectedSupportKey === item.key ? "border-violet-200 bg-violet-50/60" : "border-slate-100 bg-white"}`}>
                <div className={`rounded-2xl p-3 ${item.tone}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[24px] bg-slate-50 px-4 py-4">
          {selectedSupportKey === "preferences" && (
            <div>
              <p className="font-medium text-slate-900">App preferences</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Sound effects, reminders, and privacy toggles are saved on this device right now. If you want, we can move them into PostgreSQL next so they sync across devices.
              </p>
            </div>
          )}
          {selectedSupportKey === "help" && (
            <div>
              <p className="font-medium text-slate-900">Help center</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Current flow: create profile, add expenses, then review dashboard and analytics. If something looks stuck, use the Refresh button in Profile to reload your latest account data.
              </p>
            </div>
          )}
          {selectedSupportKey === "security" && (
            <div>
              <p className="font-medium text-slate-900">Login and security</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Right now the app uses simple email-based profile access for MVP speed. A future upgrade can add passwords, OTP login, and full account security.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.button initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.98 }} onClick={onLogout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[28px] bg-[linear-gradient(90deg,#111827_0%,#7c3aed_50%,#ec4899_100%)] px-6 py-5 text-base font-semibold text-white shadow-[0_20px_45px_rgba(76,29,149,0.24)]">
        <LogOut className="h-5 w-5" />
        Log out
      </motion.button>
    </div>
  );
}
