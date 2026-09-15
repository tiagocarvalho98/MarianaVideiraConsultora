# Mariana Real Estate - Product And Architecture Source Of Truth

> “Este produto existe para captar oportunidades imobiliárias e garantir que nenhuma oportunidade comercial relevante é esquecida. Simplicidade operacional tem prioridade sobre quantidade de funcionalidades. Qualquer nova feature deve justificar de que forma melhora aquisição, qualificação, follow-up, conversão ou medição.”

This file is the main source of truth for product, architecture and development decisions in this project. Keep it aligned with the code, migrations and approved product decisions before adding new features.

## Product Vision

Mariana Real Estate is a private lead capture and real estate CRM webapp for consultant Mariana [Apelido]. It is not a generic real estate CRM, not a social network and not an Inmovilla competitor.

The V1 exists to:

- capture buyer and seller leads from Mariana's public website
- receive those leads automatically
- organize and qualify opportunities inside a private CRM
- support commercial follow-up through buyer/seller pipelines
- make next actions visible enough that important leads are not forgotten
- measure source, campaign, status and lead quality over time

Future expansion may include teams, more consultants, property records, buyer requirements, matching and automations, but those are deliberately outside the current V1.

## Simplicity Philosophy

Simplicity is a product rule, not an aesthetic preference. Every feature must improve at least one of:

- acquisition
- qualification
- follow-up
- conversion
- productivity
- measurement

Avoid feature creep. Prefer a focused workflow that Mariana and Tiago can use daily over a broad product with weak operational clarity.

## Product Architecture

The product has two distinct surfaces:

- Public website: landing pages and forms for lead acquisition.
- Private CRM: authenticated operational workspace for follow-up and pipeline management.

Primary flow:

```txt
Marketing / Social / Google / Meta
  -> Website Mariana
  -> Public form
  -> Contact
  -> Opportunity
  -> CRM
  -> Qualification
  -> Next action
  -> Proposal / CPCV / Deal / Lost
```

Current implementation state:

- Supabase real is linked and active.
- The private CRM uses `SupabaseRepository` as the primary data source.
- Supabase Auth is active for CRM access.
- RLS is active and validated with normal authenticated sessions.
- Seller and buyer public intake is active through Next.js Server Actions.
- Public forms do not insert directly into CRM tables.
- Public intake calls a server-side transactional PostgreSQL RPC that creates the CRM records atomically.
- Anonymous users continue to have no direct access to CRM tables.
- Mock data remains only where deliberately useful for development and tests.

## Stack

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Supabase Auth and Postgres
- Supabase RLS from the first migration, validated against the real project
- Repository abstraction between UI and data source
- SupabaseRepository as the primary CRM repository
- Mock repository/data retained for tests and deliberate development use only

Do not migrate stack without a clear technical reason.

## Database Schema

The V1 production schema intentionally has only seven domain tables:

1. `profiles`
   Internal users. Tiago is the primary `admin`; Mariana is `consultor`. This table holds operational identity and role, separate from `auth.users`. Mariana must never depend on the admin role to edit approved website content in the future.

2. `contacts`
   People. A contact is a human identity with phone/email. It is deduplicated primarily by normalized phone and secondarily by normalized email.

3. `lead_sources`
   Normalized origin labels such as Meta Ads, Google Search, Website or Referral. Used for later attribution reporting.

4. `opportunities`
   Commercial intent. A contact can have multiple opportunities over time, for example buying in 2026 and selling in 2030.

5. `activities`
   Universal timeline. Calls, meetings, notes, form submissions, stage changes, task events and lost events live here.

6. `tasks`
   Next actions and follow-ups. Tasks are the operational mechanism for keeping work visible.

7. `form_submissions`
   Raw public form intake and attribution payload. This stores the submitted form, UTM fields, click IDs and consent fields.

Do not add `notifications`, `notes` or `opportunity_stage_events` in V1. Notes are activities. Stage changes are activities.

## Core Domain Concepts

