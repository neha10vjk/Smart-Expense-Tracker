import { motion } from "motion/react";
import { Home, PlusCircle, PieChart, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "add", icon: PlusCircle, label: "Add" },
    { id: "analytics", icon: PieChart, label: "Analytics" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: "var(--safe-area-bottom)",
        paddingLeft: "var(--safe-area-left)",
        paddingRight: "var(--safe-area-right)",
      }}
    >
      <div className="mx-auto max-w-md px-4 pb-3 pt-2">
        <div className="flex items-center justify-around rounded-[28px] border border-white/60 bg-white/88 px-3 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 1,
                  y: isActive ? -2 : 0,
                }}
                className="relative"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-violet-700" : "text-slate-400"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-100"
                  />
                )}
              </motion.div>
              <span
                className={`text-xs ${
                  isActive ? "text-violet-700" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
        </div>
      </div>
    </motion.div>
  );
}
