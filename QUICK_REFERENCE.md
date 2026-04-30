# 🧠 Mindful — Quick Reference

One-page summary of everything you need to know.

---

## ⚡ 5-Minute Quick Start

```bash
# 1. Install
npm install

# 2. Create .env.local (from Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Follow SUPABASE_SETUP.md (2 minutes)
# Create project, copy keys, create tables

# 4. Run
npm run dev
# → http://localhost:3000
```

---

## 📚 Documentation Index

| What You Need | Where to Find It |
|---------------|------------------|
| **Feature overview** | README.md |
| **Setup locally** | Quick Start ↑ |
| **Set up backend** | SUPABASE_SETUP.md |
| **Design system** | PRODUCT_DESIGN.md |
| **Technical architecture** | ARCHITECTURE.md |
| **Animations/polish** | POLISH.md |
| **Deploy to production** | DEPLOYMENT.md |
| **Full project summary** | BUILD_SUMMARY.md |

---

## 🎨 Design at a Glance

```
Colors:
└─ Lilac (#8B5CF6) — Primary, calm, trustworthy
└─ Gold (#F59E0B) — Accent, warmth
└─ Grays — Professional, accessible

Typography:
└─ Inter — Clean, modern body text
└─ Fira Code — Precise timestamps

Spacing:
└─ 4px base unit (xs, sm, md, lg, xl, 2xl, 3xl)

Radius:
└─ 8px default (rounded-pill for UI elements)
```

---

## 🗂️ File Structure Overview

```
app/
├── (app)/              ← Protected routes
│   ├── page.tsx       ← Timeline/Home
│   ├── insights/      ← Weekly patterns
│   └── settings/      ← Preferences
├── auth/              ← Auth pages
│   ├── login/
│   ├── signup/
│   └── callback/
└── layout.tsx         ← Root layout

components/           ← Reusable UI
├── Header.tsx
├── LogForm.tsx
├── LogEntry.tsx
├── TimelineDay.tsx
├── InsightCard.tsx
├── AuthForm.tsx
├── Button.tsx
├── Input.tsx
└── Empty.tsx

lib/                  ← Core logic
├── supabase.ts       ← Client setup
├── patterns.ts       ← Pattern detection
├── store.ts          ← State (Zustand)
├── date-utils.ts     ← Date helpers
└── database.types.ts ← TypeScript types
```

---

## 🔐 Security Checklist

- ✅ All tables have RLS enabled
- ✅ Users can only see their own entries
- ✅ Enforced at database level (not app level)
- ✅ Auth stored in httpOnly cookies (XSS-safe)
- ✅ No sensitive data in `.env.local`
- ✅ HTTPS in production (automatic on Vercel)

---

## 🧠 Pattern Detection Features

| Pattern | Detects | Message Style |
|---------|---------|---------------|
| 🌙 Late Night | 11 PM - 3 AM | "You logged 8 entries..." |
| 🌅 Early Morning | 5 AM - 8 AM | "You logged 5 entries..." |
| 🔄 Repeated Meals | Same food 2+ times | "You logged Indomie 3 times..." |
| 🍿 Snack Frequency | Snack keywords | "You logged 7 snack entries..." |

**Philosophy:** Always neutral, never judgmental.

---

## 🚀 Key Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm start             # Start production server
npm run type-check    # Check TypeScript
npm run lint          # Check code quality
```

---

## 🌐 Deployment in 3 Steps

1. **Connect GitHub** → Vercel
2. **Add env vars** → Supabase keys
3. **Update Supabase** → Add Vercel domain to redirect URLs

**Result:** Live app at `https://your-domain.vercel.app` 🎉

---

## 🧪 Testing Scenarios

### Signup Flow
1. Click "Sign up"
2. Enter email + password
3. Check email for confirmation link
4. Click link → Redirected to login
5. Login with same credentials
6. Redirected to home page ✅

### Logging Food
1. Type "2 packs Indomie + egg"
2. Time auto-fills (editable)
3. Click "Log"
4. Entry appears with animation ✅

