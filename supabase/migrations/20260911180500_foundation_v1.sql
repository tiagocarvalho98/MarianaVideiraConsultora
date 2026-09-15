create extension if not exists pgcrypto;

create schema if not exists app_private;

create type public.app_role as enum ('admin', 'consultor');
create type public.opportunity_type as enum ('buyer', 'seller');
create type public.opportunity_status as enum ('new', 'open', 'won', 'lost', 'archived');
create type public.lead_temperature as enum ('fria', 'morna', 'quente');
create type public.activity_type as enum (
  'form_submission',
  'stage_changed',
  'call',
  'meeting',
  'note',
  'task_created',
  'task_completed',
  'lost'
);
create type public.task_priority as enum ('low', 'normal', 'high', 'urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'consultor',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  phone text not null,
  phone_normalized text not null,
  email text,
  email_normalized text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_phone_normalized_unique unique (phone_normalized),
  constraint contacts_email_normalized_unique unique (email_normalized)
);

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  created_at timestamptz not null default now(),
  constraint lead_sources_name_unique unique (name)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  type public.opportunity_type not null,
  status public.opportunity_status not null default 'new',
  stage text not null,
  temperature public.lead_temperature not null default 'morna',
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  source_id uuid references public.lead_sources(id) on delete set null,
  location text,
  budget_min numeric,
  budget_max numeric,
  property_type text,
  timeframe text,
  financing_status text,
  current_property_to_sell boolean,
  property_already_listed boolean,
  next_action_at timestamptz,
  first_contact_at timestamptz,
  last_activity_at timestamptz,
  lost_reason text,
  lost_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  type public.activity_type not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  priority public.task_priority not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  form_type public.opportunity_type not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  referrer text,
  landing_page text,
  user_agent text,
  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,
  raw_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index idx_contacts_phone_normalized on public.contacts (phone_normalized);
create index idx_contacts_email_normalized on public.contacts (email_normalized) where email_normalized is not null;
create index idx_opportunities_contact on public.opportunities (contact_id);
create index idx_opportunities_created_by on public.opportunities (created_by);
create index idx_opportunities_assigned_to on public.opportunities (assigned_to);
create index idx_opportunities_source on public.opportunities (source_id);
create index idx_opportunities_attention on public.opportunities (status, stage, next_action_at, last_activity_at);
create index idx_opportunities_first_contact on public.opportunities (first_contact_at);
create index idx_activities_opportunity on public.activities (opportunity_id, occurred_at desc);
create index idx_activities_type on public.activities (type, occurred_at desc);
create index idx_tasks_due on public.tasks (completed_at, due_at);
create index idx_tasks_assigned_to on public.tasks (assigned_to, completed_at, due_at);
create index idx_form_submissions_tracking on public.form_submissions (utm_source, utm_campaign, form_type, created_at);
create index idx_form_submissions_gclid on public.form_submissions (gclid) where gclid is not null;
create index idx_form_submissions_fbclid on public.form_submissions (fbclid) where fbclid is not null;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function app_private.set_updated_at();

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function app_private.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function app_private.set_updated_at();

create or replace function app_private.recalculate_opportunity_next_action(_opportunity_id uuid)
returns void
language sql
set search_path = ''
as $$
  update public.opportunities
     set next_action_at = (
           select min(due_at)
           from public.tasks
           where opportunity_id = _opportunity_id
             and completed_at is null
         )
   where id = _opportunity_id;
$$;

create or replace function app_private.sync_opportunity_next_action_from_task()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform app_private.recalculate_opportunity_next_action(old.opportunity_id);
    return old;
  end if;

  perform app_private.recalculate_opportunity_next_action(new.opportunity_id);

  if tg_op = 'UPDATE' and old.opportunity_id <> new.opportunity_id then
    perform app_private.recalculate_opportunity_next_action(old.opportunity_id);
  end if;

  return new;
end;
$$;

create trigger tasks_sync_opportunity_next_action
after insert or update or delete on public.tasks
for each row execute function app_private.sync_opportunity_next_action_from_task();

create or replace function app_private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = _user_id
      and role = _role
      and is_active = true
  );
$$;

create or replace function app_private.is_crm_user(_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = _user_id
      and role in ('admin', 'consultor')
      and is_active = true
  );
$$;

create or replace function public.transition_opportunity_stage(
  p_opportunity_id uuid,
  p_new_stage text
)
returns public.opportunities
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
  v_previous_stage text;
begin
  if not app_private.is_crm_user(auth.uid()) then
    raise exception 'Not allowed to transition opportunities';
  end if;

  select *
    into v_opportunity
    from public.opportunities
   where id = p_opportunity_id
   for update;

  if not found then
    raise exception 'Opportunity not found';
  end if;

  v_previous_stage := v_opportunity.stage;

  if v_previous_stage = p_new_stage then
    return v_opportunity;
  end if;

  if p_new_stage = 'perdido' then
    raise exception 'Use mark_opportunity_lost to move an opportunity to perdido';
  end if;

  update public.opportunities
     set stage = p_new_stage,
         status = case
           when p_new_stage = 'escritura' then 'won'::public.opportunity_status
           when status = 'won' then 'open'::public.opportunity_status
           when status = 'new' and p_new_stage <> 'nova_lead' then 'open'::public.opportunity_status
           else status
         end,
         last_activity_at = now()
   where id = p_opportunity_id
   returning *
    into v_opportunity;

  insert into public.activities (
    opportunity_id,
    user_id,
    type,
    title,
    metadata
  )
  values (
    p_opportunity_id,
    auth.uid(),
    'stage_changed',
    'Estado alterado',
    jsonb_build_object('from', v_previous_stage, 'to', p_new_stage)
  );

  return v_opportunity;
