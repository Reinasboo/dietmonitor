# Polish Layer & Micro-Interactions

This document details the animations, transitions, and micro-interactions that elevate Mindful to a premium, polished experience.

---

## 🎬 Animation Strategy

### Timing
- **Quick feedback:** 200ms (immediate feel)
- **Transition:** 300ms (noticeable but snappy)
- **Long:** 2s+ (background/subtle)

### Easing
- **Spring:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — energetic, playful
- **Ease-in-out:** `cubic-bezier(0.4, 0, 0.2, 1)` — smooth, professional

---

## 📝 Logging Flow

### 1. Form Input
- **Border:** Lifts on focus (lilac-200 → lilac-500)
- **Background:** Subtle glow
- **Cursor:** Into text area

```css
/* In tailwind globally */
.rounded-pill {
  transition: all 200ms ease-in-out;
}

focus:ring-lilac-500 focus:border-lilac-500
```

### 2. Submit Button
- **Default:** Subtle shadow
- **Hover:** Slight scale up (1.02) + deeper shadow
- **Click:** Scale down (0.95) — tactile feedback
- **Loading:** Spinner animation

```tsx
// LoadingButton spins
<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
```

### 3. Entry Appears
- **Animation:** `animate-slide-in` (keyframe)
  - Enters from bottom with fade
  - Duration: 300ms, spring easing
- **Content clears:** Input field resets
- **Feedback:**  User sees entry immediately (optimistic UI)

Keyframe:
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🗂️ Timeline Interactions

### Entry Cards
- **Resting:** Subtle shadow, clean borders
- **Hover:** 
  - Border lightens to lilac-200
  - Shadow deepens
  - Edit/delete buttons fade in (opacity: 0 → 100%)
  - Small scale increase (1.01)

```tsx
className="group rounded-pill border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-lilac-200 hover:shadow-md"
// Buttons inside
className="opacity-0 transition-opacity group-hover:opacity-100"
```

### Delete Confirmation
- **On hover:** Delete button turns red
- **On click:** Slide out animation
  - `animate-slide-out`
  - Moves right while fading
  - Removes from DOM

```css
@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
```

### Day Sections
- **"Today" indicator:** Tiny pulse
  - `animate-pulse-subtle`
  - 2s loop
  - Draws subtle attention

```css
@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🧠 Insights Page

### Insight Cards
- **Entry:** `animate-slide-in` (staggered if multiple)
- **Emoji:** Scales in lightly
- **Message:** Fades and slides in together
- **Colors:** Soft backgrounds (indigo-50, orange-50, etc.)

### Empty State
- **Icon container:** Gentle background glow
- **Text:** Warm, supportive tone
- **CTA:** Implied (go back to timeline)

---

## 🔐 Auth Pages

### Login/Signup Form
- **Inputs:** Grow on focus
  - Scale: 1 → 1.01
  - Border expands
  - Glow appears

- **Submit Button:** 
  - Arrow icon pulls left slightly on load
  - On success: Green checkmark briefly shows
  - Redirect to home is fast but smooth

### Loading State
- **Spinner:** Lilac-colored border
  - Border-top is darker (lilac-600)
  - Smooth 1s rotation

---

## 💾 Loading States

### Skeleton Cards
- **Animation:** `animate-pulse`
  - Gray placeholders fade in/out
  - 2s loop
  - Indicates data is loading

```tsx
<div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
```

### Full Screen Loader
- **Background:** Transparent overlay (optional)
- **Spinner:** Center of screen
- **Text:** "Loading..." fades in below

---

## ⌨️ Keyboard Interactions

### Tab Navigation
- **Focus rings:** Lilac outline (2px) with offset
- **Skip links:** Accessible but hidden
- **Return key:** Submit form

```css
:focus-visible {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}
```

### Shortcuts (Future)
- `Cmd/Ctrl + J`: Open quick log
- `Cmd/Ctrl + N`: New entry
- `ESC`: Close modals

---

## 🎨 Color Transitions

### Hover States
- **Buttons:** Lilac-600 → Lilac-700
- **Cards:** Gray-200 → Lilac-200
- **Text:** Gray-700 → Gray-900

All transitions use `transition-colors duration-200`.

### Focus States
- Always: Ring (lilac-500)
- Dark mode: Auto-inverted (future enhancement)

---

## 📱 Touch Interactions (Mobile)

### Swipe Delete (Future)
- **Swipe right:** Animates to reveal delete
- **Swipe left:** Hides delete
- **Tap delete:** Confirms then slides out

### Touch Feedback
- **Active:** Slight scale down (0.98)
- **Release:** Scale back up
- No forced tap-highlight color (set to transparent)

```css
-webkit-tap-highlight-color: transparent;
```

---

## 🌙 Loading Spinner Rotation

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## ✨ Accessibility + Polish

### Reduced Motion
For users who prefer reduced motion, all animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

(Consider adding this if accessibility is critical)

### Focus Management
- When entry is added → focus returns to input
- When delete confirmed → focus to next entry
- Auth pages → focus on first input after mount

---

## 🎯 Final Polish Checklist

- ✅ All buttons have hover/active states
- ✅ Loading states show spinners or skeletons
- ✅ Forms clear after submission
- ✅ Delete has undo-friendly messaging (future: actual undo)
- ✅ Inputs have clear labels + hints
- ✅ Colors accessible (contrast ratios 4.5:1+)
- ✅ Animations < 350ms (users prefer snappy)
- ✅ Errors don't disappear (stay visible)
- ✅ Success feedback (entry appears, button changes)
- ✅ Empty states are helpful, not sad
- ✅ Copy is conversational + never judgmental

---

## 🚀 Performance Considerations

### Why animations feel smooth:
1. **GPU acceleration:** Use `transform` and `opacity` (not `top/left`)
2. **Will-change:** Used sparingly for heavy animations
3. **Debounced interactions:** No duplicate API calls
4. **Optimistic UI:** Entry appears before server confirms

### Optimizations:
```tsx
// Good (GPU-accelerated)
transform: translateY(8px)
opacity: 0

// Bad (CPU-intensive)
top: 8px
visibility: hidden
```

---

## 🎬 Animation Library

Currently using:
- **Tailwind CSS built-ins:** `animate-spin`, `animate-pulse`
- **Custom keyframes:** `slideIn`, `slideOut`, `pulseSubtle`
- **Framer Motion:** (installed but not required—Tailwind sufficient for MVP)

Could add **Framer Motion** for more complex sequences (staggered lists, page transitions).

---

## 🔮 Future Enhancements

- [ ] Page transitions (fade between routes)
- [ ] Staggered animation for lists
- [ ] Swipe gestures for mobile
- [ ] Undo animations
- [ ] Haptic feedback on mobile
- [ ] Dark mode transitions
- [ ] Confetti on milestones (optional!)