### View Insights
1. Click "Insights" (top nav)
2. Should see patterns from past 7 days
3. Empty if <3 entries ✅

### Edit Entry
1. Hover over entry card
2. Click edit icon
3. Modify content/time
4. Click checkmark
5. Entry updates ✅

### Delete Entry
1. Hover over entry card
2. Click trash icon
3. Entry animates out ✅

---

## 🐛 Debugging Tips

```bash
# TypeScript errors
npm run type-check

# Build errors
npm run build

# Browser console (F12)
# Look for Supabase errors or missing env vars

# Supabase Dashboard
# Check: SQL Editor → View tables + policies
# Check: Authentication → Users table
# Check: Logs → See query performance
```

---

## ⚙️ Environment Variables

```env
# Required (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
NODE_ENV=development  # or 'production'
```

**Note:** `NEXT_PUBLIC_*` prefix = safe for browser (public keys).

---

## 📊 Database Essentials

### Tables
- `entries` — Food logs
- `insights` — Cached patterns
- `user_preferences` — User settings

### RLS Policies
- ✅ SELECT: See own entries only
- ✅ INSERT: Create own entries only
- ✅ UPDATE: Edit own entries only
- ✅ DELETE: Delete own entries only

### Indexes
- `entries(user_id)` — Fast user lookups
- `entries(logged_at DESC)` — Fast timeline sort

---

## 🎬 Animation Principles

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| Slide In | 300ms | Spring | Entry appears |
| Fade In | 200ms | Linear | Content appears |
| Slide Out | 300ms | Spring | Entry deletes |
| Hover Scale | 200ms | Ease | Button feedback |
| Pulse | 2s | Linear | Today indicator |

---

## 💡 Best Practices

### When Adding Features
1. Create component in `/components`
2. Add TypeScript types
3. Use Tailwind for styling (no CSS files)
4. Add loading + error states
5. Test in browser + edge cases

### Database Queries
1. Always filter by `user_id` (RLS)
2. Use indexes for sorting
3. Avoid `SELECT *` (specify columns)
4. Cache insights weekly (future)

### Performance
- Use optimistic UI (add entry before server validates)
- Pagination for large lists (future)
- Code splitting happens automatically per route
- Zustand store for shared state

---

## 🔗 Important Docs

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 🎯 Success Metrics

Your app is **working correctly** when:

- ✅ Users can sign up without errors
- ✅ Entries appear immediately after logging
- ✅ Timeline groups entries by day
- ✅ Insights page shows patterns after 3+ entries
- ✅ Editing/deleting works smoothly
- ✅ No console errors (F12)
- ✅ Responsive on mobile + desktop
- ✅ RLS verified (can't see other users' data)

---

## 🚀 Going Live

```
Local Testing       Vercel Staging      Production
    ↓                     ↓                  ↓
npm run dev   ← Git push ← Preview Link → Custom Domain
```

1. Test locally (npm run dev)
2. Push to GitHub
3. Vercel auto-creates preview
4. Add custom domain when ready
5. Update Supabase redirect URL
6. Launch! 🎉

---

## 💬 Asking for Help

Provide:
1. What were you trying to do?
2. What error did you see? (screenshot: F12 → Console)
3. What steps did you take?

**Check first:**
- SUPABASE_SETUP.md (env vars, tables, RLS)
- ARCHITECTURE.md (how data flows)
- Browser console (F12 for errors)

---

## 🎉 Next Steps

1. **Run locally** → npm run dev
2. **Follow SUPABASE_SETUP.md** (create backend)
3. **Test user signup + logging**
4. **Deploy to Vercel** (DEPLOYMENT.md)
5. **Share with users**
6. **Gather feedback**
7. **Iterate** 🚀

---

## 📞 Remember

- **This is production-ready code** — not a template
- **Design is premium** — no generic look
- **Security is enforced** — RLS at database level
- **Documentation is comprehensive** — read them!
- **Privacy is respected** — no tracking, ads, or data selling

You have everything you need. **Go build!** 🧠

