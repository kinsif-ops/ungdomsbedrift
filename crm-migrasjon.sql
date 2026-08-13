-- ============================================================
-- UNGDOMSBEDRIFT – CRM-utvidelse
-- Kjør denne i Supabase SQL Editor. Trygg å kjøre flere ganger.
-- ============================================================

-- 1. Nye kolonner på crm_contacts
alter table crm_contacts
  add column if not exists value_nok     integer,      -- forventet verdi i kroner
  add column if not exists next_followup date,         -- når skal kontakten følges opp
  add column if not exists last_contact  timestamptz,  -- settes automatisk ved statusendring
  add column if not exists lost_reason   text;         -- fylles ut når status = 'tapt'

-- Indeks for "trenger oppfølging"-filteret
create index if not exists crm_contacts_followup_idx
  on crm_contacts (company_id, next_followup)
  where next_followup is not null;

-- 2. Aktivitetslogg – erstatter det å overskrive ett notatfelt
create table if not exists crm_activities (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid not null references crm_contacts(id) on delete cascade,
  company_id  uuid not null references companies(id)    on delete cascade,
  author_id   uuid references profiles(id) on delete set null,
  author_name text,
  text        text not null,
  created_at  timestamptz default now()
);

create index if not exists crm_activities_contact_idx
  on crm_activities (contact_id, created_at desc);

-- 3. Row Level Security – samme regler som crm_contacts
alter table crm_activities enable row level security;

drop policy if exists "crm_act_select" on crm_activities;
create policy "crm_act_select" on crm_activities for select using (
  exists (select 1 from company_members where company_id = crm_activities.company_id and user_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
);

drop policy if exists "crm_act_insert" on crm_activities;
create policy "crm_act_insert" on crm_activities for insert with check (
  exists (select 1 from company_members where company_id = crm_activities.company_id and user_id = auth.uid())
);

drop policy if exists "crm_act_delete" on crm_activities;
create policy "crm_act_delete" on crm_activities for delete using (
  exists (select 1 from company_members where company_id = crm_activities.company_id and user_id = auth.uid())
);

-- Bevisst ingen update-policy: logginnslag skal ikke kunne endres i ettertid.
-- Det er hele poenget med en logg – elevene skal se sin egen prosess som den var.

-- 4. Realtime
do $$
begin
  alter publication supabase_realtime add table crm_activities;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- Verifisering
-- ============================================================
-- select column_name, data_type from information_schema.columns
--   where table_name = 'crm_contacts' order by ordinal_position;
