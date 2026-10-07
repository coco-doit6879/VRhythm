# Learner web API audit — 2026-10-06

Scope: web/src (learner website), not native Expo or teacher-web. Compared with api_documentation.md, services/api-types.ts and live anonymous requests. No real accounts, enrollment, grades or progress were created.

## Fixed
- Local development used localhost:5205, which refused connections. Default now matches deployed production API https://vrhythm-api-latest.onrender.com; VITE_API_BASE_URL still overrides it.
- Registration omitted confirmPassword and allowed 6-character passwords. Live empty-body validation confirms confirmPassword is required and Password minimum is 8. Form and payload now match.
- Google button submitted invented credentials to password auth. Disabled with an explicit unavailable label until real Google identity integration is configured.
- HTTP validation errors and success:false envelopes were mishandled. Errors now surface; missing auth sessions cannot navigate as logged in. Requests time out and auth requests omit existing bearer credentials.
- Lesson content supports both top-level content (documented DTO/live public course summaries) and nested theory/video shapes. Practical responses support notes as well as expectedNotes.
- Profile now invokes GET /api/user/profile; errors show cached-session fallback with retry.

## Endpoint inventory
| UI / adapter | Endpoint | Audit evidence |
|---|---|---|
| Register / login | POST /api/auth/register, /login | Payload matches DTO; registration validation live 400; mocked success/error/session tests. Successful real signup/login not exercised. |
| Google | POST /api/auth/google | No configured identity-token flow; button disabled. |
| Course catalogue / roadmap | GET /api/courses, /api/courses/{id} | Live 200 wrapped responses, matching UI contract. |
| Signed-in catalogue | GET /api/courses/learning | Live anonymous 401, authenticated success only mocked. |
| Profile | GET /api/user/profile | Live anonymous 401; authenticated success mocked. |
| Enroll / unlock | POST /api/courses/{id}/enroll or /unlock | Method/path match documentation; no real writes. Unlock is documented as mock purchase, not a payment integration. |
| Lesson | GET /api/lessons/{id} | Documented; anonymous 401; flat and nested content supported. |
| Quiz / practical | GET /api/quizzes/{id}, /api/practical/{id} | Documented; anonymous 401; mocked UI content. |
| Video URL | GET /api/lessons/{id}/video-url?courseId=... | Matches documented contract; authenticated URL not verified live. |
| Theory completion | POST /api/theory/{id}/complete | Matches documentation; no real writes. |
| Video progress | POST /api/lessons/{id}/progress?courseId=... | watchedSeconds/totalSeconds match shared client. No real writes. |
| External video confirmation | POST /api/lessons/{id}/external-video/complete?courseId=... | Live Swagger now confirms POST with lessonId path and courseId query parameters; matches the adapter. Actual completion write still untested. |
| Quiz submit | POST /api/quizzes/{id}/submit | answers with questionId/selectedOptionId match DTO; no real writes. |
| Practical submit | POST /api/practical/{id}/complete | notes array matches shared client; no real writes. |
| Completion recalculation | POST /api/courses/{id}/completion/recalculate | Matches documentation; no real writes. |

Live CORS preflight for registration from http://127.0.0.1:5173 returned 204 and Access-Control-Allow-Origin: *. Earlier Swagger requests returned 404; a subsequent check succeeded at /swagger/v1/swagger.json. GoogleLoginRequestDto requires credential, subject, email and fullName, with optional avatarUrl. Schema availability does not verify backend token validation or authenticated writes. API methods for avatar editing, notes and authoring have no learner web controls; they are not claimed implemented.

Verification: Playwright Chromium desktop 1440x900, tablet 768x1024, mobile 390x844; inspect report for latest totals. Authentication tests intercept HTTP and do not prove production account creation. No WebKit or real-device Safari run.

