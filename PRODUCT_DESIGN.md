# Mindful — Private Food Logging App

## 🧠 PRODUCT THINKING

### Philosophy
**Awareness without judgment.** The app doesn't try to change behavior—it creates space for honest reflection. We trust users to make their own decisions when they understand their patterns.

### UX Principles
1. **Frictionless logging**: Log food in under 3 seconds
2. **Psychological safety**: Language is neutral, supportive, never preachy
3. **Visual calm**: The interface should reduce anxiety, not amplify it
4. **Daily habit loop**: Low barrier to entry, satisfying feedback
5. **Privacy as trust**: Users own their data—no selling, no ads, no tracking

### Core Behaviors
- **Logging moment**: User enters food → timestamp auto-fills → entry appears immediately
- **Passive pattern detection**: App quietly learns from entries
- **Insight delivery**: Weekly, non-judgmental observations surface naturally
- **Timeline as mirror**: User sees their eating patterns without commentary

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary Brand:
- Lilac: #8B5CF6 (vibrant but calm)
  - Light: #EDE9FE
  - Dark: #6D28D9

Accent:
- Gold: #F59E0B
  - Light: #FEF3C7
  - Dark: #B45309

Neutral:
- Background: #FAFAFA
- Surface: #FFFFFF
- Text Primary: #1F2937
- Text Secondary: #6B7280
- Border: #E5E7EB
- Subtle: #F3F4F6
```

### Typography
**Font Stack**: `font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif`

```
Display: Inter 700 32px (headings, large)
Heading: Inter 600 24px (section titles)
Body: Inter 400 16px (content)
Label: Inter 500 12px (small UI)
Mono: 'Fira Code' 400 13px (data, timestamps)
```

### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
```

### Radius
```
Default: 8px
Pill: 12px
Card: 8px
```

---

## 🗂️ COMPONENT ARCHITECTURE

### Core Components
1. **LogEntry**: Timeline entry card with time, food, delete action
2. **LogForm**: Fast input + timestamp picker
3. **TimelineDay**: Group of entries for a single day
4. **InsightCard**: Pattern observation (non-judgmental)
5. **AuthForm**: Minimal signup/login
6. **Header**: Navigation, logout

### Pages
- `/` → Home (timeline)
- `/auth/login` → Login page
- `/auth/signup` → Signup page
- `/insights` → Weekly summaries
- `/settings` → User preferences

---

## 🗄️ DATABASE SCHEMA

### Tables
```sql
-- entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  logged_at TIMESTAMP NOT NULL,
  UNIQUE(id)
);

-- insights table (optional, for caching patterns)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50), -- 'late_night', 'repeated_meal', etc.
  data JSONB, -- flexible storage
  week_start DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### RLS Policies
```
entries:
  - SELECT: users can read own entries only (user_id = auth.uid())
  - INSERT: users can create for themselves
  - UPDATE: users can update own entries
  - DELETE: users can delete own entries

insights:
  - SELECT: users can read own insights only
  - (server-side triggers update these)

user_preferences:
  - SELECT: users can read own preferences
  - UPDATE: users can update own preferences
```

---

## 🎯 USER FLOWS

### Onboarding
1. User lands on login
2. Creates account (email + password)
3. Redirected to timeline (empty state)
4. First tip: "Log what you're about to eat"
5. User logs first entry

### Daily Usage
1. User opens app
2. Sees timeline of their eating patterns
3. Logs food in real-time (≤3 seconds)
4. Entry animates in, timestamp auto-fills
5. Can edit past entries (time or content)

### Weekly Insights
1. Every Monday, generate insights for past 7 days
2. Surface 1-3 patterns (late-night eating, repeated meals, snack frequency)
3. Use neutral language: "You logged 8 entries between 11 PM and 1 AM"
4. Optional: "No judgment here—just data."

---

## ✨ POLISH DETAILS

### Micro-interactions
- **Logging**: Input clears + entry slides in with subtle fade
- **Time editing**: Click time → inline picker appears (no modal)
- **Delete**: Swipe/hover → confirm → slide out
- **Empty state**: Centered, warm, encouraging

### Loading States
- Skeleton cards while fetching entries
- Optimistic UI updates (instant feedback)

### Error Handling
- Inline error messages (non-blocking)
- Retry buttons where appropriate
- Network error indicator (bottom right)

### Animations
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Fade transitions: 200ms
- Slide transitions: 300ms
- Hover scale: 1.02

---

## 🔒 PRIVACY & SECURITY

- **No tracking**: All processing happens on device or in user's database
- **No ads**: Revenue model TBD, but default is ad-free
- **User owns data**: Export feature coming soon
- **Secure defaults**: HTTPS only, secure cookies, CSRF protection
- **Language check**: No "bad", "cheat", "failure"—only neutral terms

---

## 📱 Responsive Design

- Mobile-first approach
- Touch-optimized logging interface
- Timeline card width: max-w-2xl (easily readable)
- Stacked on mobile, sidebar on desktop (future)

