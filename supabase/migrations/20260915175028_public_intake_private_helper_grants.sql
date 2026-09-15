grant usage on schema app_private to service_role;
grant execute on function app_private.normalize_phone(text) to service_role;
grant execute on function app_private.normalize_email(text) to service_role;
