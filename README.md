# VRhythm - Sáo Trúc Việt Nam 🎍

VRhythm is an educational React Native (Expo) application dedicated to teaching and preserving the art of the Vietnamese Bamboo Flute (Sáo Trúc).

## Core Features
- **Theoretical Lessons**: Interactive course layouts, reading materials, and dynamic quizzes supporting both single and multiple-choice questions.
- **Practical Exam Engine**: A sophisticated, custom-built sheet music rendering engine using SVG and React Native. Includes:
  - Live scrolling staff lines with dynamically scaled clef and time signatures.
  - Real-time predictive fingering charts tailored for the 6-hole bamboo flute.
  - Accurate tempo calculation interpreting whole (w), half (h), and quarter (q) notes from JSON metadata.
  - Real-time pitch detection integration to evaluate user performance dynamically.
- **Mock Practice Mode**: A dedicated practice area (`/practical-mock`) where users can listen to melodies and observe the correct finger movements in advance.
- **Course Progression**: State-driven progression tracking that automatically updates the syllabus upon lesson completion.

## Technical Details
- **Framework**: React Native with Expo Router.
- **Sheet Music Rendering**: Custom zero-dependency vector renderer located in `app/components/SheetMusic`. It handles layout, spacing, and scaling entirely in-house for optimal mobile performance.
- **Audio Analysis**: Real-time microphone capture handled by `PitchDetectorService` for immediate grading.