`Contact` means person.

`Opportunity` means commercial intent. It belongs to one contact, has a type (`buyer` or `seller`), stage, status, temperature, assigned consultant and operational timestamps.

`Activity` means timeline event. It is the audit trail for what happened and when. For stage changes, use:

```json
{
  "type": "stage_changed",
  "metadata": {
    "from": "previous_stage",
    "to": "new_stage"
  }
}
```

`Task` means next action. It has title, due date, assignee, priority and completion state.

Keep these concepts separate. Do not collapse them into a giant `leads` table.

## Opportunity Fields That Matter

`created_by` and `assigned_to` are different:

- `created_by`: internal user who manually created the opportunity.
- `assigned_to`: consultant currently responsible for the opportunity.

Public form opportunities may have `created_by = null`.

## Roles And Permissions

Authorization must be controlled server-side/database-side through `profiles` and future permissions tables. Do not use `user_metadata` for authorization.

Tiago is the main platform administrator:

- manages the full CRM
- manages users and roles
- manages settings and critical configuration
- manages public website content
- manages leads and opportunities
- can access future administrative features

Mariana is a consultant:

- uses the CRM within assigned permissions
- works leads and opportunities
- can edit authorized commercial website content in the future

Mariana cannot:

- promote users to admin
- change roles
- manage RLS/security
- change critical settings
- manage infrastructure
- obtain administrative privileges through editable metadata

Future content permissions should be capability-based, not role-admin-based. A consultant may receive explicit website-content capabilities without becoming admin.

Operational timestamps:

- `created_at`: when the opportunity entered the system
- `first_contact_at`: first call or meeting contact
- `last_activity_at`: latest meaningful timeline activity
- `next_action_at`: next scheduled action

These allow future reporting for time to first contact, inactivity duration, time in stage and conversion rates.

## Buyer Pipeline

1. Nova lead
2. Por contactar
3. Contactado
4. Qualificado
5. Financiamento
6. Procura ativa
7. Visitas
8. Interessado
9. Proposta
10. CPCV
11. Escritura
12. Perdido

Code source: `src/data/pipeline-stages.ts`.

## Seller Pipeline

1. Nova lead
2. Por contactar
3. Contactado
4. Qualificado
5. Avaliacao / reuniao
6. Angariacao em negociacao
7. Angariado
8. Em comercializacao
9. Proposta
10. CPCV
11. Escritura
12. Perdido

Code source: `src/data/pipeline-stages.ts`.

## Page Hoje

`/crm/hoje` is the operational homepage of the CRM. It is more important than a decorative dashboard.

It should show, in priority order:

1. new leads not yet contacted
2. overdue follow-ups
3. actions due today
4. meetings due today
5. qualified opportunities without next action
6. opportunities without owner
7. stale opportunities with too much time since last activity

The repository contract exposes these groups through `getTodayQueue()`. The Supabase implementation is the active runtime; the mock implementation preserves the same behavior for tests/development.

Current production behavior is implemented by `src/lib/crm/supabase-repository.ts`. Public leads created through `/vender` and `/comprar` start as:

- `created_by = null`
- `assigned_to = null`
- `status = new`
- `stage = nova_lead`
- `temperature = morna`
- `first_contact_at = null`
- `next_action_at = null`

These leads should appear on `/crm/hoje` as new uncontacted and unassigned opportunities.

## Website Management Direction

Prepare the architecture for a future CRM area at `/crm/website`, but do not implement the full CMS without approval.

The CRM may later allow authorized users, including Mariana as `consultor`, to manage public website content without editing code:

- public profile: main photo, approved biography/presentation and selected configurable public details
- success cases: create, edit, archive/remove, photo, title, location, operation type, description, order/featured flag and `draft`/`published`/`archived` state
- listings in commercialization: title, type, location, price, typology when applicable, features, description, photos, state, featured flag and `draft`/`published`/`archived` state
- anonymized buyer searches: public representation of buyer demand, never the private opportunity itself