end;
$$;

create or replace function public.mark_opportunity_lost(
  p_opportunity_id uuid,
  p_reason text,
  p_notes text default null
)
returns public.opportunities
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_opportunity public.opportunities;
  v_allowed_reasons text[];
begin
  if not app_private.is_crm_user(auth.uid()) then
    raise exception 'Not allowed to mark opportunities as lost';
  end if;

  select *
    into v_opportunity
    from public.opportunities
   where id = p_opportunity_id
   for update;

  if not found then
    raise exception 'Opportunity not found';
  end if;

  v_allowed_reasons := case v_opportunity.type
    when 'buyer' then array[
      'deixou_de_procurar',
      'financiamento',
      'comprou_com_outro_consultor',
      'orcamento_incompativel',
      'sem_resposta',
      'prazo_futuro',
      'outro'
    ]
    else array[
      'escolheu_outro_consultor',
      'comissao',
      'preco',
      'desistiu_de_vender',
      'vendeu_diretamente',
      'sem_resposta',
      'outro'
    ]
  end;

  if p_reason is null or not p_reason = any(v_allowed_reasons) then
    raise exception 'Invalid lost reason';
  end if;

  update public.opportunities
     set status = 'lost',
         stage = 'perdido',
         lost_reason = p_reason,
         lost_notes = nullif(trim(coalesce(p_notes, '')), ''),
         next_action_at = null,
         last_activity_at = now()
   where id = p_opportunity_id
   returning *
    into v_opportunity;

  insert into public.activities (
    opportunity_id,
    user_id,
    type,
    title,
    body,
    metadata
  )
  values (
    p_opportunity_id,
    auth.uid(),
    'lost',
    'Oportunidade marcada como perdida',
    nullif(trim(coalesce(p_notes, '')), ''),
    jsonb_build_object('reason', p_reason)
  );

  return v_opportunity;
end;
$$;

create or replace function app_private.touch_opportunity_from_activity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.opportunities
     set last_activity_at = greatest(
           coalesce(last_activity_at, new.occurred_at),
           new.occurred_at
         ),
         first_contact_at = case
           when first_contact_at is null and new.type in ('call', 'meeting') then new.occurred_at
           else first_contact_at
         end
   where id = new.opportunity_id;

  return new;
end;
$$;

create trigger activities_touch_opportunity
after insert on public.activities
for each row execute function app_private.touch_opportunity_from_activity();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.lead_sources enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.form_submissions enable row level security;

create policy "Users can read own active profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() and is_active = true);

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (app_private.has_role(auth.uid(), 'admin'))
with check (app_private.has_role(auth.uid(), 'admin'));

create policy "CRM users can read contacts"
on public.contacts
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

create policy "CRM users can create contacts"
on public.contacts
for insert
to authenticated
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can update contacts"
on public.contacts
for update
to authenticated
using (app_private.is_crm_user(auth.uid()))
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can read lead sources"
on public.lead_sources
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

create policy "Admins can manage lead sources"
on public.lead_sources
for all
to authenticated
using (app_private.has_role(auth.uid(), 'admin'))
with check (app_private.has_role(auth.uid(), 'admin'));

create policy "CRM users can read opportunities"
on public.opportunities
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

create policy "CRM users can create opportunities"
on public.opportunities
for insert
to authenticated
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can update opportunities"
on public.opportunities
for update
to authenticated
using (app_private.is_crm_user(auth.uid()))
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can read activities"
on public.activities
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

create policy "CRM users can create activities"
on public.activities
for insert
to authenticated
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can read tasks"
on public.tasks
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

create policy "CRM users can create tasks"
on public.tasks
for insert
to authenticated
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can update tasks"
on public.tasks
for update
to authenticated
using (app_private.is_crm_user(auth.uid()))
with check (app_private.is_crm_user(auth.uid()));

create policy "CRM users can read form submissions"
on public.form_submissions
for select
to authenticated
using (app_private.is_crm_user(auth.uid()));

grant usage on schema public to anon, authenticated;
grant usage on schema app_private to authenticated;
grant execute on function public.transition_opportunity_stage(uuid, text) to authenticated;
grant execute on function public.mark_opportunity_lost(uuid, text, text) to authenticated;
grant execute on function app_private.has_role(uuid, public.app_role) to authenticated;
grant execute on function app_private.is_crm_user(uuid) to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.contacts to authenticated;
grant select, insert, update on public.lead_sources to authenticated;
grant select, insert, update on public.opportunities to authenticated;
grant select, insert on public.activities to authenticated;
grant select, insert, update on public.tasks to authenticated;
grant select on public.form_submissions to authenticated;
