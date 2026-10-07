# VRhythm Web

Learner-facing web application for VRhythm. This is intentionally separate from `teacher-web`, which is the instructor course authoring portal.

## Current MVP

- Home narrative and CTA
- Instrument exploration with reusable cards and detail modal
- Email/password login and registration using the backend auth contract (Google sign-in not configured)
- Learning dashboard with instrument selection, course cards, XP, streak, progress, and learning path
- Web Sheet Engine preview component prepared for the full SVG renderer port from the mobile app

## Structure

```text
src/
  components/       shared Header, AuthPanel, InstrumentCard, SheetEnginePreview
  data/              mock instruments, courses, and learning path
  services/          backend API adapter and auth storage
  App.tsx            view composition and navigation state
  styles.css         responsive traditional-modern visual system
```

## Run

```bash
npm install
npm run dev
```

The app defaults to https://vrhythm-api-latest.onrender.com for development and production. To use a local backend, set VITE_API_BASE_URL in web/.env.local (for example http://localhost:5205) and restart Vite. API failures display a retry state; course data is not replaced with mock content. See API-AUDIT.md for verified endpoints and limitations.
