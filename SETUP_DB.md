# Database Setup Instructions

## Quick Setup (Manual SQL)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
6. Click **Run** (or press `Cmd+Enter`)
7. Verify the tables were created by checking **Table Editor**

## Full CLI Setup (Recommended for Development)

### Install Supabase CLI

```bash
bun add -g supabase
```

### Link Your Project

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in your Supabase dashboard URL:
`https://app.supabase.com/project/[YOUR_PROJECT_REF]`

### Push Migrations

```bash
# Push all migrations to your remote database
supabase db push
```

### Alternative: Reset Database (WARNING: Deletes all data)

```bash
# This will drop all tables and rerun all migrations
supabase db reset --linked
```

## Verify Setup

After running the migration, verify by checking:

1. **Supabase Dashboard → Table Editor** - You should see:
   - profiles
   - sessions
   - journal_entries
   - mood_logs
   - philosophical_paths
   - widget_templates

2. **Check RLS Policies** - Go to **Authentication → Policies** to see all security rules

3. **Test in your app** - Try visiting `/onboarding` - the error should be gone

## Troubleshooting

### "relation already exists" error
The tables are already created. You're good to go!

### "permission denied" error
Make sure you're running the SQL as the project owner or with sufficient permissions.

### Tables not showing up
- Refresh the Table Editor page
- Check the SQL Editor for any error messages
- Verify you're connected to the correct project
