-- Harden multi-tenant isolation for production use.
-- This migration replaces dev-open RLS policies with organization-aware policies,
-- backfills missing organization_id values, and closes public document access.

-- =========================================================
-- Permission helpers
-- =========================================================

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.is_active = true
  );
$$;

create or replace function public.is_org_manager_or_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.is_active = true
      and ou.role in ('admin', 'manager')
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.is_active = true
      and ou.role = 'admin'
  );
$$;

-- =========================================================
-- Structural fixes: add organization_id where missing
-- =========================================================

alter table public.condominium_notes
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

alter table public.ticket_costs
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

alter table public.stakeholder_condominiums
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

alter table public.supplier_condominiums
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

-- =========================================================
-- Backfill organization_id values
-- =========================================================

update public.condominium_notes cn
set organization_id = c.organization_id
from public.condominiums c
where c.id = cn.condominium_id
  and cn.organization_id is null;

update public.ticket_costs tc
set organization_id = t.organization_id
from public.tickets t
where t.id = tc.ticket_id
  and tc.organization_id is null;

update public.stakeholder_condominiums sc
set organization_id = c.organization_id
from public.condominiums c
where c.id = sc.condominium_id
  and sc.organization_id is null;

update public.supplier_condominiums sc
set organization_id = c.organization_id
from public.condominiums c
where c.id = sc.condominium_id
  and sc.organization_id is null;

update public.tickets t
set organization_id = c.organization_id
from public.condominiums c
where c.id = t.condominium_id
  and t.organization_id is null;

update public.ticket_updates tu
set organization_id = t.organization_id
from public.tickets t
where t.id = tu.ticket_id
  and tu.organization_id is null;

update public.tasks tk
set organization_id = c.organization_id
from public.condominiums c
where c.id = tk.condominium_id
  and tk.organization_id is null;

update public.tasks tk
set organization_id = t.organization_id
from public.tickets t
where t.id = tk.ticket_id
  and tk.organization_id is null;

update public.tasks tk
set organization_id = a.organization_id
from public.assemblies a
where a.id = tk.assembly_id
  and tk.organization_id is null;

update public.activity_logs al
set organization_id = c.organization_id
from public.condominiums c
where c.id = al.condominium_id
  and al.organization_id is null;

update public.documents d
set organization_id = c.organization_id
from public.condominiums c
where c.id = d.condominium_id
  and d.organization_id is null;

update public.documents d
set organization_id = t.organization_id
from public.tickets t
where t.id = d.ticket_id
  and d.organization_id is null;

update public.documents d
set organization_id = a.organization_id
from public.assemblies a
where a.id = d.assembly_id
  and d.organization_id is null;

update public.documents d
set organization_id = s.organization_id
from public.suppliers s
where s.id = d.supplier_id
  and d.organization_id is null;

update public.assemblies a
set organization_id = c.organization_id
from public.condominiums c
where c.id = a.condominium_id
  and a.organization_id is null;

update public.assembly_points ap
set organization_id = a.organization_id
from public.assemblies a
where a.id = ap.assembly_id
  and ap.organization_id is null;

update public.assembly_attendees aa
set organization_id = a.organization_id
from public.assemblies a
where a.id = aa.assembly_id
  and aa.organization_id is null;

update public.transcripts tr
set organization_id = a.organization_id
from public.assemblies a
where a.id = tr.assembly_id
  and tr.organization_id is null;

update public.transcript_segments ts
set organization_id = tr.organization_id
from public.transcripts tr
where tr.id = ts.transcript_id
  and ts.organization_id is null;

update public.minutes m
set organization_id = a.organization_id
from public.assemblies a
where a.id = m.assembly_id
  and m.organization_id is null;

update public.minute_sections ms
set organization_id = m.organization_id
from public.minutes m
where m.id = ms.minute_id
  and ms.organization_id is null;

update public.ai_runs ar
set organization_id = c.organization_id
from public.condominiums c
where c.id = ar.condominium_id
  and ar.organization_id is null;

-- =========================================================
-- Enforce organization_id where backfill is now deterministic
-- =========================================================

