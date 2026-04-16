create table if not exists profiles (
  id bigserial primary key,
  full_name text not null,
  email text unique not null,
  monthly_budget numeric(12, 2) not null default 25000,
  savings_goal numeric(12, 2) not null default 50000,
  level_name text not null default 'Saver',
  current_streak integer not null default 0,
  badges_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id bigserial primary key,
  profile_id bigint not null references profiles(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  note text,
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_profile_id on expenses (profile_id);
create index if not exists idx_expenses_spent_at on expenses (spent_at desc);
create index if not exists idx_expenses_category on expenses (category);
