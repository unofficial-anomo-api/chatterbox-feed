# Database Setup Guide

## Supabase Configuration

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings > Database
3. Run the SQL commands from our [database setup SQL file](../supabase/schema.sql)

## Environment Setup

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Post-Setup Steps

1. Configure authentication providers in Supabase dashboard
2. Add your deployment URL to allowed domains
3. Test all database operations
4. Verify real-time updates if used

For detailed help, check the [Supabase documentation](https://supabase.com/docs)