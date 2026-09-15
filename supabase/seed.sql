-- Development seed only. Do not use as production data.
-- Current app development uses src/data/mock/* and mock auth, not a remote Supabase project.
-- This seed intentionally does not insert into auth.users.
-- Because profiles.id references auth.users(id), profile rows should be created only after
-- real/local Auth users exist. Opportunities here keep created_by and assigned_to null.

insert into public.lead_sources (id, name, category)
values
  ('30000000-0000-4000-8000-000000000001', 'Meta Ads', 'paid_social'),
  ('30000000-0000-4000-8000-000000000002', 'Google Ads', 'paid_search'),
  ('30000000-0000-4000-8000-000000000003', 'Instagram', 'social'),
  ('30000000-0000-4000-8000-000000000004', 'Referencia', 'referral'),
  ('30000000-0000-4000-8000-000000000005', 'Organico', 'organic'),
  ('30000000-0000-4000-8000-000000000006', 'Contacto direto', 'direct')
on conflict (id) do nothing;

insert into public.contacts (
  id,
  first_name,
  last_name,
  phone,
  phone_normalized,
  email,
  email_normalized,
  created_at,
  updated_at
)
values
  ('20000000-0000-4000-8000-000000000001', 'Ana', 'Ribeiro', '+351 912 345 101', '+351912345101', 'ana.ribeiro@example.test', 'ana.ribeiro@example.test', now() - interval '15 minutes', now() - interval '15 minutes'),
  ('20000000-0000-4000-8000-000000000002', 'Miguel', 'Santos', '+351 913 220 104', '+351913220104', 'miguel.santos@example.test', 'miguel.santos@example.test', now() - interval '5 hours', now() - interval '5 hours'),
  ('20000000-0000-4000-8000-000000000003', 'Carla', 'Mendes', '+351 914 881 222', '+351914881222', null, null, now() - interval '3 hours', now() - interval '3 hours'),
  ('20000000-0000-4000-8000-000000000004', 'Joao', 'Ferreira', '+351 915 002 330', '+351915002330', 'joao.ferreira@example.test', 'joao.ferreira@example.test', now() - interval '4 days', now() - interval '1 day'),
  ('20000000-0000-4000-8000-000000000005', 'Patricia', 'Costa', '+351 916 770 419', '+351916770419', 'patricia.costa@example.test', 'patricia.costa@example.test', now() - interval '6 days', now() - interval '1 day'),
  ('20000000-0000-4000-8000-000000000006', 'Ricardo', 'Almeida', '+351 917 110 808', '+351917110808', 'ricardo.almeida@example.test', 'ricardo.almeida@example.test', now() - interval '10 days', now() - interval '8 days'),
  ('20000000-0000-4000-8000-000000000007', 'Sofia', 'Martins', '+351 918 306 610', '+351918306610', 'sofia.martins@example.test', 'sofia.martins@example.test', now() - interval '21 days', now() - interval '20 hours'),
  ('20000000-0000-4000-8000-000000000008', 'Helena', 'Rocha', '+351 919 440 771', '+351919440771', 'helena.rocha@example.test', 'helena.rocha@example.test', now() - interval '24 days', now() - interval '2 days'),
  ('20000000-0000-4000-8000-000000000009', 'Nuno', 'Barbosa', '+351 910 904 332', '+351910904332', 'nuno.barbosa@example.test', 'nuno.barbosa@example.test', now() - interval '18 days', now() - interval '11 days'),
  ('20000000-0000-4000-8000-000000000010', 'Ines', 'Cardoso', '+351 911 204 778', '+351911204778', null, null, now() - interval '16 days', now() - interval '6 days')
on conflict (id) do nothing;

insert into public.opportunities (
  id,
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
  next_action_at,
  first_contact_at,
  last_activity_at,
  lost_reason,
  lost_notes,
  created_at,
  updated_at
)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'seller', 'new', 'nova_lead', 'quente', null, null, '30000000-0000-4000-8000-000000000001', 'Montijo', null, null, 'Apartamento T3', '1 a 3 meses', null, null, false, null, null, now() - interval '15 minutes', null, null, now() - interval '15 minutes', now() - interval '15 minutes'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'buyer', 'new', 'nova_lead', 'morna', null, null, '30000000-0000-4000-8000-000000000003', 'Alcochete', 220000, 310000, 'T2 ou T3', '3 a 6 meses', 'pre_aprovado', false, null, null, null, now() - interval '5 hours', null, null, now() - interval '5 hours', now() - interval '5 hours'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'buyer', 'open', 'por_contactar', 'fria', null, null, '30000000-0000-4000-8000-000000000005', 'Montijo', 180000, 230000, 'T2', '6 a 12 meses', 'ainda_nao_tratado', true, null, date_trunc('day', now()) + interval '14 hours', null, now() - interval '3 hours', null, null, now() - interval '3 hours', now() - interval '3 hours'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004', 'buyer', 'open', 'qualificado', 'morna', null, null, '30000000-0000-4000-8000-000000000002', 'Palmela', 250000, 330000, 'T3', '1 a 3 meses', 'pre_aprovado', false, null, now() - interval '1 day', now() - interval '3 days', now() - interval '1 day', null, null, now() - interval '4 days', now() - interval '1 day'),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000005', 'seller', 'open', 'avaliacao_reuniao', 'quente', null, null, '30000000-0000-4000-8000-000000000004', 'Setubal', null, null, 'Moradia', 'Este mes', null, null, true, date_trunc('day', now()) + interval '18 hours', now() - interval '5 days', now() - interval '1 day', null, null, now() - interval '6 days', now() - interval '1 day'),
  ('40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000006', 'seller', 'open', 'qualificado', 'morna', null, null, '30000000-0000-4000-8000-000000000001', 'Barreiro', null, null, 'Apartamento T2', '3 meses', null, null, false, null, now() - interval '9 days', now() - interval '8 days', null, null, now() - interval '10 days', now() - interval '8 days'),
  ('40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000007', 'buyer', 'open', 'proposta', 'quente', null, null, '30000000-0000-4000-8000-000000000006', 'Moita', 320000, 390000, 'Moradia', 'Imediato', 'aprovado', false, null, now() + interval '1 day', now() - interval '20 days', now() - interval '20 hours', null, null, now() - interval '21 days', now() - interval '20 hours'),
  ('40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', 'seller', 'open', 'cpcv', 'quente', null, null, '30000000-0000-4000-8000-000000000002', 'Montijo', null, null, 'Apartamento T4', 'Em processo', null, null, false, now() + interval '6 days', now() - interval '23 days', now() - interval '2 days', null, null, now() - interval '24 days', now() - interval '2 days'),
  ('40000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000009', 'seller', 'open', 'em_comercializacao', 'morna', null, null, '30000000-0000-4000-8000-000000000003', 'Alcochete', null, null, 'Apartamento T3', '6 a 12 meses', null, null, true, null, now() - interval '17 days', now() - interval '11 days', null, null, now() - interval '18 days', now() - interval '11 days'),
  ('40000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000010', 'buyer', 'lost', 'perdido', 'fria', null, null, '30000000-0000-4000-8000-000000000004', 'Montijo', 150000, 175000, 'T1', 'Prazo futuro', 'ainda_nao_tratado', false, null, null, now() - interval '15 days', now() - interval '6 days', 'orcamento_incompativel', 'Pretensao atual abaixo dos valores disponiveis na zona.', now() - interval '16 days', now() - interval '6 days')
on conflict (id) do nothing;

insert into public.tasks (id, opportunity_id, assigned_to, title, due_at, completed_at, priority, created_at, updated_at)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', null, 'Primeira chamada', date_trunc('day', now()) + interval '14 hours', null, 'normal', now() - interval '3 hours', now() - interval '3 hours'),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000004', null, 'Enviar selecao de imoveis', now() - interval '1 day', null, 'high', now() - interval '2 days', now() - interval '2 days'),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000005', null, 'Reuniao de avaliacao', date_trunc('day', now()) + interval '18 hours', null, 'urgent', now() - interval '1 day', now() - interval '1 day'),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000007', null, 'Acompanhar resposta a proposta', now() + interval '1 day', null, 'high', now() - interval '20 hours', now() - interval '20 hours'),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000008', null, 'Preparar documentos CPCV', now() + interval '6 days', null, 'urgent', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.activities (id, opportunity_id, user_id, type, title, body, metadata, occurred_at, created_at)
values
  ('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', null, 'form_submission', 'Formulario vendedor recebido', 'Pretende falar sobre venda de apartamento no Montijo.', '{"landing_page":"/vender","source":"Meta Ads"}', now() - interval '15 minutes', now() - interval '15 minutes'),
  ('60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000004', null, 'call', 'Chamada de qualificacao', 'Cliente procura T3 em Palmela com financiamento pre-aprovado.', '{}', now() - interval '3 days', now() - interval '3 days'),
  ('60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000005', null, 'meeting', 'Reuniao marcada', 'Avaliacao presencial agendada.', '{"location":"Setubal"}', now() - interval '1 day', now() - interval '1 day'),
  ('60000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000007', null, 'stage_changed', 'Estado alterado', null, '{"from":"interessado","to":"proposta"}', now() - interval '20 hours', now() - interval '20 hours'),
  ('60000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000010', null, 'lost', 'Oportunidade marcada como perdida', 'Pretensao atual abaixo dos valores disponiveis na zona.', '{"reason":"orcamento_incompativel"}', now() - interval '6 days', now() - interval '6 days'),
  ('60000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000006', null, 'note', 'Nota de contexto', 'Proprietaria quer perceber valor real antes de decidir exclusividade.', '{}', now() - interval '8 days', now() - interval '8 days')
on conflict (id) do nothing;

insert into public.form_submissions (
  id,
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
  raw_payload,
  created_at
)
values
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'seller', 'meta', 'paid_social', 'Avaliacao Montijo Setembro', 'hero_cta', null, null, 'mock-fbclid-seed-1', 'https://instagram.com/', '/vender', 'MockBrowser/1.0 Development', true, true, '{"form_type":"seller","location":"Montijo"}', now() - interval '15 minutes'),
  ('70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'buyer', 'instagram', 'social', 'Comprar T3 Montijo', 'form_section', 'comprar casa montijo', null, 'mock-fbclid-seed-2', 'https://instagram.com/', '/comprar', 'MockBrowser/1.0 Development', true, false, '{"form_type":"buyer","location":"Alcochete"}', now() - interval '5 hours'),
  ('70000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'buyer', 'google', 'cpc', 'Comprar T3 Montijo', 'search', 'comprar t3 palmela', 'mock-gclid-seed-3', null, 'https://google.com/', '/comprar', 'MockBrowser/1.0 Development', true, true, '{"form_type":"buyer","location":"Palmela"}', now() - interval '4 days')
on conflict (id) do nothing;
