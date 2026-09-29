create type public.crm_note_category as enum ('urgent', 'hot', 'warm', 'cold');
create type public.note_team_role as enum ('admin', 'member');

create table public.note_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.note_team_members (
  team_id uuid not null references public.note_teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.note_team_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  title text,
  body text not null check (char_length(btrim(body)) > 0),
  category public.crm_note_category not null default 'warm',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crm_note_team_shares (
  note_id uuid not null references public.crm_notes(id) on delete cascade,
  team_id uuid not null references public.note_teams(id) on delete cascade,
  shared_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (note_id, team_id)
);

create index idx_note_team_members_user on public.note_team_members (user_id, team_id);
create index idx_crm_notes_owner_category on public.crm_notes (owner_id, category, archived_at, updated_at desc);
create index idx_crm_notes_opportunity on public.crm_notes (opportunity_id, archived_at, updated_at desc) where opportunity_id is not null;
create index idx_crm_notes_contact on public.crm_notes (contact_id, archived_at, updated_at desc) where contact_id is not null;
create index idx_crm_note_team_shares_team on public.crm_note_team_shares (team_id, note_id);

create trigger note_teams_set_updated_at
before update on public.note_teams
for each row execute function app_private.set_updated_at();

create trigger crm_notes_set_updated_at
before update on public.crm_notes
for each row execute function app_private.set_updated_at();

create or replace function app_private.is_note_team_member(_team_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.note_team_members member
    join public.profiles profile on profile.id = member.user_id
    where member.team_id = _team_id
      and member.user_id = _user_id
      and profile.is_active = true
  );
$$;

create or replace function app_private.is_note_team_admin(_team_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.note_team_members member
    join public.profiles profile on profile.id = member.user_id
    where member.team_id = _team_id
      and member.user_id = _user_id
      and member.role = 'admin'
      and profile.is_active = true
  );
$$;

alter table public.note_teams enable row level security;
alter table public.note_team_members enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_note_team_shares enable row level security;

create policy "CRM users can create note teams"
on public.note_teams
for insert
to authenticated
with check (
  app_private.is_crm_user(auth.uid())
  and created_by = auth.uid()
);

create policy "Team members can read note teams"
on public.note_teams
for select
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and app_private.is_note_team_member(id, auth.uid())
);

create policy "Team admins can update note teams"
on public.note_teams
for update
to authenticated
using (app_private.is_note_team_admin(id, auth.uid()))
with check (app_private.is_note_team_admin(id, auth.uid()));

create policy "Team members can read memberships"
on public.note_team_members
for select
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and app_private.is_note_team_member(team_id, auth.uid())
);

create policy "Team creators and admins can create memberships"
on public.note_team_members
for insert
to authenticated
with check (
  app_private.is_crm_user(auth.uid())
  and (
    app_private.is_note_team_admin(team_id, auth.uid())
    or exists (
      select 1
      from public.note_teams team
      where team.id = team_id
        and team.created_by = auth.uid()
    )
  )
);

create policy "Team admins can update memberships"
on public.note_team_members
for update
to authenticated
using (app_private.is_note_team_admin(team_id, auth.uid()))
with check (app_private.is_note_team_admin(team_id, auth.uid()));

create policy "Users can create own CRM notes"
on public.crm_notes
for insert
to authenticated
with check (
  app_private.is_crm_user(auth.uid())
  and owner_id = auth.uid()
);

create policy "Users can read owned or shared CRM notes"
on public.crm_notes
for select
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.crm_note_team_shares share
      where share.note_id = id
        and app_private.is_note_team_member(share.team_id, auth.uid())
    )
  )
);

create policy "Users can update own CRM notes"
on public.crm_notes
for update
to authenticated
using (owner_id = auth.uid() and app_private.is_crm_user(auth.uid()))
with check (owner_id = auth.uid() and app_private.is_crm_user(auth.uid()));

create policy "Team members can read note shares"
on public.crm_note_team_shares
for select
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and app_private.is_note_team_member(team_id, auth.uid())
);

create policy "Note owners can share notes with own teams"
on public.crm_note_team_shares
for insert
to authenticated
with check (
  app_private.is_crm_user(auth.uid())
  and shared_by = auth.uid()
  and app_private.is_note_team_member(team_id, auth.uid())
  and exists (
    select 1
    from public.crm_notes note
    where note.id = note_id
      and note.owner_id = auth.uid()
  )
);

create policy "Note owners can remove note shares"
on public.crm_note_team_shares
for delete
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and exists (
    select 1
    from public.crm_notes note
    where note.id = note_id
      and note.owner_id = auth.uid()
  )
);

grant execute on function app_private.is_note_team_member(uuid, uuid) to authenticated;
grant execute on function app_private.is_note_team_admin(uuid, uuid) to authenticated;

grant select, insert, update on public.note_teams to authenticated;
grant select, insert, update on public.note_team_members to authenticated;
grant select, insert, update on public.crm_notes to authenticated;
grant select, insert, delete on public.crm_note_team_shares to authenticated;