alter table public.condominiums alter column organization_id set not null;
alter table public.stakeholders alter column organization_id set not null;
alter table public.suppliers alter column organization_id set not null;
alter table public.tickets alter column organization_id set not null;
alter table public.ticket_updates alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.assemblies alter column organization_id set not null;
alter table public.assembly_points alter column organization_id set not null;
alter table public.assembly_attendees alter column organization_id set not null;
alter table public.transcripts alter column organization_id set not null;
alter table public.transcript_segments alter column organization_id set not null;
alter table public.minutes alter column organization_id set not null;
alter table public.minute_sections alter column organization_id set not null;
alter table public.tasks alter column organization_id set not null;
alter table public.activity_logs alter column organization_id set not null;
alter table public.ai_runs alter column organization_id set not null;
alter table public.condominium_notes alter column organization_id set not null;
alter table public.ticket_costs alter column organization_id set not null;
alter table public.stakeholder_condominiums alter column organization_id set not null;
alter table public.supplier_condominiums alter column organization_id set not null;

-- =========================================================
-- Helper to replace repetitive RLS definitions
-- =========================================================

create or replace function public.is_document_path_accessible(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.documents d
    where d.file_path = object_name
      and public.is_org_member(d.organization_id)
  );
$$;

-- =========================================================
-- Replace open policies with tenant-aware policies
-- =========================================================

-- condominiums
drop policy if exists "Allow all select on condominiums" on public.condominiums;
drop policy if exists "Allow all insert on condominiums" on public.condominiums;
drop policy if exists "Allow all update on condominiums" on public.condominiums;
drop policy if exists "Allow all delete on condominiums" on public.condominiums;

create policy "Members can read condominiums"
on public.condominiums
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert condominiums"
on public.condominiums
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update condominiums"
on public.condominiums
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete condominiums"
on public.condominiums
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- stakeholders
drop policy if exists "Allow all select on stakeholders" on public.stakeholders;
drop policy if exists "Allow all insert on stakeholders" on public.stakeholders;
drop policy if exists "Allow all update on stakeholders" on public.stakeholders;
drop policy if exists "Allow all delete on stakeholders" on public.stakeholders;

create policy "Members can read stakeholders"
on public.stakeholders
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert stakeholders"
on public.stakeholders
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update stakeholders"
on public.stakeholders
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete stakeholders"
on public.stakeholders
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- stakeholder_condominiums
drop policy if exists "Allow all select on stakeholder_condominiums" on public.stakeholder_condominiums;
drop policy if exists "Allow all insert on stakeholder_condominiums" on public.stakeholder_condominiums;
drop policy if exists "Allow all update on stakeholder_condominiums" on public.stakeholder_condominiums;
drop policy if exists "Allow all delete on stakeholder_condominiums" on public.stakeholder_condominiums;

create policy "Members can read stakeholder condominiums"
on public.stakeholder_condominiums
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert stakeholder condominiums"
on public.stakeholder_condominiums
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update stakeholder condominiums"
on public.stakeholder_condominiums
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete stakeholder condominiums"
on public.stakeholder_condominiums
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- suppliers
drop policy if exists "Allow all select on suppliers" on public.suppliers;
drop policy if exists "Allow all insert on suppliers" on public.suppliers;
drop policy if exists "Allow all update on suppliers" on public.suppliers;
drop policy if exists "Allow all delete on suppliers" on public.suppliers;

create policy "Members can read suppliers"
on public.suppliers
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert suppliers"
on public.suppliers
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update suppliers"
on public.suppliers
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete suppliers"
on public.suppliers
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- supplier_condominiums
drop policy if exists "Allow all select on supplier_condominiums" on public.supplier_condominiums;
drop policy if exists "Allow all insert on supplier_condominiums" on public.supplier_condominiums;
drop policy if exists "Allow all update on supplier_condominiums" on public.supplier_condominiums;
drop policy if exists "Allow all delete on supplier_condominiums" on public.supplier_condominiums;

create policy "Members can read supplier condominiums"
on public.supplier_condominiums
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert supplier condominiums"
on public.supplier_condominiums
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update supplier condominiums"
on public.supplier_condominiums
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete supplier condominiums"
on public.supplier_condominiums
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- condominium_notes
drop policy if exists "Allow all select on condominium_notes" on public.condominium_notes;
drop policy if exists "Allow all insert on condominium_notes" on public.condominium_notes;
drop policy if exists "Allow all update on condominium_notes" on public.condominium_notes;
drop policy if exists "Allow all delete on condominium_notes" on public.condominium_notes;

