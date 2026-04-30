# Supabase Setup Guide

## Overview

This guide walks you through setting up the Supabase backend for Mindful, including database schema, authentication, and Row-Level Security (RLS) policies.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"** or sign in if you have an account
3. Choose your organization
4. **Project name:** `mindful-food-logger` (or your choice)
5. **Database password:** Create a strong password and save it
6. **Region:** Choose closest to your users (e.g., `us-east-1`)
7. Click **"Create new project"** and wait for initialization (~2 minutes)

---

## Step 2: Get API Keys

1. In the Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (labeled "URL")
   - **Anon Key** (under "Project API keys")
3. Save these in your `.env.local` file (next section)

---

## Step 3: Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**These are safe to commit to VCS** (we use `NEXT_PUBLIC_` prefix which means they're public). Sensitive data uses a service role key (server-side only).

---

## Step 4: Create Tables

In the Supabase dashboard:

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Paste the entire SQL script below:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT entries_unique_id UNIQUE (id)
);

-- Create index for faster queries
CREATE INDEX entries_user_id_idx ON entries(user_id);
CREATE INDEX entries_logged_at_idx ON entries(logged_at DESC);

-- Insights table (for caching pattern analysis)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT insights_unique_week UNIQUE (user_id, insight_type, week_start)
);

CREATE INDEX insights_user_id_idx ON insights(user_id);
CREATE INDEX insights_week_start_idx ON insights(week_start DESC);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX user_preferences_user_id_idx ON user_preferences(user_id);
```

4. Click **"Run"** (or ⌘+Enter)

**You should see:** "Query executed successfully"

---

## Step 5: Enable Row-Level Security (RLS)

RLS ensures users can ONLY access their own entries.

### 5.1 Enable RLS on Tables

In **SQL Editor**, run:

```sql
-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
```

### 5.2 Add RLS Policies

**For `entries` table:**

```sql
-- SELECT: Users see only their own entries
CREATE POLICY "entries_select_own"
ON entries FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own entries
CREATE POLICY "entries_insert_own"
ON entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own entries
CREATE POLICY "entries_update_own"
ON entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own entries
CREATE POLICY "entries_delete_own"
ON entries FOR DELETE
USING (auth.uid() = user_id);
```

**For `insights` table:**

```sql
-- SELECT: Users see only their own insights
CREATE POLICY "insights_select_own"
ON insights FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: App can insert insights for users (server-side trigger)
CREATE POLICY "insights_insert_own"
ON insights FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**For `user_preferences` table:**

```sql
-- SELECT: Users see only their own preferences
CREATE POLICY "user_preferences_select_own"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can insert their own preferences
CREATE POLICY "user_preferences_insert_own"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own preferences
CREATE POLICY "user_preferences_update_own"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## Step 6: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be by default)
3. Go to **Email Templates** and review (optional: customize welcome emails)

### Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add **Redirect URLs:**
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

---

## Step 7: Verify Setup

### Test the Schema

In **SQL Editor**, run:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('entries', 'insights', 'user_preferences');
```

You should see all three tables with `rowsecurity = true`.

### Test a Query (after deploying the app)

1. Create an account in the app
2. Add a food entry
3. In Supabase, go to **Table Editor** → **entries**
4. You should see one row with your entry

✅ If you see the entry, everything is set up correctly!

---

## Troubleshooting

### "Permission denied" errors

**Problem:** RLS policies are too restrictive
**Solution:** Check that `auth.uid()` matches `user_id` in the data

### "No entries showing"

**Problem:** User ID mismatch
**Solution:** 
1. In **Supabase dashboard**, go to **Authentication** → **Users**
2. Copy the user's UID
3. Compare with the `user_id` in your entry

### Slow queries

**Problem:** Missing indexes
**Solution:** The SQL script includes indexes. If slow, verify they exist:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'entries';
```

---

## Next Steps

- Deploy to Vercel (see main README)
- Set up email notifications (Supabase → Email)
- Add analytics (Supabase → Logs)

