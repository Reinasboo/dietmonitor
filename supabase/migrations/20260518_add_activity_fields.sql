-- Add activity-related fields to entries
alter table public.entries
  add column if not exists steps integer null,
  add column if not exists water_sachets integer not null default 0,
  add column if not exists exercised boolean not null default false;

-- No additional indexes required for these small integer/boolean fields
