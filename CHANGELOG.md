# Changelog — Ethereal Lens Studio

## 2026-03-08 — Codebase Cleanup & Quick Wins

### 1. Strict TypeScript Enabled

**Files changed:** `tsconfig.app.json`, `tsconfig.json`

Turned on strict type checking across the project:

```
strict: true
noImplicitAny: true
noUnusedLocals: true
noUnusedParameters: true
noFallthroughCasesInSwitch: true
strictNullChecks: true
```

**Why:** Catches bugs at compile time, improves code quality, and prevents common mistakes like null reference errors.

---

### 2. Fixed Strict Mode Type Errors

**Files changed:**
- `src/components/ScrollStorySection.tsx` — Removed unused `index` parameter from `StoryBlock` component props and call site
- `src/components/ui/calendar.tsx` — Removed unused `_props` spread from `IconLeft` and `IconRight` components

**Errors fixed:** 3

---

### 3. Cleaned Up Dual Toast System

**Kept:** Sonner (the toast library actually used by the contact form)

**Removed:**
- `src/components/ui/toaster.tsx` — shadcn/ui Toaster component (unused)
- `src/components/ui/toast.tsx` — shadcn/ui Toast primitives (unused)
- `src/components/ui/use-toast.ts` — shadcn/ui toast re-export (unused)
- `src/hooks/use-toast.ts` — shadcn/ui toast state hook (unused)

**Modified:**
- `src/components/ui/sonner.tsx` — Removed `next-themes` import, hardcoded `theme="light"` since the app has no dark mode toggle
- `src/App.tsx` — Removed `<Toaster />` (shadcn), kept `<Sonner />`

**Why:** Two competing toast systems caused confusion. The app only uses Sonner's `toast()` function (in the contact form), so the shadcn toast system was dead code.

---

### 4. Removed Unused Dependencies

**Uninstalled 12 packages:**

| Package | Reason for removal |
|---|---|
| `@tanstack/react-query` | Configured in App.tsx but no queries or mutations anywhere |
| `@hookform/resolvers` | Never imported — forms use raw `useState` |
| `react-hook-form` | Never imported — forms use raw `useState` |
| `zod` | Never imported — no schema validation in use |
| `recharts` | Never imported — no charts in the app |
| `next-themes` | Next.js-specific — this is a Vite app |
| `react-resizable-panels` | Never imported |
| `input-otp` | Never imported |
| `cmdk` | Never imported |
| `@radix-ui/react-toast` | Removed with shadcn toast system |
| `lovable-tagger` | Dev-only AI scaffold tagger, no longer needed |

**Also removed `QueryClientProvider` wrapper** from `App.tsx` since React Query was uninstalled.

**Also removed `lovable-tagger`** from `vite.config.ts` plugin array and simplified the config from a function to a plain object.

---

### 5. Deleted Dead Files

| File | Reason |
|---|---|
| `src/App.css` | Default Vite template CSS, never imported |
| `src/components/NavLink.tsx` | Custom NavLink wrapper, never imported by any component |
| `src/components/ui/input-otp.tsx` | Depended on removed `input-otp` package |
| `src/components/ui/chart.tsx` | Depended on removed `recharts` package |
| `src/components/ui/form.tsx` | Depended on removed `react-hook-form` package |
| `src/components/ui/resizable.tsx` | Depended on removed `react-resizable-panels` package |
| `src/components/ui/command.tsx` | Depended on removed `cmdk` package |

---

### 6. Restructured Folder Layout

**Before:**
```
src/components/
  ├── Navigation.tsx
  ├── HeroSection.tsx
  ├── ScrollStorySection.tsx
  ├── PortfolioSection.tsx
  ├── ServicesSection.tsx
  ├── AboutSection.tsx
  ├── TestimonialsSection.tsx
  ├── ContactSection.tsx
  ├── Footer.tsx
  └── ui/
```

**After:**
```
src/components/
  ├── layout/
  │   ├── Navigation.tsx
  │   └── Footer.tsx
  ├── sections/
  │   ├── HeroSection.tsx
  │   ├── ScrollStorySection.tsx
  │   ├── PortfolioSection.tsx
  │   ├── ServicesSection.tsx
  │   ├── AboutSection.tsx
  │   ├── TestimonialsSection.tsx
  │   └── ContactSection.tsx
  └── ui/
```

**Updated imports** in `src/pages/Index.tsx` to use the new paths.

**Why:** Separates layout (persistent across pages) from sections (page-specific content blocks), which will be important as more pages are added (booking, gallery, etc.).

---

### 7. Simplified App.tsx Provider Tree

**Before:**
```
QueryClientProvider → TooltipProvider → Toaster + Sonner → BrowserRouter
```

**After:**
```
TooltipProvider → Sonner → BrowserRouter
```

---

## Verification

| Check | Status |
|---|---|
| TypeScript (`tsc --noEmit`) | 0 errors |
| Production build (`vite build`) | Passes (416 KB JS → 134 KB gzip) |
| Tests (`vitest run`) | 1/1 passing |
| Dev server (`vite dev`) | Running on http://localhost:8080 |

---

## Current Project Structure

```
src/
  ├── main.tsx                          # Entry point
  ├── App.tsx                           # Root component + routing
  ├── index.css                         # Global styles + Tailwind + CSS variables
  ├── vite-env.d.ts                     # Vite type declarations
  │
  ├── pages/
  │   ├── Index.tsx                     # Landing page
  │   └── NotFound.tsx                  # 404 page
  │
  ├── components/
  │   ├── layout/
  │   │   ├── Navigation.tsx            # Sticky glassmorphism navbar
  │   │   └── Footer.tsx                # Site footer + social links
  │   ├── sections/
  │   │   ├── HeroSection.tsx           # Full-screen hero with parallax
  │   │   ├── ScrollStorySection.tsx    # Scroll-driven parallax stories
  │   │   ├── PortfolioSection.tsx      # Image grid + lightbox
  │   │   ├── ServicesSection.tsx       # Service cards with pricing
  │   │   ├── AboutSection.tsx          # Photographer bio + stats
  │   │   ├── TestimonialsSection.tsx   # Auto-rotating testimonial carousel
  │   │   └── ContactSection.tsx        # Booking form (Sonner toast)
  │   └── ui/                           # shadcn/ui primitives (~35 components)
  │
  ├── hooks/
  │   └── use-mobile.tsx                # Viewport breakpoint detection
  │
  ├── lib/
  │   └── utils.ts                      # cn() utility
  │
  ├── assets/                           # Static JPG images
  │
  └── test/
      ├── setup.ts                      # Vitest setup
      └── example.test.ts               # Placeholder test
```

---

## Next Steps

The codebase is now clean and ready for backend integration. Recommended next phase:

1. **Supabase setup** — Database, auth, storage
2. **Booking system** — Wire contact form to Supabase + email confirmation
3. **Gallery delivery** — Password-protected client galleries
4. **Payments** — Stripe integration for deposits
5. **SEO** — Structured data, OG tags, image optimization
