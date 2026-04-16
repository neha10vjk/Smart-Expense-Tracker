export interface Profile {
  id: number;
  full_name: string;
  email: string;
  monthly_budget: number;
  savings_goal: number;
  level_name: string;
  current_streak: number;
  badges_earned: number;
  total_spent?: number;
  spent_this_month?: number;
  level_path?: Array<{
    level: number;
    label: string;
    reached: boolean;
    current: boolean;
  }>;
}

export interface Expense {
  id: number;
  profile_id: number;
  title: string;
  amount: number;
  category: string;
  note?: string | null;
  spent_at: string;
  created_at?: string;
}
