# DAWN — Rise. Focus. Become.

A complete, privacy-conscious Progressive Web App (PWA) designed for personal self-improvement, Miracle Morning S.A.V.E.R.S. rituals, personal discipline / abstinence tracking, and compassionate daily guidance.

Specifically engineered **mobile-first** and optimized for compact displays such as the **iPhone SE (2nd gen, 375 x 667 CSS viewport)**, while adapting gracefully to modern smartphones, tablets, and desktop browsers.

---

## Features

### 1. Miracle Morning S.A.V.E.R.S. Rituals
- **Silence (S)**: Distraction-free meditation timer with a guided Box Breathing visualizer (Inhale / Hold / Exhale / Hold) and calming Web Audio Tibetan singing bowl chimes.
- **Affirmations (A)**: Original empowering statements of identity and values, user-created custom affirmations, favorite pinning, and category filtering.
- **Visualization (V)**: Personal goals vision board, guided reflection prompts, and offline image storage (saved directly into IndexedDB).
- **Exercise (E)**: Activity timer, movement presets (Yoga, Calisthenics, Walking, HIIT), intensity selector, and workout logging.
- **Reading (R)**: Focus reading timer, book title tracker, pages read counter, and key takeaway notes.
- **Scribing (S)**: Three-item gratitude journal, daily reflection, and primary intention setter.
- **Routines**: 6-minute Express (1 min each), 30-minute Balanced (5 min each), 60-minute Deep (10 min each), and fully customizable per-ritual durations. Supports pause, resume, skip, and partial completion.

### 2. Personal Discipline Tracker
- **Independent Goals**: Track **Pornography-Free**, **Masturbation-Free**, or both independently.
- **Accurate Streaks**: Current streak and longest streak calculated with local-date precision.
- **10 Milestone Badges**: 1 Day (First Step), 3 Days (Grounding), 7 Days (One Week), 14 Days (Fortnight), 21 Days (Habit Shift), 30 Days (One Month), 60 Days (Deep Roots), 90 Days (The Reboot), 180 Days (Half Year), 365 Days (One Year).
- **Constructive Restart**: Setbacks are treated as data, not defeats. Records triggers and lessons learned while preserving historical streaks and stats. Zero shame or guilt.
- **History Management**: Editable log to inspect or delete accidental setback entries.

### 3. "I Need Support" Sanctuary Mode
- Accessible anytime via the emergency SOS shortcut.
- Calming reassurance explaining the wave-like nature of cravings.
- Real-time Box Breathing pacer.
- Somatic 5-4-3-2-1 Sensory Grounding step-by-step checklist.
- Immediate healthy alternative actions (Cold water, physical reset, stepping outside, reaching out to a friend, stream-of-consciousness writing).
- Optional curious trigger reflection.

### 4. Motivation System (100% Offline)
- Library of **108 original, authentic, uplifting motivational statements** (zero external AI API dependency).
- Categorized across:
  - Starting the morning
  - Completing rituals
  - Maintaining consistency
  - Reaching milestones
  - Navigating difficult days
  - Missed routines & setbacks
  - Peaceful evening reflection

### 5. Progress, Calendar & Journal Archive
- Interactive monthly calendar with toggles for S.A.V.E.R.S. completions and discipline clean days.
- Scribing journal archive with instant search, view, edit, and deletion capabilities.
- Inspection view for any historical day.

### 6. PWA & Mobile UX (iPhone SE 2020 Optimized)
- Strictly tested for 375 x 667 px viewport.
- Safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
- Minimum 16px font on inputs to eliminate iOS Safari auto-zoom.
- Minimum 44px touch targets.
- Timestamp-based timer engine that recovers accurately even after the phone is locked or backgrounded.
- Service Worker precaching via `vite-plugin-pwa` for complete offline functionality.
- Clear iOS "Add to Home Screen" visual guide.

### 7. Absolute Privacy & Local Data Persistence
- Built with **IndexedDB (Dexie)**.
- **100% Client-Side**: No cloud database, no Firebase, no login system, no advertising, and zero tracking SDKs.
- **Full Backup**: Downloadable JSON export and verified JSON import.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **PWA**: vite-plugin-pwa (Service Worker, Web App Manifest)
- **Database**: IndexedDB via Dexie
- **Styling**: Tailwind CSS (Midnight Navy & Warm Sunrise Gold theme)
- **Icons**: Lucide React
- **Sound**: Web Audio API (Synthesized harmonic meditation chime)
- **Testing**: Vitest

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser or simulate an iPhone SE in Chrome/Safari DevTools (375 x 667).

