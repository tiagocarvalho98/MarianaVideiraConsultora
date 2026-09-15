create or replace function app_private.normalize_phone(_value text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  _trimmed text := btrim(coalesce(_value, ''));
  _digits text := regexp_replace(coalesce(_value, ''), '\D', '', 'g');
begin
  if _digits = '' then
    return '';
  end if;

  if left(_trimmed, 2) = '00' then
    return '+' || substring(_digits from 3);
  end if;

  if left(_trimmed, 1) = '+' then
    return '+' || _digits;
  end if;

  if length(_digits) = 9 and left(_digits, 1) = '9' then
    return '+351' || _digits;
  end if;

  return _digits;
end;
$$;

create or replace function app_private.normalize_email(_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(lower(btrim(_value)), '');
$$;

create or replace function public.submit_public_lead_intake(_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  _contact jsonb := coalesce(_payload -> 'contact', '{}'::jsonb);
  _opportunity jsonb := coalesce(_payload -> 'opportunity', '{}'::jsonb);
  _form_submission jsonb := coalesce(_payload -> 'formSubmission', '{}'::jsonb);
  _message text := nullif(btrim(coalesce(_payload ->> 'message', '')), '');
  _form_type public.opportunity_type;
  _phone text := btrim(coalesce(_contact ->> 'phone', ''));
  _phone_normalized text := app_private.normalize_phone(_contact ->> 'phone');
  _email text := app_private.normalize_email(_contact ->> 'email');
  _email_normalized text := app_private.normalize_email(_contact ->> 'email');
  _contact_id uuid;
  _opportunity_id uuid;
  _form_submission_id uuid;
begin
  if jsonb_typeof(_payload) is distinct from 'object' then
    raise exception 'Invalid intake payload';
  end if;

  if coalesce((_form_submission ->> 'privacyConsent')::boolean, false) is not true then
    raise exception 'Privacy consent is required';
  end if;

  _form_type := (_form_submission ->> 'formType')::public.opportunity_type;

  if _form_type not in ('buyer', 'seller') then
    raise exception 'Invalid form type';
  end if;

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
    _form_type,
    'new',
    'nova_lead',
    'morna',
    null,
    null,
    null,
    nullif(btrim(coalesce(_opportunity ->> 'location', '')), ''),
    nullif(_opportunity ->> 'budgetMin', '')::numeric,
    nullif(_opportunity ->> 'budgetMax', '')::numeric,
    nullif(btrim(coalesce(_opportunity ->> 'propertyType', '')), ''),
    nullif(btrim(coalesce(_opportunity ->> 'timeframe', '')), ''),
    nullif(btrim(coalesce(_opportunity ->> 'financingStatus', '')), ''),
    (_opportunity ->> 'currentPropertyToSell')::boolean,
    (_opportunity ->> 'propertyAlreadyListed')::boolean,
    null,
    null
  )
  returning id into _opportunity_id;

  insert into public.form_submissions (
    contact_id,
    opportunity_id,
    form_type,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    gclid,
    fbclid,
    referrer,
    landing_page,
    user_agent,
    privacy_consent,
    marketing_consent,
    raw_payload
  )
  values (
    _contact_id,
    _opportunity_id,
    _form_type,
    nullif(btrim(coalesce(_form_submission ->> 'utmSource', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'utmMedium', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'utmCampaign', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'utmContent', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'utmTerm', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'gclid', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'fbclid', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'referrer', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'landingPage', '')), ''),
    nullif(btrim(coalesce(_form_submission ->> 'userAgent', '')), ''),
    true,
    coalesce((_form_submission ->> 'marketingConsent')::boolean, false),
    coalesce(_form_submission -> 'rawPayload', '{}'::jsonb)
  )
  returning id into _form_submission_id;

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
    null,
    'form_submission',
    case _form_type
      when 'seller' then 'Formulario de venda recebido'
      else 'Formulario de compra recebido'
    end,
    null,
    jsonb_build_object(
      'form_submission_id', _form_submission_id,
      'source', 'public_form'
    )
  );

  if _message is not null then
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
      null,
      'note',
      'Mensagem do formulario',
      _message,
      jsonb_build_object('source', 'public_form')
    );
  end if;

  return jsonb_build_object(
    'contactId', _contact_id,
    'opportunityId', _opportunity_id,
    'formSubmissionId', _form_submission_id
  );
end;
$$;

revoke all on function public.submit_public_lead_intake(jsonb) from public;
revoke all on function public.submit_public_lead_intake(jsonb) from anon;
revoke all on function public.submit_public_lead_intake(jsonb) from authenticated;
grant execute on function public.submit_public_lead_intake(jsonb) to service_role;
