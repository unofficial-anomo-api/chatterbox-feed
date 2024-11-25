# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Self-Hosting Guide

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### Step 1: Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Once created, go to Project Settings > Database and run these SQL commands to create the required tables:

```sql
-- Create required tables (posts, comments, profiles, etc)
-- Copy the SQL from your Supabase dashboard > SQL Editor
```

3. Set up authentication:
   - Go to Authentication > Settings
   - Configure your desired auth providers (Email, GitHub, etc)
   - Note down your project URL and anon key from Project Settings > API

### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Build and Deploy

1. Build the project:
```sh
npm run build
```

2. The built files will be in the `dist` directory. You can deploy these files to any static hosting service:

**Option 1: Deploy to Netlify**
```sh
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy
```

**Option 2: Deploy to Vercel**
```sh
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Option 3: Use any static hosting**
- Upload the contents of the `dist` directory to your web server
- Ensure all routes redirect to `index.html` for client-side routing
- Configure CORS if needed

### Step 4: Post-Deployment

1. Update your Supabase project settings:
   - Add your deployment URL to the allowed domains in Authentication > URL Configuration
   - Configure any additional security policies in Database > Policies

2. Test the deployment:
   - Try signing up/logging in
   - Verify database operations work
   - Check real-time updates if used

### Troubleshooting

Common issues and solutions:

1. **Authentication not working**
   - Verify your environment variables are correct
   - Check allowed domains in Supabase
   - Ensure SSL is enabled if required

2. **Database operations failing**
   - Check Row Level Security (RLS) policies
   - Verify table structures match expected schema
   - Check network requests for specific error messages

3. **Build failing**
   - Make sure all dependencies are installed
   - Check Node.js version compatibility
   - Verify environment variables are set correctly

For additional help, check the [Supabase documentation](https://supabase.com/docs) or open an issue in the project repository.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase for backend services

## How can I deploy this project?

You can either:
1. Use Lovable's built-in deployment: Open [Lovable](https://lovable.dev/projects/13324c81-c490-4308-9998-3154aae5b0a4) and click on Share -> Publish
2. Follow the self-hosting guide above to deploy it yourself

## I want to use a custom domain - is that possible?

Yes! You can:
1. Use Lovable's deployment with a custom domain by following our docs: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
2. When self-hosting, configure your domain with your chosen hosting provider