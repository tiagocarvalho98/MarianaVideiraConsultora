drop policy if exists "Team members can read note teams" on public.note_teams;

create policy "Team members can read note teams"
on public.note_teams
for select
to authenticated
using (
  app_private.is_crm_user(auth.uid())
  and (
    created_by = auth.uid()
    or app_private.is_note_team_member(id, auth.uid())
  )
);