Buyer-search publications must never expose buyer name, phone, email, private notes or personally identifiable information. Public buyer demand must be stored as a separate public-content record derived from, but not identical to, private CRM data.

This must not become a page builder. Mariana manages content. Admin/development owns structure, components, design system, layout, structural SEO, permissions and system behavior.

Mariana must not be able to alter arbitrary homepage structure, CSS, global fonts, global colors, components, code or critical configuration.

Proposed future permission model:

- keep `profiles.role` for broad role classification: `admin` and `consultor`
- add explicit permissions/capabilities later, for example `website.profile.manage`, `website.success_cases.manage`, `website.listings.manage`, `website.buyer_searches.manage`
- assign permissions server-side/database-side, either directly to profiles or through role/capability tables
- use RLS/functions based on database-controlled permissions, not user-editable auth metadata

Proposed future website content data model, pending approval:

- `website_profile`: editable public profile content for Mariana, with media references and publication state
- `success_cases`: editorial records for real cases, with publication status and ordering
- `property_listings`: lightweight public commercialization records, not a complex property portal
- `buyer_search_publications`: anonymized buyer-demand records separated from private opportunities
- `media_assets` or Supabase Storage metadata: controlled references to uploaded images
- optional `profile_permissions` / `role_permissions` / `permission_assignments`: database-controlled capability model

Do not add these tables until the CMS/data model is explicitly approved.

Keep in `src/config/brand.ts` for now:

- stable static brand placeholders
- non-sensitive public labels
- design-system starting constants
- placeholder contact values clearly marked as placeholders

Move to database/storage later:

- Mariana's real photo
- approved biography/presentation
- editable public contact/display details
- success cases
- listings
- buyer-search publications
- uploaded images and media metadata
- any public content with draft/published/archive workflow

## Next Action And Owner Rules

Qualified opportunities should not silently remain without:

- responsible consultant
- next action
- next action date

This is not a rigid database constraint in V1 because it would damage UX during qualification. The UI should ask for these fields when an opportunity becomes qualified. If information is still missing, saving remains possible, but the opportunity must be shown as requiring attention on `/crm/hoje`.

## Lost Reasons

Marking an opportunity as lost is a structured action, not a casual status change. It requires a reason and allows optional notes.

Buyer lost reasons:

- deixou de procurar
- financiamento
- comprou com outro consultor
- orcamento incompativel
- sem resposta
- prazo futuro
- outro

Seller lost reasons:

- escolheu outro consultor
- comissao
- preco
- desistiu de vender
- vendeu diretamente
- sem resposta
- outro

Code source: `src/data/lost-reasons.ts`.

Database source: `mark_opportunity_lost(...)` in `supabase/migrations/20260911180500_foundation_v1.sql`.

## Tracking And Attribution

V1 must preserve attribution fields so later reporting can measure:

- source
- medium
- campaign
- content
- term
- gclid
- fbclid
- referrer
- landing page
- form type
- date
- user agent

`form_submissions.raw_payload` stores the original submitted data. Do not lose raw payloads during normalization.

Deduplication strategy:

- normalized phone is the primary identifier
- normalized email is fallback
- multiple null emails are acceptable
- one person/contact can legitimately have multiple opportunities
- do not build complex identity resolution in V1
- never deduplicate by name

Current public intake:

- `/vender` and `/comprar` submit through Next.js Server Actions.
- Server Actions validate with Zod, add server-side `user_agent` when available, and call the repository.
- `SupabaseRepository` uses the server-only service role client to execute `public.submit_public_lead_intake(jsonb)`.
- The RPC creates/reuses Contact, creates Opportunity, creates FormSubmission, creates Activity `form_submission`, and creates Activity `note` when a message exists.
- The browser never receives service role credentials and never inserts directly into CRM tables.
- `anon` has no direct table access and cannot execute the intake RPC.
- Public intake rate limiting is server-side through Supabase using hashed fingerprints, not raw phone/IP.
- A simple honeypot exists for public seller/buyer forms.

