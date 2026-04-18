-- Run this entire file in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Project: hr-adam

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists employees (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  name           text not null,
  phone          text not null unique,
  employee_code  text not null unique,
  base_salary    numeric not null default 2000,
  trip_rate      numeric not null default 8,
  ot_hourly_rate numeric not null default 10,
  standard_hours numeric not null default 8,
  role           text not null check (role in ('driver','admin')),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists attendance (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references employees(id) on delete cascade,
  date           date not null,
  clock_in_at    timestamptz,
  clock_out_at   timestamptz,
  clock_in_lat   numeric,
  clock_in_lng   numeric,
  clock_out_lat  numeric,
  clock_out_lng  numeric,
  unique(employee_id, date)
);

create table if not exists trips (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees(id) on delete cascade,
  date         date not null,
  trip_count   integer not null default 0,
  destination  text,
  notes        text,
  submitted_by text not null check (submitted_by in ('driver','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists allowances (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees(id) on delete cascade,
  date         date not null,
  type         text not null check (type in ('petrol','toll','meal','other')),
  amount       numeric not null,
  description  text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by  uuid references employees(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists payroll_records (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references employees(id) on delete cascade,
  month            text not null,   -- 'YYYY-MM'
  base_salary      numeric not null,
  trip_earnings    numeric not null,
  ot_amount        numeric not null,
  allowances_total numeric not null,
  gross_pay        numeric not null,
  status           text not null default 'draft' check (status in ('draft','finalized')),
  finalized_by     uuid references employees(id),
  finalized_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique(employee_id, month)
);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table employees      enable row level security;
alter table attendance     enable row level security;
alter table trips          enable row level security;
alter table allowances     enable row level security;
alter table payroll_records enable row level security;

-- Helper: current user's role
create or replace function current_employee_role()
returns text language sql security definer stable as $$
  select role from employees where user_id = auth.uid() limit 1;
$$;

-- Helper: current user's employee id
create or replace function current_employee_id()
returns uuid language sql security definer stable as $$
  select id from employees where user_id = auth.uid() limit 1;
$$;

-- employees
drop policy if exists "emp_select" on employees;
drop policy if exists "emp_insert" on employees;
drop policy if exists "emp_update" on employees;
create policy "emp_select" on employees for select using (current_employee_role() = 'admin' or user_id = auth.uid());
create policy "emp_insert" on employees for insert with check (current_employee_role() = 'admin');
create policy "emp_update" on employees for update using (current_employee_role() = 'admin');

-- attendance
drop policy if exists "att_select" on attendance;
drop policy if exists "att_insert" on attendance;
drop policy if exists "att_update" on attendance;
create policy "att_select" on attendance for select using (current_employee_role() = 'admin' or employee_id = current_employee_id());
create policy "att_insert" on attendance for insert with check (employee_id = current_employee_id() or current_employee_role() = 'admin');
create policy "att_update" on attendance for update using (current_employee_role() = 'admin' or employee_id = current_employee_id());

-- trips
drop policy if exists "trip_select" on trips;
drop policy if exists "trip_insert" on trips;
drop policy if exists "trip_update" on trips;
create policy "trip_select" on trips for select using (current_employee_role() = 'admin' or employee_id = current_employee_id());
create policy "trip_insert" on trips for insert with check (employee_id = current_employee_id() or current_employee_role() = 'admin');
create policy "trip_update" on trips for update using (current_employee_role() = 'admin' or employee_id = current_employee_id());

-- allowances
drop policy if exists "allow_select" on allowances;
drop policy if exists "allow_insert" on allowances;
drop policy if exists "allow_update" on allowances;
create policy "allow_select" on allowances for select using (current_employee_role() = 'admin' or employee_id = current_employee_id());
create policy "allow_insert" on allowances for insert with check (employee_id = current_employee_id() or current_employee_role() = 'admin');
create policy "allow_update" on allowances for update using (current_employee_role() = 'admin');

-- payroll_records
drop policy if exists "pay_select" on payroll_records;
drop policy if exists "pay_insert" on payroll_records;
drop policy if exists "pay_update" on payroll_records;
create policy "pay_select" on payroll_records for select using (current_employee_role() = 'admin' or employee_id = current_employee_id());
create policy "pay_insert" on payroll_records for insert with check (current_employee_role() = 'admin');
create policy "pay_update" on payroll_records for update using (current_employee_role() = 'admin');
