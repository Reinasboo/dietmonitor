# Architecture & Technical Design

Deep dive into Mindful's architecture, design patterns, and key decisions.

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────┐
│       Browser (Next.js App Router)      │
│  - Pages & routes                       │
│  - Client components (Zustand store)    │
└──────────────┬──────────────────────────┘
               │ (HTTPS + JSON)
┌──────────────▼──────────────────────────┐
│      Supabase Client (Browser)          │
│  - Auth (session in httpOnly cookies)   │
│  - Real-time subscriptions              │
│  - Auto-retries with exponential backoff│
└──────────────┬──────────────────────────┘
               │ (Supabase Vectors API)
┌──────────────▼──────────────────────────┐
│   Supabase Backend (PostgreSQL + Auth)  │
│  - Row-Level Security (RLS)             │
│  - JWT verification                     │
│  - Connection pooling                   │
└─────────────────────────────────────────┘
```

---

## 📁 Folder Structure Explained

### `/app` — Next.js App Router

```
app/
├── (app)/                    # Route group (protected routes)
│   ├── layout.tsx           # Auth check + Header wrapper
│   ├── page.tsx             # Home (timeline)
│   ├── insights/page.tsx    # Weekly patterns
│   └── settings/page.tsx    # User preferences
│
├── auth/                     # Auth route group
│   ├── layout.tsx           # Centered auth UI
│   ├── login/page.tsx       # Email/password login
│   ├── signup/page.tsx      # Registration
│   ├── callback/page.tsx    # OAuth/magic link redirect
│   └── confirm-email/       # Email confirmation
│
├── layout.tsx               # Root layout (Meta, CSS)
└── globals.css              # Global Tailwind + animations
```

### `/components` — Reusable UI

Organized by feature, not by type:

```
components/
├── Header.tsx               # Navigation + logout
├── LogForm.tsx              # Quick entry input
├── LogEntry.tsx             # Single entry card
├── TimelineDay.tsx          # Group of entries
├── InsightCard.tsx          # Pattern observation
├── AuthForm.tsx             # Login/signup shared form
├── Button.tsx               # Base button (variants)
├── Input.tsx                # Base input (with label/error)
├── Empty.tsx                # Empty states + loading
└── index.ts                 # Barrel export
```

**Design principle:** Components are isolated, reusable, and independent of page structure.

### `/lib` — Utilities & Logic

```
lib/
├── supabase.ts              # Supabase client factory
├── database.types.ts        # TypeScript types (auto-gen from Supabase)
├── patterns.ts              # Pattern detection algorithms
├── store.ts                 # Zustand global state
└── date-utils.ts            # Date formatting + calculations
```

---

## 🔄 Data Flow

### Scenario: User logs a food entry

```
1. User types in LogForm
   ↓
2. Click "Log" button
   ↓
3. handleLogEntry() called
   ├─ setIsSubmitting(true)
   ├─ Get current session from Supabase Auth
   ├─ POST to Supabase: insert into entries
   │ └─ RLS checks if auth.uid() == user_id (enforced at DB level)
   ├─ On success: add to Zustand store (optimistic UI)
   ├─ Entry animates in (TailwindCSS keyframe)
   ├─ Form clears
   ├─ setIsSubmitting(false)
   └─ User sees their entry immediately

4. Timeline auto-updates (groupEntriesByDay)
   ↓
5. Next render: <TimelineDay> re-renders with new entry
```

### State Management (Zustand)

```typescript
// Global store (useEntryStore)
{
  entries: Entry[]              // All entries for current user
  loading: boolean              // Fetching entries
  error: string | null          // Last error
  setEntries: (entries) => void
  addEntry: (entry) => void
  removeEntry: (id) => void
  updateEntry: (id, updates) => void
  setLoading: (bool) => void
  setError: (error) => void
}
```

**Why Zustand?**
- Lightweight (no boilerplate)
- Easy to test
- Works great with Next.js 14 App Router
- No need for Redux/Context for simple state

---

## 🔐 Authentication Flow

### Signup

```
1. User fills email + password on /auth/signup
   ↓
