-- ============================================================
-- UNGDOMSBEDRIFT – Supabase databaseskjema (fikset rekkefølge)
-- Kjør denne SQL-en i Supabase SQL Editor
-- ============================================================

-- 1. Bedrifter (må opprettes FØR profiles siden profiles refererer til den)
create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  school      text not null,
  created_by  uuid,
  created_at  timestamptz default now()
);

-- 2. Brukerprofiler (kobles til Supabase Auth)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null check (role in ('student', 'teacher')),
  school      text not null,
  company_id  uuid references companies(id) on delete set null,
  created_at  timestamptz default now()
);

-- 3. Legg til created_by-referansen på companies nå som profiles finnes
alter table companies
  add constraint companies_created_by_fkey
  foreign key (created_by) references profiles(id) on delete set null;

-- 4. Bedriftsmedlemmer
create table if not exists company_members (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        text not null default 'Annet',
  unique(company_id, user_id)
);

-- 5. Oppgaver
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  phase         text not null,
  text          text not null,
  info          text,
  link          text,
  is_submission boolean default false,
  done          boolean default false,
  done_by       text,
  approved_by   text,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- 6. Oppgavetilordninger
create table if not exists task_assignments (
  task_id  uuid not null references tasks(id) on delete cascade,
  user_id  uuid not null references profiles(id) on delete cascade,
  primary key (task_id, user_id)
);

-- 7. CRM-kontakter
create table if not exists crm_contacts (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  name         text not null,
  type         text not null default 'Privatperson',
  email        text,
  phone        text,
  status       text not null default 'lead',
  note         text,
  assigned_to  uuid references profiles(id) on delete set null,
  created_at   timestamptz default now()
);

-- ── Row Level Security ──────────────────────────────────────

alter table profiles         enable row level security;
alter table companies        enable row level security;
alter table company_members  enable row level security;
alter table tasks            enable row level security;
alter table task_assignments enable row level security;
alter table crm_contacts     enable row level security;

-- Profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Companies
create policy "companies_select" on companies for select using (auth.role() = 'authenticated');
create policy "companies_insert" on companies for insert with check (auth.role() = 'authenticated');
create policy "companies_update" on companies for update using (created_by = auth.uid());

-- Company members
create policy "members_select" on company_members for select using (auth.role() = 'authenticated');
create policy "members_insert" on company_members for insert with check (auth.role() = 'authenticated');
create policy "members_delete" on company_members for delete using (user_id = auth.uid());

-- Tasks
create policy "tasks_select" on tasks for select using (
  exists (select 1 from company_members where company_id = tasks.company_id and user_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "tasks_insert" on tasks for insert with check (
  exists (select 1 from company_members where company_id = tasks.company_id and user_id = auth.uid())
);
create policy "tasks_update" on tasks for update using (
  exists (select 1 from company_members where company_id = tasks.company_id and user_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "tasks_delete" on tasks for delete using (
  exists (select 1 from company_members where company_id = tasks.company_id and user_id = auth.uid())
);

-- Task assignments
create policy "assignments_select" on task_assignments for select using (auth.role() = 'authenticated');
create policy "assignments_insert" on task_assignments for insert with check (auth.role() = 'authenticated');
create policy "assignments_delete" on task_assignments for delete using (auth.role() = 'authenticated');

-- CRM
create policy "crm_select" on crm_contacts for select using (
  exists (select 1 from company_members where company_id = crm_contacts.company_id and user_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);
create policy "crm_insert" on crm_contacts for insert with check (
  exists (select 1 from company_members where company_id = crm_contacts.company_id and user_id = auth.uid())
);
create policy "crm_update" on crm_contacts for update using (
  exists (select 1 from company_members where company_id = crm_contacts.company_id and user_id = auth.uid())
);
create policy "crm_delete" on crm_contacts for delete using (
  exists (select 1 from company_members where company_id = crm_contacts.company_id and user_id = auth.uid())
);

-- ── Realtime ────────────────────────────────────────────────
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table task_assignments;
alter publication supabase_realtime add table crm_contacts;