### Running Automated Tests
```bash
npm test
```
Runs 26 Vitest unit tests covering streak calculations, midnight transitions, missed-day logic, timestamp timers, backup validation, and responsive layout constraints.

### Production Build
```bash
npm run build
```
Generates the optimized static PWA in `dist/` with service worker precaching.

### Preview Production Build
```bash
npm run preview
```

---

## Deployment to Cloudflare Pages

Cloudflare Pages is recommended for hosting DAWN as a fast, global, zero-cost PWA:

1. **Via Cloudflare Dashboard / Git**:
   - Push your repository to GitHub or GitLab.
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
   - Select your DAWN repository.
   - Set Build settings:
     - **Framework preset**: `Vite`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
   - Click **Save and Deploy**.

2. **Via Wrangler CLI**:
   ```bash
   npx wrangler pages deploy dist --project-name dawn-app
   ```

---

## How to Install on iPhone SE (2nd Gen)

1. Open **Safari** on your iPhone SE and navigate to your deployed DAWN URL.
2. Tap the **Share** icon (the square with an arrow pointing upward) in Safari’s bottom toolbar.
3. Scroll down the share sheet and tap **Add to Home Screen**.
4. Tap **Add** in the top right corner.
5. DAWN will now appear on your home screen with its custom icon. Tap it to launch in true full-screen standalone mode without URL bars.

---

## System Architecture & File Structure

```
c:\Users\stephen\Desktop\DAWN
├── public/
│   ├── apple-touch-icon.png     # 180x180 iOS home screen icon
│   ├── favicon.svg              # Vector sunrise icon
│   ├── icon-192.png             # 192x192 PWA icon
│   ├── icon-512.png             # 512x512 PWA icon
│   └── icon-maskable.png        # Maskable Android icon
├── src/
│   ├── __tests__/               # Vitest unit test suites
│   │   ├── backup.test.ts
│   │   ├── date.test.ts
│   │   ├── discipline.test.ts
│   │   ├── layout_responsive.test.ts
│   │   └── timer.test.ts
│   ├── components/
│   │   ├── ActiveRitualRunner.tsx  # Distraction-free timer and ritual flow
│   │   ├── BottomNav.tsx           # Fixed 4-tab mobile bar with safe area
│   │   ├── ConstructiveRestartModal.tsx # Non-judgmental setback logger
│   │   ├── FocusTab.tsx            # Personal discipline hero & milestones
│   │   ├── Header.tsx              # Compact top bar with SOS button
│   │   ├── HomeTab.tsx             # Daily dashboard, guidance & quick check-ins
│   │   ├── IOSInstallBanner.tsx    # iOS Safari installation prompt
│   │   ├── ProgressTab.tsx         # Monthly calendar & gratitude archive
│   │   ├── RitualsTab.tsx          # SAVERS rituals hub & routine selector
│   │   ├── SettingsModal.tsx       # User preferences & backup import/export
│   │   └── SupportModal.tsx        # "I Need Support" emergency sanctuary
│   ├── data/
│   │   ├── motivation.ts           # 108 original motivational statements
│   │   ├── rituals.ts              # SAVERS definitions & routine presets
│   │   └── support.ts              # Grounding & healthy alternative actions
│   ├── db/
│   │   └── db.ts                   # Dexie IndexedDB models & seed logic
│   ├── types/
│   │   └── index.ts                # TypeScript domain models
│   ├── utils/
│   │   ├── backup.ts               # JSON export & validated import
│   │   ├── date.ts                 # Local timezone-resilient date utilities
│   │   ├── discipline.ts           # Pure streak & milestone calculation engine
│   │   └── timer.ts                # Wall-clock timestamp timer & Web Audio bell
│   ├── App.tsx                     # Main app root & state controller
│   ├── index.css                   # Tailwind styles, iOS zoom guards, safe areas
│   └── main.tsx                    # React mount & Service Worker registration
├── index.html                      # PWA meta tags & viewport-fit configuration
├── tailwind.config.js              # Theme colors, safe-area spacing, 375px xs screen
├── tsconfig.app.json               # TypeScript application config
└── vite.config.ts                  # Vite + PWA + Vitest configuration
```

---

## Known Limitations & Future Enhancements

- **Push Notifications**: Offline browsers cannot schedule push notifications when the tab is closed without a backend server and Apple APNs Web Push registration. Push notifications are intentionally deferred as an optional future enhancement requiring push keys.
- **Vision Board Images**: Stored as base64 data strings in local IndexedDB. While convenient and 100% private, exporting backups with many high-res images will increase the JSON backup file size.
- **Audio Autoplay**: Modern mobile browsers require at least one user tap before Web Audio API can play sounds. Starting or clicking the ritual runner naturally satisfies this browser policy.
