import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { query } from "./db.js";

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/+$/, "");
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.has(normalizedOrigin);

    return callback(isAllowed ? null : new Error(`Origin not allowed by CORS: ${origin}`), isAllowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

function parseProfileId(value) {
  const profileId = Number(value);
  return Number.isInteger(profileId) && profileId > 0 ? profileId : null;
}

function buildLevelPath(levelName) {
  const levels = ["Starter", "Spender", "Saver", "Master", "Legend"];
  const currentIndex = Math.max(levels.indexOf(levelName), 0);

  return levels.map((label, index) => ({
    level: index + 1,
    label,
    reached: index <= currentIndex,
    current: index === currentIndex,
  }));
}

app.get("/api/health", async (_req, res) => {
  try {
    await query("select 1");
    res.json({ ok: true, message: "API and database are reachable." });
  } catch (error) {
    console.error("Health check failed", error);
    res.status(500).json({ ok: false, message: "Database connection failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const result = await query(
      `
        select
          id,
          full_name,
          email,
          monthly_budget,
          savings_goal,
          level_name,
          current_streak,
          badges_earned,
          created_at
        from profiles
        where lower(email) = $1
        limit 1
      `,
      [email],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Failed to log in", error);
    res.status(500).json({ message: "Could not log in." });
  }
});

app.post("/api/profiles", async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const monthlyBudget = Number(req.body.monthlyBudget || 25000);
  const savingsGoal = Number(req.body.savingsGoal || 50000);

  if (!fullName || !email) {
    return res.status(400).json({ message: "Full name and email are required." });
  }

  try {
    const result = await query(
      `
        insert into profiles (full_name, email, monthly_budget, savings_goal)
        values ($1, $2, $3, $4)
        returning
          id,
          full_name,
          email,
          monthly_budget,
          savings_goal,
          level_name,
          current_streak,
          badges_earned,
          created_at
      `,
      [fullName, email, monthlyBudget, savingsGoal],
    );

    res.status(201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Failed to create profile", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "A profile with this email already exists." });
    }

    res.status(500).json({ message: "Could not create profile." });
  }
});

app.get("/api/profile/:profileId", async (req, res) => {
  const profileId = parseProfileId(req.params.profileId);

  if (!profileId) {
    return res.status(400).json({ message: "Valid profileId is required." });
  }

  try {
    const [profileResult, totalsResult] = await Promise.all([
      query(
        `
          select
            id,
            full_name,
            email,
            monthly_budget,
            savings_goal,
            level_name,
            current_streak,
            badges_earned,
            created_at
          from profiles
          where id = $1
          limit 1
        `,
        [profileId],
      ),
      query(
        `
          select
            coalesce(sum(amount), 0) as total_spent,
            coalesce(sum(case when date_trunc('month', spent_at) = date_trunc('month', now()) then amount end), 0) as spent_this_month
          from expenses
          where profile_id = $1
        `,
        [profileId],
      ),
    ]);

    const profile = profileResult.rows[0];
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const totals = totalsResult.rows[0];
    res.json({
      profile: {
        ...profile,
        total_spent: Number(totals.total_spent),
        spent_this_month: Number(totals.spent_this_month),
        level_path: buildLevelPath(profile.level_name),
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile", error);
    res.status(500).json({ message: "Could not fetch profile." });
  }
});

app.put("/api/profile/:profileId", async (req, res) => {
  const profileId = parseProfileId(req.params.profileId);

  if (!profileId) {
    return res.status(400).json({ message: "Valid profileId is required." });
  }

  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const monthlyBudget = Number(req.body.monthlyBudget);
  const savingsGoal = Number(req.body.savingsGoal);

  if (!fullName || !email || !Number.isFinite(monthlyBudget) || !Number.isFinite(savingsGoal)) {
    return res.status(400).json({
      message: "fullName, email, monthlyBudget, and savingsGoal are required.",
    });
  }

  try {
    const result = await query(
      `
        update profiles
        set
          full_name = $2,
          email = $3,
          monthly_budget = $4,
          savings_goal = $5
        where id = $1
        returning
          id,
          full_name,
          email,
          monthly_budget,
          savings_goal,
          level_name,
          current_streak,
          badges_earned,
          created_at
      `,
      [profileId, fullName, email, monthlyBudget, savingsGoal],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error("Failed to update profile", error);

    if (error.code === "23505") {
      return res.status(409).json({ message: "That email is already in use." });
    }

    res.status(500).json({ message: "Could not update profile." });
  }
});

app.get("/api/expenses", async (req, res) => {
  const profileId = parseProfileId(req.query.profileId);
  const limit = Number(req.query.limit || 20);

  if (!profileId) {
    return res.status(400).json({ message: "Valid profileId is required." });
  }

  try {
    const result = await query(
      `
        select
          id,
          profile_id,
          title,
          amount,
          category,
          note,
          spent_at,
          created_at
        from expenses
        where profile_id = $1
        order by spent_at desc, created_at desc
        limit $2
      `,
      [profileId, limit],
    );

    res.json({ expenses: result.rows.map((row) => ({ ...row, amount: Number(row.amount) })) });
  } catch (error) {
    console.error("Failed to fetch expenses", error);
    res.status(500).json({ message: "Could not fetch expenses." });
  }
});

app.post("/api/expenses", async (req, res) => {
  const { profileId: rawProfileId, title, amount, category, note, spentAt } = req.body;
  const profileId = parseProfileId(rawProfileId);

  if (!profileId || !title || !amount || !category) {
    return res.status(400).json({
      message: "profileId, title, amount, and category are required.",
    });
  }

  try {
    const result = await query(
      `
        insert into expenses (profile_id, title, amount, category, note, spent_at)
        values ($1, $2, $3, $4, $5, coalesce($6, now()))
        returning id, profile_id, title, amount, category, note, spent_at, created_at
      `,
      [profileId, title, amount, category, note ?? null, spentAt ?? null],
    );

    res.status(201).json({
      expense: {
        ...result.rows[0],
        amount: Number(result.rows[0].amount),
      },
    });
  } catch (error) {
    console.error("Failed to create expense", error);
    res.status(500).json({ message: "Could not create expense." });
  }
});

app.get("/api/dashboard/summary", async (req, res) => {
  const profileId = parseProfileId(req.query.profileId);

  if (!profileId) {
    return res.status(400).json({ message: "Valid profileId is required." });
  }

  try {
    const [profileResult, totalsResult, recentResult, categoryResult] = await Promise.all([
      query(
        `
          select id, full_name, monthly_budget, savings_goal, level_name, current_streak, badges_earned
          from profiles
          where id = $1
          limit 1
        `,
        [profileId],
      ),
      query(
        `
          select
            coalesce(sum(amount), 0) as total_spent,
            coalesce(sum(case when spent_at::date = current_date then amount end), 0) as spent_today,
            coalesce(sum(case when date_trunc('month', spent_at) = date_trunc('month', now()) then amount end), 0) as spent_this_month
          from expenses
          where profile_id = $1
        `,
        [profileId],
      ),
      query(
        `
          select id, title, amount, category, note, spent_at
          from expenses
          where profile_id = $1
          order by spent_at desc, created_at desc
          limit 5
        `,
        [profileId],
      ),
      query(
        `
          select category, coalesce(sum(amount), 0) as total
          from expenses
          where profile_id = $1
          group by category
          order by total desc
        `,
        [profileId],
      ),
    ]);

    const profile = profileResult.rows[0];
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const totals = totalsResult.rows[0];
    const monthlyBudget = Number(profile.monthly_budget);
    const spentThisMonth = Number(totals.spent_this_month);
    const savingsGoal = Number(profile.savings_goal);
    const remainingBudget = Math.max(monthlyBudget - spentThisMonth, 0);
    const goalProgress = savingsGoal > 0 ? Math.min((remainingBudget / savingsGoal) * 100, 100) : 0;

    res.json({
      summary: {
        profile: {
          ...profile,
          monthly_budget: monthlyBudget,
          savings_goal: savingsGoal,
          level_path: buildLevelPath(profile.level_name),
        },
        totalSpent: Number(totals.total_spent),
        spentToday: Number(totals.spent_today),
        spentThisMonth,
        remainingBudget,
        goalProgress,
        recentExpenses: recentResult.rows.map((row) => ({ ...row, amount: Number(row.amount) })),
        categoryTotals: categoryResult.rows.map((row) => ({
          category: row.category,
          total: Number(row.total),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard summary", error);
    res.status(500).json({ message: "Could not fetch dashboard summary." });
  }
});

app.get("/api/analytics/summary", async (req, res) => {
  const profileId = parseProfileId(req.query.profileId);

  if (!profileId) {
    return res.status(400).json({ message: "Valid profileId is required." });
  }

  try {
    const [categoryResult, monthlyResult] = await Promise.all([
      query(
        `
          select category as name, coalesce(sum(amount), 0) as value
          from expenses
          where profile_id = $1
          group by category
          order by value desc
        `,
        [profileId],
      ),
      query(
        `
          select
            to_char(date_trunc('month', spent_at), 'Mon') as month,
            coalesce(sum(amount), 0) as amount
          from expenses
          where profile_id = $1
          group by date_trunc('month', spent_at)
          order by date_trunc('month', spent_at)
        `,
        [profileId],
      ),
    ]);

    res.json({
      categoryData: categoryResult.rows.map((row) => ({
        name: row.name,
        value: Number(row.value),
      })),
      monthlyData: monthlyResult.rows.map((row) => ({
        month: row.month,
        amount: Number(row.amount),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch analytics summary", error);
    res.status(500).json({ message: "Could not fetch analytics summary." });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend API running on http://localhost:${config.port}`);
  });
}

export default app;
