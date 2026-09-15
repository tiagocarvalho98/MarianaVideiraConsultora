# Mariana Real Estate

V1 foundation for a private real estate lead capture and CRM webapp.

## Main Documentation

[AGENTS.md](./AGENTS.md) is the source of truth for product vision, architecture, schema, UX principles, Supabase runtime, public intake and future roadmap. Read it before adding or changing product features.

## Stack

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with RLS

## Current Runtime

The app is connected to a real Supabase project.

Current state:

- Supabase Auth protects `/crm/*`
- Supabase RLS is active and validated
- Tiago Carvalho is `admin`
- Mariana Videira is `consultor`
- the private CRM uses `src/lib/crm/supabase-repository.ts`
- seller/buyer public intake is active through Server Actions
- public intake uses a server-side transactional PostgreSQL RPC
- public forms never insert directly into CRM tables
- anonymous users have no direct access to CRM tables
- service role is server-only

Mocks are no longer the primary CRM runtime. Mock data/repository files remain only for tests and deliberate development use.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development:

```bash
npm run dev
```

3. Create `.env.local` from `.env.example` and fill the real Supabase values.

4. Start development and sign in with real Supabase Auth users.

## Supabase Setup

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code.

Link Supabase if needed:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Apply migrations:

```bash
supabase db push
```

The real remote database already uses migrations from `supabase/migrations`. Use `supabase/seed.sql` only for local/development seed:

```bash
supabase db reset
```

Or run `supabase/seed.sql` manually against a local development database.

Internal users are authorized through `public.profiles`, not user metadata.

Current required profiles:

- Tiago Carvalho: `admin`, `is_active=true`
- Mariana Videira: `consultor`, `is_active=true`

## Public Intake

`/vender` and `/comprar` are active.

Flow:

```txt
Browser form
  -> Next.js Server Action
  -> Zod validation
  -> normalization/dedupe
  -> server-side SupabaseRepository
  -> transactional RPC
  -> Contact + Opportunity + FormSubmission + Activity
  -> /crm/hoje
```

Important rules:

- dedupe Contact by normalized phone first
- fallback to normalized email
- never dedupe by name
- one Contact can have multiple Opportunities
- public leads start `assigned_to = null`
- public leads start `created_by = null`
- public leads start `status = new`, `stage = nova_lead`, `temperature = morna`
- `user_agent` is captured server-side when available
- current rate limiting is basic and in-memory; review it before meaningful public traffic

## Implemented Scope

Implemented:

- project foundation
- Supabase clients
- Supabase Auth login/logout
- CRM route protection with active profiles
- CRM shell
- functional CRM routes using SupabaseRepository
- repository mutations for stage, assignee, temperature, activities, tasks and lost opportunities
- public website routes
- real buyer/seller public intake
- visual ContactForm, not yet integrated with persistence
- V1 database migration
- public intake RPC migrations
- development seed
- repository abstraction
- mock repository retained for tests/development only
- core TypeScript types
- pipeline and lost reason config
- RLS/Auth validation scripts
- public intake smoke validation script

Not implemented yet:

- production dashboards
- drag-and-drop
- analytics integrations
- automations
- matching
- ContactForm persistence
- CMS
- `/crm/website`
