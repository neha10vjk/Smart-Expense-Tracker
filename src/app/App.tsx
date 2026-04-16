import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { AddExpense } from "./components/AddExpense";
import { Analytics } from "./components/Analytics";
import { Profile as ProfileScreen } from "./components/Profile";
import { BottomNav } from "./components/BottomNav";
import { AuthScreen } from "./components/AuthScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { createProfile, fetchProfile, loginProfile } from "./lib/api";
import type { Profile } from "./lib/types";

const STORAGE_KEY = "smart-expense-profile-id";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function bootstrapProfile() {
      const savedProfileId = window.localStorage.getItem(STORAGE_KEY);

      if (!savedProfileId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchProfile(Number(savedProfileId));
        setProfile(data.profile);
      } catch (error) {
        console.error(error);
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapProfile();
  }, []);

  async function handleLogin(email: string) {
    const data = await loginProfile(email);
    setProfile(data.profile);
    window.localStorage.setItem(STORAGE_KEY, String(data.profile.id));
  }

  async function handleCreateProfile(payload: {
    fullName: string;
    email: string;
    monthlyBudget: number;
    savingsGoal: number;
  }) {
    const data = await createProfile(payload);
    setProfile(data.profile);
    window.localStorage.setItem(STORAGE_KEY, String(data.profile.id));
  }

  function handleLogout() {
    setProfile(null);
    setActiveTab("dashboard");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function refreshProfileData() {
    if (!profile) {
      return;
    }

    const data = await fetchProfile(profile.id);
    setProfile(data.profile);
    setRefreshKey((current) => current + 1);
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f7f1ff_45%,_#eef4ff_100%)]">
        <AuthScreen onLogin={handleLogin} onCreateProfile={handleCreateProfile} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard profile={profile} refreshKey={refreshKey} />;
      case "add":
        return <AddExpense profile={profile} onExpenseCreated={refreshProfileData} />;
      case "analytics":
        return <Analytics profile={profile} refreshKey={refreshKey} />;
      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            refreshKey={refreshKey}
            onLogout={handleLogout}
            onProfileRefresh={refreshProfileData}
          />
        );
      default:
        return <Dashboard profile={profile} refreshKey={refreshKey} />;
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f7f1ff_45%,_#eef4ff_100%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white/75 shadow-[0_24px_80px_rgba(76,29,149,0.12)] backdrop-blur-sm">
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: "var(--safe-area-top)",
            paddingLeft: "var(--safe-area-left)",
            paddingRight: "var(--safe-area-right)",
          }}
        >
          {renderScreen()}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
