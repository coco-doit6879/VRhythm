# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# VRhythm App Architecture Guidelines
- **Practical Engines**: `PracticalExamEngine.tsx` handles exam grading, while `PracticalMock.tsx` handles standalone listening. Both rely on the custom SVG engine in `app/components/SheetMusic`.
- **Durations & Playback**: Note lengths (q, h, w) are mathematically calculated from the `tempo` in the song's JSON metadata. The playback UI relies on robust string parsing and `setTimeout` for recursive, perfect-timing loops. 
- **Global Speed Control**: Both engines feature a `SPEED_MULTIPLIER` constant at the top of the file for quick testing.
- **Sheet Music UI**: The SVG staff has been mathematically scaled to 75% for mobile real estate. Modifications to staff constants must be done carefully to preserve alignment in `constants.ts`.
- **Pitch Detection**: Handled by `PitchDetectorService`. Ensure it is cleanly stopped when unmounting or transitioning.

## Web UI verification

- A successful build alone is not UI verification. For changes in `web/`, run the affected Playwright tests from `web/` with `npm run test:ui -- --grep "..."`, then the full suite before handoff.
- Test desktop 1440×900, tablet 768×1024 and mobile 390×844. For iOS-related changes also run `npm run test:ui:webkit`; emulation is not a real-device Safari test.
- Inspect actual screenshots and computed layout: bounding boxes, spacing, wrapping, visibility, element/document overflow, and touch targets. Compare desktop/mobile visually.
- Review `playwright-report/` and failure traces/screenshots in `test-results/`. Do not silently ignore failures or loosen assertions to make a run pass.
- Screenshot baselines live with tests. Update only for intentional visual changes, inspect every changed baseline, and never automatically accept a failing screenshot as correct.
- The UI suite stubs the course list. Passing it does not verify the backend, login, payments or enrollment.
- Report the tested browsers/viewports and unresolved findings. If browsers cannot run, state the blocker rather than claiming visual verification.