create policy "Members can read condominium notes"
on public.condominium_notes
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert condominium notes"
on public.condominium_notes
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can update condominium notes"
on public.condominium_notes
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Managers can delete condominium notes"
on public.condominium_notes
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- tickets
drop policy if exists "Allow all select on tickets" on public.tickets;
drop policy if exists "Allow all insert on tickets" on public.tickets;
drop policy if exists "Allow all update on tickets" on public.tickets;
drop policy if exists "Allow all delete on tickets" on public.tickets;

create policy "Members can read tickets"
on public.tickets
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert tickets"
on public.tickets
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can update tickets"
on public.tickets
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Managers can delete tickets"
on public.tickets
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- ticket_updates
drop policy if exists "Allow all select on ticket_updates" on public.ticket_updates;
drop policy if exists "Allow all insert on ticket_updates" on public.ticket_updates;
drop policy if exists "Allow all update on ticket_updates" on public.ticket_updates;
drop policy if exists "Allow all delete on ticket_updates" on public.ticket_updates;

create policy "Members can read ticket updates"
on public.ticket_updates
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert ticket updates"
on public.ticket_updates
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can update ticket updates"
on public.ticket_updates
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Managers can delete ticket updates"
on public.ticket_updates
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- ticket_costs
drop policy if exists "Allow all select on ticket_costs" on public.ticket_costs;
drop policy if exists "Allow all insert on ticket_costs" on public.ticket_costs;
drop policy if exists "Allow all update on ticket_costs" on public.ticket_costs;
drop policy if exists "Allow all delete on ticket_costs" on public.ticket_costs;

create policy "Members can read ticket costs"
on public.ticket_costs
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert ticket costs"
on public.ticket_costs
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update ticket costs"
on public.ticket_costs
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can delete ticket costs"
on public.ticket_costs
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- documents
drop policy if exists "Allow all select on documents" on public.documents;
drop policy if exists "Allow all insert on documents" on public.documents;
drop policy if exists "Allow all update on documents" on public.documents;
drop policy if exists "Allow all delete on documents" on public.documents;

create policy "Members can read documents"
on public.documents
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert documents"
on public.documents
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can update documents"
on public.documents
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Managers can delete documents"
on public.documents
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- assemblies
drop policy if exists "Allow all select on assemblies" on public.assemblies;
drop policy if exists "Allow all insert on assemblies" on public.assemblies;
drop policy if exists "Allow all update on assemblies" on public.assemblies;
drop policy if exists "Allow all delete on assemblies" on public.assemblies;

create policy "Members can read assemblies"
on public.assemblies
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert assemblies"
on public.assemblies
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update assemblies"
on public.assemblies
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete assemblies"
on public.assemblies
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- assembly_points
drop policy if exists "Allow all select on assembly_points" on public.assembly_points;
drop policy if exists "Allow all insert on assembly_points" on public.assembly_points;
drop policy if exists "Allow all update on assembly_points" on public.assembly_points;
drop policy if exists "Allow all delete on assembly_points" on public.assembly_points;

create policy "Members can read assembly points"
on public.assembly_points
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert assembly points"
on public.assembly_points
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update assembly points"
on public.assembly_points
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete assembly points"
on public.assembly_points
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- assembly_attendees
drop policy if exists "Allow all select on assembly_attendees" on public.assembly_attendees;
drop policy if exists "Allow all insert on assembly_attendees" on public.assembly_attendees;
drop policy if exists "Allow all update on assembly_attendees" on public.assembly_attendees;
drop policy if exists "Allow all delete on assembly_attendees" on public.assembly_attendees;

create policy "Members can read assembly attendees"
on public.assembly_attendees
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert assembly attendees"
on public.assembly_attendees
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update assembly attendees"
on public.assembly_attendees
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete assembly attendees"
on public.assembly_attendees
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- transcripts
drop policy if exists "Allow all select on transcripts" on public.transcripts;
drop policy if exists "Allow all insert on transcripts" on public.transcripts;
drop policy if exists "Allow all update on transcripts" on public.transcripts;
drop policy if exists "Allow all delete on transcripts" on public.transcripts;

