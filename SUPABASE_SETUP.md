# Supabase Setup

This project needs three tables in Supabase: `entries`, `insights`, and `user_preferences`.

## CLI setup

```bash
supabase login
supabase init
supabase link --project-ref qikeyqhqewxccyyhymhr
```

`supabase link` requires an authenticated CLI session. If you see `Access token not provided`, run `supabase login` and complete the browser sign-in first.

If the CLI asks for a verification code during login, paste the code it prints from the browser flow directly into the terminal.

## Apply the schema

Use the SQL migration in `supabase/migrations/20260517_initial_schema.sql` to create the tables, indexes, and row-level security policies.

You can apply it with either of these workflows:

```bash
supabase db push
```

or, after linking, run `supabase db push` to apply the migration to the remote project.

or by pasting the SQL into the Supabase SQL editor.

## Required environment variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qikeyqhqewxccyyhymhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_D8aISpKO7WXQp-uiR6LLcA_4ylNqgne
```

## What the schema does

- `entries` stores logged meals.
- `insights` stores weekly pattern summaries.
- `user_preferences` stores user settings like timezone.
- RLS ensures each user can only read and write their own rows.

## After setup

Restart the dev server and refresh the app. The `Could not find the table 'public.entries' in the schema cache` error should disappear once the schema is applied.