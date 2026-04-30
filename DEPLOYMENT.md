# ⚡ Deployment Guide

Deploy your Mindful app to production in under 5 minutes.

---

## 🚀 Deploy to Vercel (Easiest)

### Step 1: Prepare Your Git Repository

```bash
cd website
git init
git add .
git commit -m "Initial commit: Mindful food logger"
git remote add origin https://github.com/YOUR_USERNAME/mindful.git
git push -u origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (easier)
3. Click "New Project"

### Step 3: Connect Your Repository

1. Click **"Select a Git Repository"**
2. Authorize Vercel to access GitHub
3. Select `YOUR_USERNAME/mindful`
4. Click **"Import"**

### Step 4: Add Environment Variables

In Vercel, under **"Configure Project"**:

1. Click **"Environment Variables"**
2. Add these (from your Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

3. Click **"Deploy"**

### Step 5: Update Supabase Redirect URLs

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Vercel domain:
   - `https://mindful-xyz.vercel.app/auth/callback`
   - (or your custom domain if you have one)

### Step 6: Done! 🎉

Your app is live at `https://mindful-xyz.vercel.app`

---

## 🌐 Add Custom Domain

### Option A: Domain Registrar's DNS

1. In Vercel: **Project Settings** → **Domains**
2. Add your domain (e.g., `mindful.com`)
3. Copy the CNAME record
4. Add to your domain registrar's DNS settings
5. Wait 24 hours for propagation

### Option B: Vercel Nameservers

1. Point your domain's nameservers to Vercel
2. Let Vercel manage DNS
3. Faster than CNAME method

---

## 📊 Set Up Analytics (Optional)

### Vercel Analytics

1. In Vercel: **Project Settings** → **Analytics**
2. Click **"Enable Vercel Analytics"**
3. Automatic insights (no code changes needed)

### Supabase Logs

1. Go to Supabase Dashboard
2. **Logs** → View query performance

---

## 🔐 Security in Production

### HTTPS (Automatic)
- ✅ Vercel provides free SSL/TLS
- ✅ Auto-renews every 90 days
- ✅ Always enabled

### Environment Variables
- ✅ Safe in Vercel (encrypted at rest)
- ✅ Never exposed to client (unless `NEXT_PUBLIC_`)
- ✅ Rotate regularly

### Supabase Security
- ✅ RLS policies enforced
- ✅ Backup automatic (daily)
- ✅ DDoS protection included

---

## 📈 Monitoring & Logs

### Vercel Logs
```bash
# See deployment logs
vercel logs

# Stream real-time logs (if using CLI)
vercel logs --follow
```

### Supabase Logs
- **Dashboard** → **Logs** → See query performance
- **Edge Functions** → Error logs (if using functions)

### Error Tracking (Future)
Consider adding **Sentry** for production error tracking:
```bash
npm install @sentry/nextjs
```

---

## 🔄 Continuous Deployment

Vercel auto-deploys on every push:

```bash
# Make changes locally
git commit -m "Add new feature"
git push origin main

# Vercel auto-builds & deploys
# Check: https://vercel.com/dashboard → Your Project
```

To preview changes **before** merging:
- Create a new branch: `git checkout -b feature/new-thing`
- Push: `git push origin feature/new-thing`
- Vercel creates a preview deployment
- Merge when satisfied

---

## 🪲 Debugging in Production

### Issue: App shows 404

**Solution:**
- Check Vercel build logs (should see "Build successful")
- Ensure routes are in `/app` (App Router)
- Clear browser cache

### Issue: "Not authenticated" error

**Solution:**
- Go to Supabase → Authentication → Users
- Verify user was created
- Check auth.users table has your test user

### Issue: Entries not showing

**Solution:**
- Supabase → Table Editor → entries
- Check entries exist for your user_id
- Verify RLS policies aren't too strict

### Issue: Environment variables not working

**Solution:**
1. Verify they're in Vercel dashboard
2. Redeploy: **Settings** → **Deployments** → **Redeploy Latest**
3. Check env vars are `NEXT_PUBLIC_*` (for browser)

---

## 🚨 Troubleshooting Deployment

### Build Fails

```
Error: Failed to compile
```

**Solution:**
1. Check TypeScript errors: `npm run type-check`
2. Fix locally, commit, push
3. Vercel auto-rebuilds

### Blank Page

**Solution:**
1. Open DevTools (F12) → Console
2. Check for errors
3. Look at Vercel logs

### Slow Performance

**Solution:**
1. Vercel Analytics → Check **Web Vitals**
2. Database queries too slow? Add indexes (see SUPABASE_SETUP.md)
3. Images not optimized? Use `next/image`

---

## 📝 Production Checklist

Before going public:

- [ ] Domain set up (or using vercel.app)
- [ ] Supabase redirect URLs configured
- [ ] RLS policies tested + verified
- [ ] Test user signup works
- [ ] Test food logging works
- [ ] Test insights appear
- [ ] Analytics enabled (optional)
- [ ] Backup Supabase project (optional)
- [ ] Error handling looks good

---

## 🔄 Rollback (If Needed)

### Revert to Previous Deployment

1. Vercel Dashboard → Your Project
2. **Deployments** tab
3. Find last good deployment
4. Click **⋮** → **Promote to Production**

Done! ✅

---

## 🎯 Performance Optimization Tips

### 1. Database Queries
- Ensure indexes on `user_id` and `logged_at`
- Use pagination for large datasets (future)

### 2. Frontend Bundle
- Code splitting is automatic (per-route)
- Dynamic imports if needed (large components)

### 3. Images
- Already using emoji (lightweight)
- Use `next/image` for any future photos

### 4. Caching
- Vercel caches ISR (Incremental Static Regeneration)
- Browser caches images
- Add CDN headers for static assets (advanced)

---

## 💰 Cost Estimate

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Sufficient for ~10k users

### Supabase (Free Tier)
- ✅ 500 MB database
- ✅ Auth included
- ✅ Should support ~1k users comfortably

**Total cost to start:** $0

**When to upgrade:**
- Traffic > 100k users/month → Vercel Pro ($20/month)
- Database > 500 MB → Supabase Pro ($25/month)

---

## 🤝 Collaboration

### Share Deployments

```bash
# Anyone with the link can preview
https://mindful-xyz.vercel.app
```

### Team Access

1. Vercel Dashboard → Settings
2. **Team** → Add members
3. Grant permissions (deploy, manage, etc.)

---

## 🔮 Next Steps After Deployment

1. **Monitor** — Check analytics weekly
2. **Gather feedback** — Ask early users for UX feedback
3. **Iterate** — Add features based on feedback
4. **Scale** — Upgrade Supabase/Vercel as needed

---

## 📞 Support

### Deployment Issues?

1. Check [Vercel Docs](https://vercel.com/docs)
2. Check [Supabase Docs](https://supabase.com/docs)
3. Check browser DevTools (F12) for errors

### Common Issues

- **CORS errors:** Add Supabase redirect URL
- **Auth not working:** Check environment variables
- **Database connection slow:** Check indexes

---

## 🎉 Congrats!

Your app is now live on the internet.

**Next:** Share it with early users and gather feedback! 🚀

