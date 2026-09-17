insert into public.lead_sources (name, category)
values
  ('Prospeccao', 'manual'),
  ('Referencia', 'referral'),
  ('Base de dados', 'manual'),
  ('Chamada', 'manual'),
  ('WhatsApp', 'messaging'),
  ('Instagram', 'social'),
  ('Facebook', 'social'),
  ('Website', 'website'),
  ('Meta Ads', 'paid_social'),
  ('Google Ads', 'paid_search'),
  ('Networking', 'manual'),
  ('Outro', 'manual')
on conflict (name) do update
set category = coalesce(public.lead_sources.category, excluded.category);

create or replace function public.create_manual_opportunity(_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  _contact jsonb := coalesce(_payload -> 'contact', '{}'::jsonb);
  _opportunity jsonb := coalesce(_payload -> 'opportunity', '{}'::jsonb);
  _task jsonb := coalesce(_payload -> 'nextTask', 'null'::jsonb);
  _note text := nullif(btrim(coalesce(_payload ->> 'note', '')), '');
  _contact_id uuid := nullif(btrim(coalesce(_payload ->> 'contactId', '')), '')::uuid;
  _source_id uuid := nullif(btrim(coalesce(_opportunity ->> 'sourceId', '')), '')::uuid;
  _assigned_to uuid := nullif(btrim(coalesce(_opportunity ->> 'assignedTo', '')), '')::uuid;
  _created_by uuid := auth.uid();
  _type public.opportunity_type;
  _temperature public.lead_temperature;
  _phone text := btrim(coalesce(_contact ->> 'phone', ''));
  _phone_normalized text := app_private.normalize_phone(_contact ->> 'phone');
  _email text := app_private.normalize_email(_contact ->> 'email');
  _email_normalized text := app_private.normalize_email(_contact ->> 'email');
  _opportunity_id uuid;
  _task_id uuid;
  _budget_min numeric := nullif(_opportunity ->> 'budgetMin', '')::numeric;
  _budget_max numeric := nullif(_opportunity ->> 'budgetMax', '')::numeric;
  _next_task_due_at timestamptz;
  _next_task_title text;
  _next_task_type text;
begin
  if jsonb_typeof(_payload) is distinct from 'object' then
    raise exception 'Invalid manual opportunity payload';
  end if;

  if not app_private.is_crm_user(_created_by) then
    raise exception 'Not allowed to create manual opportunities';
  end if;

  _type := (_opportunity ->> 'type')::public.opportunity_type;
  _temperature := coalesce(
    nullif(_opportunity ->> 'temperature', '')::public.lead_temperature,
    'morna'::public.lead_temperature
  );

  if _type not in ('buyer', 'seller') then
    raise exception 'Invalid opportunity type';
  end if;

  if _budget_min is not null and _budget_min < 0 then
    raise exception 'Budget minimum must be positive';
  end if;

  if _budget_max is not null and _budget_max < 0 then
    raise exception 'Budget maximum must be positive';
  end if;

  if _budget_min is not null and _budget_max is not null and _budget_min > _budget_max then
    raise exception 'Budget minimum cannot exceed budget maximum';
  end if;

  if _source_id is null then
    raise exception 'Lead source is required';
  end if;

  if not exists (select 1 from public.lead_sources where id = _source_id) then
    raise exception 'Lead source not found';
  end if;

  _assigned_to := coalesce(_assigned_to, _created_by);

  if _assigned_to is not null and not exists (
    select 1
    from public.profiles
    where id = _assigned_to
      and role in ('admin', 'consultor')
      and is_active = true
  ) then
    raise exception 'Assigned profile is not an active CRM user';
  end if;

  if _contact_id is not null then
    if not exists (select 1 from public.contacts where id = _contact_id) then
      raise exception 'Contact not found';
    end if;
  else
    if _phone = '' or _phone_normalized = '' then
      raise exception 'Phone is required';
    end if;

    if nullif(btrim(coalesce(_contact ->> 'firstName', '')), '') is null then
      raise exception 'First name is required';
    end if;

    select id
      into _contact_id
      from public.contacts
     where phone_normalized = _phone_normalized
     limit 1
     for update;

    if _contact_id is null and _email_normalized is not null then
      select id
        into _contact_id
        from public.contacts
       where email_normalized = _email_normalized
       limit 1
       for update;
    end if;

    if _contact_id is null then
      begin
        insert into public.contacts (
          first_name,
          last_name,
          phone,
          phone_normalized,
          email,
          email_normalized
        )
        values (
          btrim(_contact ->> 'firstName'),
          nullif(btrim(coalesce(_contact ->> 'lastName', '')), ''),
          _phone,
          _phone_normalized,
          _email,
          _email_normalized
        )
        returning id into _contact_id;
      exception
        when unique_violation then
          select id
            into _contact_id
            from public.contacts
           where phone_normalized = _phone_normalized
              or (_email_normalized is not null and email_normalized = _email_normalized)
           order by case when phone_normalized = _phone_normalized then 0 else 1 end
           limit 1;

          if _contact_id is null then
            raise;
          end if;
      end;
    end if;
  end if;

  insert into public.opportunities (
    contact_id,
    type,
    status,
    stage,
    temperature,
    created_by,
    assigned_to,
    source_id,
    location,
    budget_min,
    budget_max,
    property_type,
    timeframe,
    financing_status,
    current_property_to_sell,
    property_already_listed,
    first_contact_at,
    next_action_at
  )
  values (
    _contact_id,
    _type,
    'new',
    'nova_lead',
    _temperature,
    _created_by,
    _assigned_to,
    _source_id,
    nullif(btrim(coalesce(_opportunity ->> 'location', '')), ''),
    _budget_min,
    _budget_max,
    nullif(btrim(coalesce(_opportunity ->> 'propertyType', '')), ''),
    nullif(btrim(coalesce(_opportunity ->> 'timeframe', '')), ''),
    nullif(btrim(coalesce(_opportunity ->> 'financingStatus', '')), ''),
    nullif(_opportunity ->> 'currentPropertyToSell', '')::boolean,
    nullif(_opportunity ->> 'propertyAlreadyListed', '')::boolean,
    null,
    null
  )
  returning id into _opportunity_id;

  insert into public.activities (
    opportunity_id,
    user_id,
    type,
    title,
    body,
    metadata
  )
  values (
    _opportunity_id,
    _created_by,
    'note',
    'Oportunidade criada manualmente',
    null,
    jsonb_build_object(
      'origin', 'manual',
      'created_by', _created_by,
      'source_id', _source_id,
      'assigned_to', _assigned_to,
      'seller_situation', nullif(btrim(coalesce(_opportunity ->> 'sellerSituation', '')), '')
    )
  );

  if _note is not null then
    insert into public.activities (
      opportunity_id,
      user_id,
      type,
      title,
      body,
      metadata
    )
    values (
      _opportunity_id,
      _created_by,
      'note',
      'Nota inicial',
      _note,
      jsonb_build_object('source', 'manual_creation')
    );
  end if;

  if jsonb_typeof(_task) = 'object' then
    _next_task_due_at := nullif(_task ->> 'dueAt', '')::timestamptz;
    _next_task_title := nullif(btrim(coalesce(_task ->> 'title', '')), '');
    _next_task_type := nullif(btrim(coalesce(_task ->> 'type', '')), '');

    if _next_task_due_at is null then
      raise exception 'Next task due date is required';
    end if;

    if _next_task_title is null then
      raise exception 'Next task title is required';
    end if;

    insert into public.tasks (
      opportunity_id,
      assigned_to,
      title,
      due_at,
      priority
    )
    values (
      _opportunity_id,
      _assigned_to,
      _next_task_title,
      _next_task_due_at,
      'normal'
    )
    returning id into _task_id;

    insert into public.activities (
      opportunity_id,
      user_id,
      type,
      title,
      body,
      metadata
    )
    values (
      _opportunity_id,
      _created_by,
      'task_created',
      'Tarefa criada',
      _next_task_title,
      jsonb_build_object(
        'task_id', _task_id,
        'task_type', _next_task_type,
        'due_at', _next_task_due_at
      )
    );
  end if;

  return jsonb_build_object(
    'contactId', _contact_id,
    'opportunityId', _opportunity_id,
    'taskId', _task_id
  );
end;
$$;

revoke all on function public.create_manual_opportunity(jsonb) from public;
revoke all on function public.create_manual_opportunity(jsonb) from anon;
revoke all on function public.create_manual_opportunity(jsonb) from authenticated;
grant execute on function public.create_manual_opportunity(jsonb) to authenticated;
