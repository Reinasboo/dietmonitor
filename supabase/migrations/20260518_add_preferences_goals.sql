alter table public.user_preferences
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists reminder_time text null,
  add column if not exists weekly_steps_goal_days integer not null default 4,
  add column if not exists weekly_hydration_goal_days integer not null default 4,
  add column if not exists weekly_exercise_goal_days integer not null default 3,
  add column if not exists weekly_entry_goal_days integer not null default 5;
