# UI verification

Run `npm run test:ui -- --grep "Explore"`, then `npm run test:ui` from `web/`.
Install the browser once with `npx playwright install chromium`.
Windows sandbox restrictions can prevent Playwright's server teardown; run with sufficient process permissions if all tests complete but the runner cannot exit.

Projects: Chromium desktop 1440×900, tablet 768×1024, mobile 390×844.
For iOS-related work, install WebKit and run `npm run test:ui:webkit`; this is browser emulation, not real-device Safari.

The suite also checks all six instrument detail pages, the supplied full portrait, article navigation, scroll reveals and live reduced-motion changes. The suite checks unfiltered catalogue, keyboard activation, links to instrument stories, the learning CTA, header navigation, image loading, computed font, layout bounding boxes, horizontal overflow and link touch targets. It also smoke-checks home and the login form. Course-list requests are stubbed; no backend, authentication, payment or enrollment verification is implied.

Review `playwright-report/index.html` and `test-results/`. Passing layout tests attach full-page screenshots for visual review. Failure traces and screenshots are retained. No screenshot comparison baselines existed when this suite was added; these captures are review artifacts, not automatic visual-diff assertions. Store any future approved baselines beside these tests and inspect every intentional update.

Latest verification (2026-10-02): build passed; targeted detail and motion runs passed 6/6 each; final sequential full suite passed 24/24, with no skipped or flaky tests. A full concurrent run encountered Chromium captureScreenshot protocol errors on two detail screenshots after layout assertions passed. Run the full suite with `npm run test:ui -- --workers=1` on this Windows host to reduce capture contention. Desktop, tablet and mobile screenshots were inspected; WebKit and real Safari were not run.

Learning/explore update: targeted learning checks passed 15/15. Tests cover course loading, empty lists, retry after error, one populated instrument, responsive card geometry and both motion preferences. The loading fixture gates both StrictMode requests; its earlier single-request gate was corrected after reviewing failures. Use --workers=1 for full Windows runs.

Final learning/explore verification: build passed; full Chromium suite 33/33 passed, no failures, skips or flakes. Inspected screenshots at 1440x900, 768x1024 and 390x844. No WebKit/real Safari or backend validation.

2026-10-04 consistency audit: all six instrument-learning routes now share the editorial shell, course roadmap styling and async scroll reveal. Account/profile and Theory/Video/Quiz/Practical lesson shells also share the theme; notation deliberately retains a cream reading surface. Added fixtures for populated/empty/error courses, gated lesson access, profile states and all four lesson formats. Targeted consistency suite passed 12/12. Initial CSS class concatenation and legacy hero/social/quote overrides were found and fixed before screenshot review. Review collages at all three Chromium sizes; no backend enrollment, OAuth, grading, microphone capture or actual video playback is verified by these fixtures.
Final 2026-10-04 result: build passed; full Chromium suite 45/45 passed, no failures, skips or flakes. Reviewed screenshot layouts at 1440x900, 768x1024 and 390x844. WebKit and real-device Safari were not run.
