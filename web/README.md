# VRhythm Web

Learner-facing web application for VRhythm. This is intentionally separate from `teacher-web`, which is the instructor course authoring portal.

## Current MVP

- Home narrative and CTA
- Instrument exploration with reusable cards and detail modal
- Mock-friendly login/register UI using the existing auth contract
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

The app falls back to local mock course data when the API is unavailable. Set `VITE_API_BASE_URL` to connect to the existing API, for example `http://localhost:5000`.