2. handleSignup() → supabase.auth.signUp()
   ├─ Supabase creates user in auth.users table
   ├─ Sends confirmation email (magic link)
   ├─ Session is NOT created yet (email not verified)
   └─ Redirect to /auth/confirm-email
   
3. User clicks magic link in email
   ├─ Browser redirects to /auth/callback?code=...
   ├─ Callback page calls supabase.auth.exchangeCodeForSession()
   └─ Session is created + stored in httpOnly cookie
   
4. Browser redirected to /
   ├─ Root page checks session with supabase.auth.getSession()
   ├─ If session exists → navigate to /(app)
   └─ If no session → navigate to /auth/login
```

### Login

```
1. User fills email + password on /auth/login
   ↓
2. handleLogin() → supabase.auth.signInWithPassword()
   ├─ Supabase verifies credentials
   ├─ If valid → session created + httpOnly cookie set
   ├─ If invalid → error returned
   └─ Redirect to / on success
   
3. Root page detects session → navigate to /(app)
```

### Session Verification (in `(app)/layout.tsx`)

```typescript
useEffect(() => {
  // Check if session exists
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) router.push('/auth/login')
  })

  // Listen for auth changes (logout, etc.)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (!session) router.push('/auth/login')
  })

  return () => subscription.unsubscribe()
}, [])
```

---

## 📊 Pattern Detection Algorithm

### Approach: Lightweight client-side analysis

Located in `lib/patterns.ts`:

```typescript
// Main export
generateInsights(entries: Entry[]): Insight[]
  ├─ detectLateNightEating(entries)
  ├─ detectEarlyMorningEating(entries)
  ├─ detectRepeatedMeals(entries)
  └─ detectSnackFrequency(entries)
```

### Example: detectRepeatedMeals

```typescript
function detectRepeatedMeals(entries: Entry[]): Insight | null {
  const contentLower = entries.map(e => e.content.toLowerCase())
  
  // String similarity using Levenshtein distance
  // (allows for typos: "Indomie" vs "indomie" vs "Indomies")
  for each content {
    find similar entries (distance < 5)
    frequencies[content] = count
  }
  
  // Find most repeated
  mostRepeated = content with highest frequency
  
  if (mostRepeated && frequency >= 2) {
    return {
      type: 'repeated_meal',
      message: `You logged "${mostRepeated}" ${frequency} times`
    }
  }
}
```

**Why client-side?**
- Fast (no server round-trip)
- Privacy-preserving (not cached upstream)
- Works offline (future mobile app)

**Future enhancement:** Cache results in `insights` table for faster page loads.

---

## 🗄️ Database Schema Design

### Entries Table

```sql
id UUID PRIMARY KEY           -- Auto-generated
user_id UUID FK               -- Links to auth.users
content TEXT                  -- "2 packs Indomie + egg"
created_at TIMESTAMP          -- When logged in app
logged_at TIMESTAMP           -- When actually eaten (editable)
```

**Design decisions:**
- `logged_at` is separate from `created_at` (users edit past entries)
- No denormalization (keep it simple)
- Indexes on `user_id` and `logged_at` for fast queries

### RLS Policies

```sql
-- Example: SELECT policy
CREATE POLICY "entries_select_own" ON entries FOR SELECT
USING (auth.uid() = user_id)
```

**Why RLS?**
- Enforced at DB level (not app level)
- Prevents even SQL injection attacks
- Scales safely as app grows

---

## 🎨 Styling Architecture

### Tailwind + Custom Tokens

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      lilac: { 50, 100, 200, ... 950 }  // Lilac palette
      gold: { 50, 100, 200, ... 950 }   // Gold palette
    }
    spacing: { xs, sm, md, lg, xl, ... } // 4px base unit
    animation: {
      'fade-in': ...
      'slide-in': ...
    }
  }
}
```

### Component Styling Pattern

```tsx
// Button component
const variantStyles = {
  primary: 'bg-lilac-600 text-white hover:bg-lilac-700 focus:ring-lilac-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  // ...
}

return <button className={clsx(baseStyles, variantStyles[variant], ...)} />
```

**Why?**
- No CSS files to maintain
- Type-safe (variant prop is enum)
- Composable (mix and match)
- Easy to audit (all styles visible in component)

---

## 🚀 Performance Optimizations

