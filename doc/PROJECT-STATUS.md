# Saath Project Status

**Last updated:** 7 November 2026  
**Current phase:** Product scope and UI prototype  
**Overall status:** Foundation in progress; production workflows are not yet implemented.

This file is the working progress summary for the project. It distinguishes designed or demo UI from working application features.

## Current status

| Workstream | Status | Current state |
| --- | --- | --- |
| Product scope | Defined; requirements draft | The first-version product, users, goals, feature scope, non-goals, and user journeys are documented in [PRD.md](./PRD.md). |
| System architecture | Documented; implementation choices remain | The modular Next.js application, MongoDB Atlas, private media storage, identity, and service boundaries are described in [SDA.md](./SDA.md). Authentication and delivery providers are not selected or configured. |
| Database and API design | Documented; partially implemented | Data and endpoint plans are in [DATABASE-DESIGN.md](./DATABASE-DESIGN.md) and [API-DOCUMENTATION.md](./API-DOCUMENTATION.md). The current code provides a health endpoint and a starter events API, not the full documented API. |
| Public home page | UI prototype with working auth entry | The responsive Stitch-inspired landing page is at `src/app/page.tsx`. It includes the Make My Marriage mark, navigation, hero, workspace preview with sample content, feature sections, family section, and footer. The home account link opens sign-in for anonymous users and Account for authenticated users; wedding creation remains a development workflow. |
| App and event foundation | In progress | The project has a Next.js App Router scaffold, MongoDB connection seam, event schemas/repository, shared validation, health route, and starter event routes. The development membership adapter is not production authentication. |
| Sign-in and wedding creation | Partially implemented; development auth | The Stitch-inspired login page supports local and deployed email/password account creation, sign-in, sign-out, session lookup, a protected welcome page, authenticated-login redirects, account-aware home navigation, and validation/error handling with MongoDB-backed users and signed HTTP-only sessions. Production requires the Vercel `AUTH_SECRET` environment variable. Wedding onboarding and editing require a title, groom name, bride name, and wedding date. A production passwordless provider and full workspace onboarding are still not configured. |
| Signed-in dashboard | UI prototype implemented; protected | Protected `/dashboard` provides a Stitch-inspired wedding overview with sample events, guest/RSVP, task, budget, expense, and family activity sections. Live dashboard aggregation and mutation workflows remain deferred. Users without a wedding workspace are redirected to onboarding first. |
| Guests, invitations, tasks, budget, media, and activity | Invitations partially implemented | Owner/admin invitations are stored in MongoDB and use Resend when `RESEND_API_KEY` is configured; without it, the app returns a development invitation preview. Invitations support admin, manager, and legacy collaborator roles, with an acceptance page and email-matched workspace membership flow. A verified sending domain and DNS authentication are still required for reliable inbox placement. Guest management, tasks, budget, media, and activity remain incomplete workflows. |

## Important implementation boundary

The landing page contains illustrative copy and sample figures to match the Stitch design. Treat the displayed RSVP, budget, family activity, privacy, passwordless access, invitation, and media statements as design intent or sample content until their corresponding backend behavior is implemented and verified. The Home page must not be treated as proof that sign-in, wedding creation, secure sharing, message delivery, or a dashboard is available.

## Progress log

| Date | Milestone | Notes |
| --- | --- | --- |
| 3 November 2026 | Product and technical scope documented | Added the first-version requirements, system design, database design, and API contract documents. See the linked documents above. |
| 6 November 2026 | Stitch Home design reviewed | Retrieved the Saath landing-page design and reviewed its screen content and visual direction. |
| 7 November 2026 | Public Home page built | Added a responsive Stitch-inspired landing page, the Saath emblem, reference copy, and an explicitly illustrative workspace preview. Kept sign-in/wedding creation unconnected and deferred the dashboard. `npm run build` succeeds. |
| 7 November 2026 | Development authentication added | Added the Stitch-inspired login/sign-up page, hashed local credentials, signed HTTP-only development sessions, and MongoDB-backed auth routes. Production passwordless authentication remains deferred. |
| 7 November 2026 | Authenticated entry flow completed | Added logout, session validation, protected `/welcome`, account-aware home navigation, and lifecycle validation for anonymous, signed-in, and signed-out states. |
| 7 November 2026 | Auth validation and access guards hardened | Separated sign-in and sign-up validation, added malformed-JSON and duplicate-email responses, redirected authenticated users away from `/login`, and made logout failures retryable instead of uncaught runtime errors. `npm run lint` and `npm run build` pass. |
| 7 November 2026 | Workspace onboarding flow completed | Enforced sign-up/sign-in routing based on workspace membership: users without a wedding go to onboarding, users with an existing wedding go directly to the dashboard, and successful workspace creation lands on the dashboard. End-to-end lifecycle validation passed. |
| 7 November 2026 | Dashboard UI prototype added | Added the protected dashboard route and responsive Stitch-inspired overview UI. Sample data is explicitly presentation-only until live dashboard services are implemented. `npm run lint` and `npm run build` pass. |
| 7 November 2026 | Wedding title requirement added | Added a required wedding title to create/edit onboarding, stored it on wedding documents, displayed it in saved workspaces and dashboard presentation, and updated the PRD, database, API, and architecture documentation. |
| 7 November 2026 | Live wedding identity and invitations started | Dashboard heading now reads the saved wedding title, couple names, date, and city from MongoDB. Added Stitch-inspired collaborators UI and owner-only invitation creation with expiring hashed tokens, Resend delivery support, and development preview fallback. Integration test passed. |
| 7 November 2026 | Invitation delivery and acceptance errors fixed | Fixed the collaborator form reset crash after async delivery, removed failed-delivery invitation records so retries work, added the public invitation URL page and signed-in email-matched acceptance endpoint, and verified the app build plus invitation URL smoke test. |
| 7 November 2026 | Navigation and email delivery improved | Parallelized independent dashboard database reads to reduce first protected-route latency and added plain-text content, a reply address, and a clearer call to action to invitation emails. Resend domain verification remains required to prevent spam placement. |
| 7 November 2026 | Role-based collaborator flow added | Added owner, admin, manager, and legacy collaborator role handling, admin invitation permissions, owner-only admin delegation, role selection in the collaborator UI, and role labels in pending invitations. |
| 7 November 2026 | Production sign-in enabled | Removed the production-only authentication block, enabled signed email/password sessions on Vercel, and made `AUTH_SECRET` mandatory when production sessions are used. `npm run build` and `npm run lint` pass. |
| 7 November 2026 | Vercel auth diagnostics improved | Added safe API error codes for missing `AUTH_SECRET`, missing `MONGODB_URI`, and unreachable MongoDB deployments so production login failures are actionable without exposing secrets. |
| 7 November 2026 | Production invitation URLs corrected | Invitation links now use the configured public URL and fall back to the incoming Vercel origin when production is accidentally configured with a localhost `APP_URL`. |

## Suggested next milestones

1. Replace the development credential flow with a selected production authentication and email provider.
2. Replace dashboard sample data with live MongoDB aggregations and workspace-scoped records.
3. Extend event management, then implement guest/RSVP, task/shopping, and budget/expense workflows.
4. Select and configure approved providers before implementing invitations, private media uploads, and livestream details.

Update this document when a major feature or project milestone changes the status above.