## Repository Architecture

UI must depend on `CrmRepository`, not directly on Supabase.

Current files:

- `src/lib/crm/repository.ts`: data access interface
- `src/lib/crm/supabase-repository.ts`: primary CRM implementation
- `src/lib/crm/mock-repository.ts`: retained for tests and deliberate development use
- `src/data/mock/*`: centralized mock dataset retained for tests/development
- `src/lib/crm/index.ts`: repository selector, currently returning SupabaseRepository

Do not put arrays of CRM data directly inside components. Add or change data through repository/data files.

## Current Mock Strategy

Mocks are no longer the primary CRM runtime. The real CRM uses Supabase Auth, RLS and SupabaseRepository.

Mock data and mock repository remain only where deliberately useful for:

- unit tests
- isolated domain behavior checks
- local experimentation that should not touch the real database

Mock users:

- `mariana@example.test / mariana-dev`
- `tiago@example.test / tiago-dev`

If mock data is used in tests or deliberate development mode, it must remain realistic enough to test daily workflows:

- Mariana consultor
- Tiago admin
- buyers
- sellers
- tasks
- calls
- meetings
- new leads
- overdue follow-ups
- qualified opportunities
- lost opportunities
- proposal opportunities
- CPCV opportunities

## Supabase Runtime Strategy

Supabase is now the active runtime:

1. The project is linked to a real Supabase project.
2. Production migrations live in `supabase/migrations`.
3. `supabase/seed.sql` remains separate and is for local/development seed only.
4. TypeScript database types are generated from the real database into `src/types/database.ts`.
5. `src/lib/crm/supabase-repository.ts` is the active CRM adapter.
6. Supabase Auth protects the private CRM.
7. RLS has been validated for real users and temporary test users.
8. Public seller/buyer intake is active through server-side boundaries and the transactional RPC.

The service role key must never be exposed to the browser. It is allowed only in server-side code and scripts that explicitly require privileged database operations.

## Production Readiness Strategy

Production deployment should use GitHub -> Vercel.

Required production environment variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Production readiness rules:

- public forms must submit through Server Actions
- public intake must remain transactional through PostgreSQL RPC
- service role is server-only
- Vercel logs are the initial observability layer
- conversion events are internal typed browser events until analytics providers are explicitly approved
- no Meta Pixel, Google Ads, Google Analytics or external analytics provider is installed yet
- ContactForm remains non-persistent until its domain behavior is approved

Minimum backup/recovery posture:

- migrations in Git recreate schema, not production data
- `supabase/seed.sql` is development/local seed only
- real data recovery depends on Supabase backups/PITR for the active plan
- before future schema changes, create forward-only migrations and confirm backup status

## Visual Identity: Editorial Humano

Initial visual direction is "Editorial Humano":

- premium without artificial luxury
- human, close and professional
- editorial composition
- contemporary real estate feel
- photography and layout over visual effects
- trust, care, authority and patrimony

Current foundation uses restrained warm neutrals, deep green and warm accent tones with editorial typography. These are starting points, not final brand decisions.

Do not treat Cormorant, Montserrat, Source Serif, Inter, olive green or clay tones as mandatory final choices. Do not default to gold cliches, generic SaaS visuals, excessive decorative serif type or AI-looking luxury real estate templates.

## UI/UX Principles

- Mobile-first.
- Real labels on forms.
- Clear hover, focus, loading, empty, success, error and disabled states.
- Visible focus states and keyboard navigation.
- Contrast should meet reasonable WCAG expectations.
- Touch targets should be comfortable on mobile.
- CRM screens should be operational, dense enough to work, and calm enough to scan.
- Page Hoje is a decision surface, not a KPI poster.
- Pipeline must work through normal controls/dropdowns before drag-and-drop.
- Use icons intentionally and consistently; avoid random decoration.
- Do not invent testimonials, awards, metrics, credentials, contact details or Mariana's surname.

