create table if not exists app_private.public_intake_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint public_intake_rate_limits_attempts_positive check (attempts > 0)
);

create index if not exists idx_public_intake_rate_limits_window
on app_private.public_intake_rate_limits (window_started_at);

create or replace function public.check_public_intake_rate_limit(
  p_key_hash text,
  p_limit integer default 3,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  _now timestamptz := now();
  _started_at timestamptz;
  _attempts integer;
begin
  if p_key_hash is null or length(btrim(p_key_hash)) < 32 then
    raise exception 'Invalid rate limit key';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit settings';
  end if;

  delete from app_private.public_intake_rate_limits
  where window_started_at < _now - make_interval(secs => p_window_seconds * 2);

  insert into app_private.public_intake_rate_limits as rate_limit (
    key_hash,
    window_started_at,
    attempts,
    updated_at
  )
  values (
    p_key_hash,
    _now,
    1,
    _now
  )
  on conflict (key_hash)
  do update
     set attempts = case
           when rate_limit.window_started_at < _now - make_interval(secs => p_window_seconds)
             then 1
           else rate_limit.attempts + 1
         end,
         window_started_at = case
           when rate_limit.window_started_at < _now - make_interval(secs => p_window_seconds)
             then _now
           else rate_limit.window_started_at
         end,
         updated_at = _now
  returning window_started_at, attempts
       into _started_at, _attempts;

  return _attempts <= p_limit;
end;
$$;

revoke all on function public.check_public_intake_rate_limit(text, integer, integer) from public;
revoke all on function public.check_public_intake_rate_limit(text, integer, integer) from anon;
revoke all on function public.check_public_intake_rate_limit(text, integer, integer) from authenticated;
grant execute on function public.check_public_intake_rate_limit(text, integer, integer) to service_role;
