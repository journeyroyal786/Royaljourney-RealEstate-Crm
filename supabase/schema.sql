-- ROYAL JOURNEY CRM schema
-- Run this file in Supabase SQL Editor using a project owner account.
create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin','marketing','sales','operations','finance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new','contacted','qualified','unqualified','viewing','negotiation','won','lost');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'sales',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  email text,
  property_interest text,
  source text not null default 'Other',
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  next_follow_up date,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  activity_type text not null check (activity_type in ('call','email','whatsapp','meeting','note','status')),
  body text not null check (char_length(body) between 2 and 3000),
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  contract_type text not null check (contract_type in ('sale','rental')),
  reference text not null unique,
  status text not null default 'draft' check (status in ('draft','sent','signed','cancelled')),
  document_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.finance_records (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  record_type text not null check (record_type in ('payment','invoice','commission')),
  description text not null check (char_length(description) between 2 and 500),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'AED' check (currency in ('AED')),
  status text not null default 'pending' check (status in ('pending','received','paid','cancelled')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists leads_follow_up_idx on public.leads(next_follow_up);
create index if not exists lead_activities_lead_idx on public.lead_activities(lead_id, created_at desc);
create index if not exists contracts_lead_idx on public.contracts(lead_id);
create index if not exists finance_records_lead_idx on public.finance_records(lead_id);

create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true $$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and active = true) $$;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.contracts enable row level security;
alter table public.finance_records enable row level security;

drop policy if exists "profiles read active team" on public.profiles;
create policy "profiles read active team" on public.profiles for select to authenticated using (public.is_active_user());
drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles" on public.profiles for update to authenticated using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

drop policy if exists "active users read leads" on public.leads;
create policy "active users read leads" on public.leads for select to authenticated using (public.is_active_user());
drop policy if exists "marketing sales admin create leads" on public.leads;
create policy "marketing sales admin create leads" on public.leads for insert to authenticated with check (public.current_app_role() in ('admin','marketing','sales') and created_by = auth.uid());
drop policy if exists "marketing sales admin update leads" on public.leads;
create policy "marketing sales admin update leads" on public.leads for update to authenticated using (public.current_app_role() in ('admin','marketing','sales')) with check (public.current_app_role() in ('admin','marketing','sales'));

drop policy if exists "active users read activities" on public.lead_activities;
create policy "active users read activities" on public.lead_activities for select to authenticated using (public.is_active_user());
drop policy if exists "permitted users add activities" on public.lead_activities;
create policy "permitted users add activities" on public.lead_activities for insert to authenticated with check (public.current_app_role() in ('admin','sales','marketing','operations') and user_id = auth.uid());

drop policy if exists "active users read contracts" on public.contracts;
create policy "active users read contracts" on public.contracts for select to authenticated using (public.is_active_user());
drop policy if exists "operations create contracts" on public.contracts;
create policy "operations create contracts" on public.contracts for insert to authenticated with check (public.current_app_role() in ('admin','operations') and created_by = auth.uid());
drop policy if exists "operations update contracts" on public.contracts;
create policy "operations update contracts" on public.contracts for update to authenticated using (public.current_app_role() in ('admin','operations')) with check (public.current_app_role() in ('admin','operations'));

drop policy if exists "finance read records" on public.finance_records;
create policy "finance read records" on public.finance_records for select to authenticated using (public.current_app_role() in ('admin','finance'));
drop policy if exists "finance create records" on public.finance_records;
create policy "finance create records" on public.finance_records for insert to authenticated with check (public.current_app_role() in ('admin','finance') and created_by = auth.uid());
drop policy if exists "finance update records" on public.finance_records;
create policy "finance update records" on public.finance_records for update to authenticated using (public.current_app_role() in ('admin','finance')) with check (public.current_app_role() in ('admin','finance'));


-- Explicit table privileges for authenticated application users.
-- Row Level Security policies above remain responsible for row-level authorization.
grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.leads to authenticated;
grant select, insert on public.lead_activities to authenticated;
grant select, insert, update on public.contracts to authenticated;
grant select, insert, update on public.finance_records to authenticated;

-- Bootstrap instructions:
-- 1. Create the first user in Supabase Authentication.
-- 2. Copy that user's UUID from Authentication > Users.
-- 3. Run the following statement with the real UUID and details:
-- insert into public.profiles (id, full_name, role) values ('AUTH_USER_UUID', 'CRM Administrator', 'admin');
