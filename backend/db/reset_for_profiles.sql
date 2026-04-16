alter table expenses
  add column if not exists profile_id bigint references profiles(id) on delete cascade;

truncate table expenses, profiles restart identity cascade;

alter table expenses
  alter column profile_id set not null;

create index if not exists idx_expenses_profile_id on expenses (profile_id);