### 1. Image Optimization
- Next.js `next/image` (auto-optimize + lazy load)
- Used for emoji in Header

### 2. Code Splitting
- App Router = automatic per-route code splitting
- Auth routes are only loaded when user accesses /auth

### 3. Caching Headers
```typescript
// next.config.js
headers: async () => [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ]
  }
]
```

### 4. Database Indexing
- Index on `entries(user_id)` — fast user lookups
- Index on `entries(logged_at DESC)` — fast timeline sort

### 5. Client-Side State
- Zustand store (minimal re-renders)
- Optimistic updates (no loading spinner)

---

## 🧪 Testing Strategy

### Unit Tests (Future)

```typescript
// test/patterns.test.ts
describe('detectLateNightEating', () => {
  it('should detect entries between 11 PM and 3 AM', () => {
    const entries = [
      { logged_at: '2024-01-01T23:30:00Z' },
      { logged_at: '2024-01-02T02:00:00Z' },
    ]
    const insight = detectLateNightEating(entries)
    expect(insight?.type).toBe('late_night')
  })
})
```

### E2E Tests (Future)

```typescript
// e2e/logging.spec.ts
test('user can log food and see it in timeline', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')
  await page.waitForURL('/')
  
  await page.fill('[name=content]', 'Indomie + egg')
  await page.click('button:has-text("Log")')
  
  expect(page.locator('text=Indomie + egg')).toBeVisible()
})
```

---

## 🔍 Error Handling

### Try-Catch Pattern

```typescript
const handleLogEntry = async (content, loggedAt) => {
  try {
    // Validate
    if (!content.trim()) throw new Error('Please enter what you ate')
    
    // Auth
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    
    // Execute
    const { data, error: insertError } = await supabase
      .from('entries')
      .insert([...])
    
    if (insertError) throw insertError
    
    // Update UI
    addEntry(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed')
  } finally {
    setIsSubmitting(false)
  }
}
```

### Error Messaging
- Show error to user (banner)
- Don't disappear automatically (user must acknowledge)
- Retry button for network errors

---

## 🔮 Future Architectures

### WebSocket for Real-Time
```typescript
// Could add live updates across browsers
const subscription = supabase
  .from('entries')
  .on('INSERT', (payload) => {
    addEntry(payload.new)
  })
  .subscribe()
```

### Server-Side Analytics
```typescript
// Trigger function in Supabase
CREATE FUNCTION generate_weekly_insights()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate insights on INSERT/UPDATE
  -- Store in insights table
  RETURN NEW
END
$$ LANGUAGE PLPGSQL
```

### Offline Support (Mobile)
```typescript
// SQLite local DB (React Native)
// Sync with Supabase when online
```

---

## 📚 Key Dependencies

| Package | Why |
|---------|-----|
| `next` | Framework (App Router) |
| `@supabase/auth-helpers-nextjs` | Auth middleware |
| `zustand` | Lightweight state |
| `tailwindcss` | Styling |
| `date-fns` | Date utilities |
| `clsx` | Conditional CSS |
| `lucide-react` | Icons |

---

## 🎯 Design Principles

### 1. **Simplicity First**
- No over-abstraction
- Use built-in tools (Tailwind > CSS-in-JS)
- Server Components by default (client when needed)

### 2. **Security by Default**
- RLS on all tables
- HTTPS only, httpOnly cookies
- No secrets in env (public keys safe to expose)

### 3. **Privacy First**
- User owns their data
- No tracking, analytics, or ads
- Minimal data collection

### 4. **Performance over Features**
- Fast page loads
- Optimistic UI updates
- Client-side state when possible

### 5. **Accessibility Matters**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation throughout
- Focus management

---

## 🚢 Deployment Checklist

- [ ] Environment variables set (NEXT_PUBLIC_SUPABASE_URL, key)
- [ ] Supabase project active and tables created
- [ ] RLS policies applied
- [ ] Redirect URLs updated (production domain)
- [ ] CORS configured (if needed)
- [ ] SSL certificate valid
- [ ] Analytics enabled (optional)
- [ ] Error reporting configured (Vercel Logs)

---

This architecture prioritizes **simplicity, security, and performance**. It's built to scale without adding complexity.

