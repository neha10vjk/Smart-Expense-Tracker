import { motion } from "motion/react";
import { LoaderCircle } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[30px] border border-white/70 bg-white/92 px-8 py-10 text-center shadow-[0_24px_60px_rgba(76,29,149,0.12)]"
      >
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-violet-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">Loading your profile...</p>
      </motion.div>
    </div>
  );
}
