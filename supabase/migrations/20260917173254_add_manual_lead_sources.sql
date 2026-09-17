insert into public.lead_sources (name, category)
values
  ('Posicionamento', 'offline'),
  ('Placa de rua', 'offline'),
  ('Escala', 'offline'),
  ('CIPS', 'networking'),
  ('Open-House', 'event'),
  ('FISGOS', 'networking'),
  ('Idealista', 'portal'),
  ('FSBO', 'offline'),
  ('Imovirtual', 'portal'),
  ('CasaYes', 'portal'),
  ('OLX', 'portal')
on conflict (name) do update
set category = coalesce(public.lead_sources.category, excluded.category);
