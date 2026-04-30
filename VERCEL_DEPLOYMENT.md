# Vercel Deployment Guide

## Quick Start

Your **Mindful** app is now ready to deploy to Vercel! Follow these steps:

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your account (or create one)
3. Click "Add New..." → "Project"
4. Select "Import Git Repository"
5. Paste your repo URL: `https://github.com/Presolito/Dietree.git`
6. Vercel will auto-detect it as a Next.js project

### 2. Configure Environment Variables

When Vercel prompts you to add environment variables, configure:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
- Go to your Supabase project settings
- Copy the API URL and the `anon` public key
- Paste them into Vercel environment variables

### 3. Set Up Supabase Database

Before your app can work, you must create the database tables in Supabase:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the setup SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
4. This creates the required tables with Row-Level Security policies

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, you'll get a live URL

### 5. Test Your App

1. Visit your Vercel deployment URL
2. Create an account (email will need verification)
3. Log in and start logging food entries
4. Visit `/insights` to see pattern detection
5. Visit `/settings` for preferences

## Troubleshooting

### Build Fails: "Module not found"
- Ensure all environment variables are set correctly
- Check that your Supabase project exists and credentials are valid

### Can't Log In or Get Database Errors
- Verify Supabase database tables exist (run SQL from SUPABASE_SETUP.md)
- Check that Row-Level Security policies are enabled
- Confirm environment variables are correct

### Styling Issues
- Vercel should auto-detect Tailwind CSS
- If styles are broken, clear your browser cache
- Rebuild the project in Vercel dashboard

## Next Steps

- **Custom Domain**: In Vercel project settings, add your own domain
- **Development**: To work locally, run `npm run dev` after `npm install`
- **Git Workflow**: Push changes to GitHub, Vercel auto-deploys on main branch

## Need Help?

See the full documentation in:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [START_HERE.md](./START_HERE.md) - Project overview
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
