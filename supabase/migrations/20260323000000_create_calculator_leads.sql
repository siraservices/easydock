create table calculator_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  marina_name text,
  email text not null,
  phone text,
  role text,
  region text,
  total_slips integer,
  vacant_slips integer,
  avg_monthly_rate numeric,
  avg_vacancy_months integer,
  annual_loss numeric
);

alter table calculator_leads enable row level security;

-- Public page, no auth required — allow anon inserts
create policy "Anyone can insert calculator leads"
  on calculator_leads for insert
  with check (true);
