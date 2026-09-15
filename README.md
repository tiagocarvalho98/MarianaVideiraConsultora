# Mariana Real Estate

V1 foundation for a private real estate lead capture and CRM webapp.

## Main Documentation

[AGENTS.md](./AGENTS.md) is the source of truth for product vision, architecture, schema, UX principles, current mock strategy and future Supabase migration. Read it before adding or changing product features.

## Stack

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with RLS

## Current Development Mode

The app does not connect to a remote Supabase project yet.

For now, the CRM runs with:

- production migrations kept in `supabase/migrations`
- development seed kept in `supabase/seed.sql`
- mock auth isolated in `src/lib/auth`
- repository abstraction in `src/lib/crm/repository.ts`
- active mock data access in `src/lib/crm/mock-repository.ts`
- future Supabase adapter reserved in `src/lib/crm/supabase-repository.ts`

This lets the UX, schema and workflows stabilize before wiring a real database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development:

```bash
npm run dev
```

3. Use temporary mock credentials:

```txt
mariana@example.test / mariana-dev
tiago@example.test / tiago-dev
```

## Future Supabase Setup

When ready to connect Supabase, create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code.

Then link Supabase:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Apply migrations:

```bash
supabase db push
```

Optionally load development seed locally:

```bash
supabase db reset
```

Or run `supabase/seed.sql` manually against a local development database.

Create internal users in Supabase Auth, then add matching rows to `public.profiles`.

```sql
insert into public.profiles (id, full_name, role)
values
  ('AUTH_USER_ID_FOR_MARIANA', 'Mariana [Apelido]', 'consultor'),
  ('AUTH_USER_ID_FOR_TIAGO', 'Tiago', 'admin');
```

## Implemented Scope

Implemented:

- project foundation
- Supabase clients
- mock auth login
- CRM route protection
- CRM shell
- functional CRM routes with mock data
- mock repository mutations for stage, assignee, temperature, activities, tasks and lost opportunities
- public website routes
- visual buyer/seller/contact forms with client-side validation and mock submission message
- V1 database migration
- development seed
- repository abstraction
- mock repository
- core TypeScript types
- pipeline and lost reason config

Not implemented yet:

- public website pages
- persistent lead form submission
- production dashboards
- drag-and-drop
- analytics integrations
- automations
- matching
