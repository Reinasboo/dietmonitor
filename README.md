# Mindful — Private Food Logging App

> A premium, judgment-free personal food logging app for building awareness without pressure.

**Status:** Production-ready • **Tech:** Next.js 14 + Supabase + Tailwind • **License:** MIT

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Supabase account** (free tier works great) ([create](https://supabase.com))
- **Git**

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd website
npm install
```

### 2. Set Up Supabase

Follow the **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** guide to:
- Create a Supabase project
- Set up database tables
- Configure authentication
- Enable Row-Level Security

### 3. Add Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

(Use keys from Supabase → Settings → API)

### 4. Run Locally

```bash
npm run dev
```

Visit **http://localhost:3000** and start logging!

---

## 📖 Key Features

### ✨ Ultra-Fast Logging
- Free-text input: "2 packs Indomie + egg", "shawarma", etc.
- Auto timestamps (editable)
- ≤3 interactions to log

### 📅 Beautiful Timeline
- Chronological feed grouped by day
- Edit/delete past entries
- Smooth animations

### 🧠 Pattern Awareness
- Detects late-night eating
- Identifies repeated meals
- Tracks snacking frequency
- All in neutral, non-judgmental language

### 📊 Weekly Insights
- Simple summaries of your patterns
- Visual, calm presentation
- Zero preachy language

### 🔒 Privacy First
- Personal space—no social features
- No ads, no tracking
- You own your data
- Secure Supabase backend

---

## 🏗️ Architecture

### Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS (customized) |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **State** | Zustand |
| **Icons** | Lucide React |
| **Dates** | date-fns |

### Project Structure

```
website/
├── app/                        # Next.js App Router
│   ├── (app)/                  # Protected routes
│   │   ├── page.tsx            # Timeline (home)
│   │   ├── insights/           # Weekly insights
│   │   └── settings/           # User preferences
│   ├── auth/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/                 # Reusable components
│   ├── Header.tsx
│   ├── LogForm.tsx
│   ├── LogEntry.tsx
│   ├── TimelineDay.tsx
│   ├── InsightCard.tsx
│   ├── AuthForm.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Empty.tsx
├── lib/                        # Utilities & logic
│   ├── supabase.ts             # Supabase client
│   ├── database.types.ts       # TypeScript types
│   ├── patterns.ts             # Pattern detection
│   ├── store.ts                # Zustand store
│   └── date-utils.ts           # Date helpers
├── PRODUCT_DESIGN.md           # Design system
├── SUPABASE_SETUP.md           # Backend setup guide
├── tailwind.config.ts          # Tailwind customization
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🎨 Design Highlights

### Color System
- **Primary:** Lilac (`#8B5CF6`) — calm, welcoming
- **Accent:** Gold (`#F59E0B`) — warmth, positivity
- **Neutral grays** — professional, readable

### Design Principles
- **Minimal but rich:** Every element serves a purpose
- **Smooth micro-interactions:** Spring easing, subtle animations
- **Generous whitespace:** Reduces cognitive load
- **Premium polish:** Attention to detail elevates the experience

### Example Components
- **LogForm:** Lilac border with light background—inviting but focused
- **LogEntry:** Clean card with hover effects—minimal, elegant
- **InsightCard:** Emoji + neutral message—playful but never childish
- **Button:** Rounded with smooth transitions—premium feel

See [PRODUCT_DESIGN.md](./PRODUCT_DESIGN.md) for full design system.

---

## 🧠 Pattern Detection Logic

The app analyzes your entries to detect:

1. **Late-Night Eating** (23:00 - 03:00)
   - Message: "You logged 8 entries between 11 PM and 3 AM this week."

2. **Early Morning** (05:00 - 08:00)
   - Similar neutral messaging

3. **Repeated Meals**
   - Detects frequent entries (e.g., "Indomie" logged 3+ times)
   - Uses string similarity matching (Levenshtein distance)

4. **Snack Frequency**
   - Identifies snack-related keywords
   - Non-judgmental summaries

See [lib/patterns.ts](./lib/patterns.ts) for algorithm details.

---

## 🔒 Security & Privacy

### Row-Level Security (RLS)
- **Every query** is filtered by `WHERE user_id = auth.uid()`
- Users **cannot** see other users' data
- Enforced at database level (not app level)

### Authentication
- Supabase handles session management
- Magic links or email/password
- Tokens stored securely in httpOnly cookies

### Data Privacy
- ✅ No ads
- ✅ No tracking
- ✅ No data selling
- ✅ User owns their data
- ✅ HTTPS only

---

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"** → import your repo
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Click **"Deploy"**

Your app is live! 🎉

### Custom Domain

1. In Vercel: **Project Settings** → **Domains**
2. Add your domain
3. Update Supabase redirect URLs to include your domain

---

## 🛠️ Development

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## 📚 API Reference

### Supabase Tables

#### `entries`
```sql
id UUID
user_id UUID (FK → auth.users)
content TEXT
created_at TIMESTAMP
logged_at TIMESTAMP (user-editable)
```

#### `insights`
```sql
id UUID
user_id UUID (FK → auth.users)
insight_type VARCHAR (late_night | early_morning | repeated_meal | snack_frequency)
data JSONB
week_start DATE
created_at TIMESTAMP
```

#### `user_preferences`
```sql
id UUID
user_id UUID (FK → auth.users, unique)
timezone VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## 🐛 Troubleshooting

### "Connection refused" when starting the app
**Solution:** Supabase project is not running or keys are wrong
- Check `.env.local` has correct values
- Verify Supabase project is active

### "Auth session not found"
**Solution:** Browser cookies cleared
- Log back in

### Entries not showing after logging
**Solution:** User ID mismatch (RLS blocking data)
- Check Supabase → SQL Editor → View user IDs
- Verify `user_id` in entries table matches logged-in user

### Slow performance
**Solution:** Missing database indexes
- Run the full Supabase setup script (indexes included)

---

## 🚀 Future Features

- [ ] Export data (CSV + JSON)
- [ ] Photo logging (optional OCR)
- [ ] Mobile app (React Native)
- [ ] Sharing patterns with a friend (opt-in)
- [ ] Custom tags/categories
- [ ] Advanced analytics dashboard
- [ ] Meal recommendations (optional)

---

## 📄 License

MIT — feel free to fork and modify for personal use.

---

## 🤝 Support

Having issues? Check:
1. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Ensure backend is configured
2. [PRODUCT_DESIGN.md](./PRODUCT_DESIGN.md) — Understanding the design
3. GitHub Issues (if applicable)

---

## 💭 Philosophy

Mindful is built on the belief that **awareness precedes change**. We don't judge, shame, or try to "fix" you. We just create a space where you can honestly log what you eat, see your patterns emerge naturally, and decide what to do next.

No guilt. Just honesty.

---

Made with 🧠 and care. No ads, no tracking, just a simple tool to help you understand yourself better.

