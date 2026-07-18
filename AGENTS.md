# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# VRhythm App Architecture Guidelines
- **Practical Engines**: `PracticalExamEngine.tsx` handles exam grading, while `PracticalMock.tsx` handles standalone listening. Both rely on the custom SVG engine in `app/components/SheetMusic`.
- **Durations & Playback**: Note lengths (q, h, w) are mathematically calculated from the `tempo` in the song's JSON metadata. The playback UI relies on robust string parsing and `setTimeout` for recursive, perfect-timing loops. 
- **Global Speed Control**: Both engines feature a `SPEED_MULTIPLIER` constant at the top of the file for quick testing.
- **Sheet Music UI**: The SVG staff has been mathematically scaled to 75% for mobile real estate. Modifications to staff constants must be done carefully to preserve alignment in `constants.ts`.
- **Pitch Detection**: Handled by `PitchDetectorService`. Ensure it is cleanly stopped when unmounting or transitioning.