create policy "Members can read transcripts"
on public.transcripts
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert transcripts"
on public.transcripts
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update transcripts"
on public.transcripts
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete transcripts"
on public.transcripts
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- transcript_segments
drop policy if exists "Allow all select on transcript_segments" on public.transcript_segments;
drop policy if exists "Allow all insert on transcript_segments" on public.transcript_segments;
drop policy if exists "Allow all update on transcript_segments" on public.transcript_segments;
drop policy if exists "Allow all delete on transcript_segments" on public.transcript_segments;

create policy "Members can read transcript segments"
on public.transcript_segments
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert transcript segments"
on public.transcript_segments
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update transcript segments"
on public.transcript_segments
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete transcript segments"
on public.transcript_segments
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- minutes
drop policy if exists "Allow all select on minutes" on public.minutes;
drop policy if exists "Allow all insert on minutes" on public.minutes;
drop policy if exists "Allow all update on minutes" on public.minutes;
drop policy if exists "Allow all delete on minutes" on public.minutes;

create policy "Members can read minutes"
on public.minutes
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert minutes"
on public.minutes
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update minutes"
on public.minutes
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete minutes"
on public.minutes
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- minute_sections
drop policy if exists "Allow all select on minute_sections" on public.minute_sections;
drop policy if exists "Allow all insert on minute_sections" on public.minute_sections;
drop policy if exists "Allow all update on minute_sections" on public.minute_sections;
drop policy if exists "Allow all delete on minute_sections" on public.minute_sections;

create policy "Members can read minute sections"
on public.minute_sections
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Managers can insert minute sections"
on public.minute_sections
for insert
to authenticated
with check (public.is_org_manager_or_admin(organization_id));

create policy "Managers can update minute sections"
on public.minute_sections
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete minute sections"
on public.minute_sections
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- ai_runs
drop policy if exists "Allow all select on ai_runs" on public.ai_runs;
drop policy if exists "Allow all insert on ai_runs" on public.ai_runs;
drop policy if exists "Allow all update on ai_runs" on public.ai_runs;
drop policy if exists "Allow all delete on ai_runs" on public.ai_runs;

create policy "Members can read ai runs"
on public.ai_runs
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert ai runs"
on public.ai_runs
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Managers can update ai runs"
on public.ai_runs
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete ai runs"
on public.ai_runs
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- tasks
drop policy if exists "Allow all select on tasks" on public.tasks;
drop policy if exists "Allow all insert on tasks" on public.tasks;
drop policy if exists "Allow all update on tasks" on public.tasks;
drop policy if exists "Allow all delete on tasks" on public.tasks;

create policy "Members can read tasks"
on public.tasks
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert tasks"
on public.tasks
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can update tasks"
on public.tasks
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Managers can delete tasks"
on public.tasks
for delete
to authenticated
using (public.is_org_manager_or_admin(organization_id));

-- activity_logs
drop policy if exists "Allow all select on activity_logs" on public.activity_logs;
drop policy if exists "Allow all insert on activity_logs" on public.activity_logs;
drop policy if exists "Allow all update on activity_logs" on public.activity_logs;
drop policy if exists "Allow all delete on activity_logs" on public.activity_logs;

create policy "Members can read activity logs"
on public.activity_logs
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can insert activity logs"
on public.activity_logs
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Managers can update activity logs"
on public.activity_logs
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_manager_or_admin(organization_id));

create policy "Admins can delete activity logs"
on public.activity_logs
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- organizations and memberships
create policy "Admins can update their organizations"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

create policy "Members can view memberships in their organizations"
on public.organization_users
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Admins can manage memberships"
on public.organization_users
for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy "Admins can update memberships"
on public.organization_users
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Admins can delete memberships"
on public.organization_users
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- =========================================================
-- Storage: close public document access
-- =========================================================

update storage.buckets
set public = false
where id = 'documents';

drop policy if exists "Allow public upload to documents" on storage.objects;
drop policy if exists "Allow public read from documents" on storage.objects;
drop policy if exists "Allow public delete from documents" on storage.objects;

create policy "Authenticated users can upload documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'documents');

create policy "Members can read documents from storage"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and public.is_document_path_accessible(name)
);

create policy "Managers can delete documents from storage"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.documents d
    where d.file_path = name
      and public.is_org_manager_or_admin(d.organization_id)
  )
);