## Explicitly Out Of V1

Do not implement these in V1 unless the scope is formally changed:

- generic CRM expansion
- notifications table
- separate notes table
- separate opportunity stage events table
- full website CMS
- public website page builder
- complex property portal
- private buyer requirements and matching
- matching
- deal collaborators
- team collaboration beyond basic roles
- WhatsApp/SMS automation
- email automation
- n8n workflows
- advanced analytics
- drag-and-drop as primary pipeline interaction
- public fake testimonials or fake business metrics
- newsletter system
- complex ACL beyond admin/consultor
- ContactForm persistence/intake without a separate domain decision
- CMS
- `/crm/website`

## Roadmap

Phase 1: Foundation

- project setup
- visual foundation
- migrations
- seed
- repository abstraction
- Supabase Auth
- CRM shell
- initial CRM screens

Status: completed. Supabase real, Auth and RLS are active and validated.

Phase 2: Public Website And Lead Intake

- public pages
- buyer/seller forms
- validation
- attribution capture
- deduplication flow
- transactional Supabase public intake

Status: completed for SellerLeadForm and BuyerLeadForm. Public forms submit through Server Actions, server-side validation, normalization/deduplication, and transactional RPC into Supabase. ContactForm is not integrated yet.

Phase 3: Operational CRM

- functional Hoje actions
- opportunity detail
- notes as activities
- tasks and next actions
- stage updates by dropdown
- mark lost flow

Current status: core operational CRM flows use SupabaseRepository. Lost/won/next_action_at invariants are implemented and validated.

Phase 4: Supabase Integration

- real project link
- generated types
- Supabase repository
- real Auth
- RLS verification
- local/remote seed strategy

Status: completed as part of Phase 1.

Phase 5: Polish And Measurement

- accessibility pass
- mobile QA
- performance checks
- basic source/stage reporting
- conversion-oriented refinements

## Security And Quality Rules

- TypeScript strict.
- Avoid `any`; document the reason if unavoidable.
- Keep service role server-only.
- Public forms must use server-side boundaries; never insert directly into CRM tables from the browser.
- Keep CRM inaccessible without authentication.
- Keep RLS enabled on all public schema tables.
- Keep anon blocked from CRM tables.
- Do not authorize from user-editable metadata.
- Tiago is admin; Mariana is consultant.
- Mariana must not require admin role to manage approved future website content.
- Validate public form inputs server-side when forms are added.
- Keep migrations reproducible and forward-only.
- Keep seed data separate from production migrations.
- Do not modify other projects such as `medifranco`.
- Run lint, typecheck and build before handing over implementation phases.

## Decisions Not To Change Without Justification

- Seven-table V1 schema.
- Tiago is the primary admin and Mariana is consultant.
- Website management requires future explicit permissions, not Mariana admin role.
- CRM website management must remain content management, not page building.
- Public buyer-search publications must be separate anonymized records, never private opportunities exposed directly.
- Contact and Opportunity must remain separate.
- Activity is the universal timeline.
- Notes are activities.
- Stage changes are activities with `metadata.from` and `metadata.to`.
- Page Hoje is the CRM homepage.
- No separate Leads page in V1.
- Pipeline interaction must work without drag-and-drop.
- `created_by` and `assigned_to` must remain separate.
- Public form opportunities may have `created_by = null`.
- Deduplication remains phone-first, email-fallback.
- A Contact may have multiple Opportunities.
- Never deduplicate Contact by name.
- SupabaseRepository remains the active CRM data source.
- Mock repository/data must not become the primary CRM runtime again without justification.
- Seller/buyer public intake must remain server-boundary + transactional RPC unless a safer approved design replaces it.
- Public leads remain unassigned by default.
- `perdido` remains available only through the dedicated lost operation.
- `escritura` sets `status = won`.
- Tasks recalculate `next_action_at`; no open relevant task means `next_action_at = null`.
- Do not invent content for Mariana.
