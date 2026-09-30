# Architecture

> Status legend: **✅ Agreed** · **🟡 Proposed — needs founder approval** · **⬜ Not yet decided**
>
> Last updated: 2026-09-29

## 1. Constraints (agreed)

From `CLAUDE.md` and `DECISIONS.md`:

- One responsive web app for desktop and mobile.
- Extremely lightweight infrastructure and operating costs.
- Maintainable by a founder without a large engineering team.
- Core functionality must work without any LLM.
- Reuse existing infrastructure where it serves V1.

## 2. Requirements implied by product decisions (agreed)

Not architecture choices, just what any architecture must support:

- **Book data source** must provide, or let us derive, a *work*-level identifier that groups editions. It also needs edition/ISBN metadata and page counts, where available. (D14)
- **Progress** is stored as a normalized percentage, alongside the raw entry (page or %) the reader typed. (D12)
- **Per-reader copy page count** is stored per user per book, and page entries are normalized against it. (D24, D25)
- **Status follows progress:** reaching 100% sets Finished; dropping below 100% sets Reading. (D27)
- **Thoughts** store:
  - normalized progress, which can't be changed after creation (D32)
  - the raw entry the reader typed
  - timestamp and privacy
  - an optional link to the Thought they reflect on (D17)
  - a flag for the final reflection (D28)
- **Replies** use the spoiler position of their parent Thought. They don't need their own progress for visibility. (D26)
- **Visibility queries:**
  - Filter shared Thoughts by the viewer's status and progress on that *work*. (D15)
  - Never expose a private parent Thought through a shared reflection. (D29)
  - Hide the replies and likes of Thoughts that were unshared or deleted, but don't destroy them. Soft-delete or a visibility flag covers this. (D32)
- **Reflection selection** is a plain rule with no LLM:
  - about 10 points of progress since the Thought was written (D18)
  - pick the newest Thought in a chain (D31)
  - track skips: at most one re-show (D30)

  This means a small table of reflection events: shown, skipped, or responded.
- **Reports** are stored in a table and reviewed by hand. There's no admin UI and no automatic hiding. (D33)
- **Avatars** are optional images, so a small amount of file storage is needed. (D22)
- **No** email-notification, push, or notification-service infrastructure. (D19) Transactional auth email (one-time sign-in codes) is still needed; see §5.

---

## 3. Audit of the previous codebase (`reezy-kunal`)

Audited 2026-09-29, read-only. 28 commits by one developer between 19 and 24 April 2026. About 188 source files.

### 3.1 What it is

A **group reading-sprint app**, not the V1 product. Users are matched into groups of 5–8, read one book together over a 7-day "sprint", check in daily, keep streaks, chat in real time, and see a Stripe paywall.

| Part | What's there |
|---|---|
| `application/` | **Expo 54 / React Native 0.81** mobile app (expo-router, React Query, Zustand, Axios, react-hook-form + Zod, Reanimated, Lottie). Mobile-first; tokens are stored in `expo-secure-store`, which doesn't work in a web browser. |
| `backend/` | **Express 4 + TypeScript** REST API with a routes → controllers → services → repositories layering. **Prisma 7** on PostgreSQL. Custom JWT access/refresh auth plus bcrypt and Google OAuth. Also: a `ws` WebSocket chat server, `node-cron` sprint jobs, Stripe Checkout and webhooks, Expo push (`expo-server-sdk`), Cloudinary avatar upload, an admin API gated by a shared secret, and Winston/Morgan logging. |
| `web/` | Empty placeholder. |
| Hosting | Backend runs as a Docker service on **Render** (`render.yaml`, starter plan). The mobile app is built with **EAS** (Expo). |
| Database | **Supabase Postgres**, used only as a hosted Postgres through Prisma (per `backend/README.md`). No Supabase Auth, Storage, RLS, or client SDK is used, and there's no Supabase config in the repo. |
| Vercel | **None.** There's no Vercel configuration. |

### 3.2 Area-by-area findings

| # | Area | Finding | Verdict |
|---|---|---|---|
| 1 | Repo structure | Two separate packages (`application/`, `backend/`), with husky and commitlint at the root. Two codebases, two deploys. | **REBUILD** as a single app |
| 2 | Frontend framework | Expo / React Native, built for iOS/Android with light web support. Not suited to one responsive web product (SecureStore auth breaks on web; RN styling isn't normal CSS). | **REBUILD** |
| 3 | Backend architecture | Solid but heavy Express layering. A lot of code to maintain for a V1 whose logic is mostly CRUD plus a few rules. | **REBUILD** (much thinner) |
| 4 | Supabase config | Only a hosted Postgres; the connection string lives in Render env vars. The project may be reusable for the new app's database, auth, and storage. | **ADAPT**: reuse the Supabase project/account if you have admin access; otherwise create a new one |
| 5 | Schema / migrations | Models: User, RefreshToken, Group, GroupMember, Sprint, CheckIn, DiscussionPrompt/Post, Message, PaywallEvent, Notification. There's no Book, Work, Library, Thought, or Reply model. The book is free text on Sprint. There's one migration, named `done`. | **REBUILD**. The fresh V1 schema is small. |
| 6 | Auth & accounts | Custom JWT/refresh/bcrypt plus Google OAuth. Email-verify and password-reset tokens are generated but **never sent** (there's no email provider), so those flows don't work. | **REBUILD** on a managed auth service |
| 7 | Book API | **None.** No book database integration. | **REBUILD** (new) |
| 8 | Book search | **None.** | **REBUILD** (new) |
| 9 | Library / tracking | **None.** Only sprint check-ins (`dayNumber`, `pagesRead`, `note`), streaks, and totals. No Want to Read / Reading / Finished. | **REBUILD** (new). The CheckIn idea is only loosely related. |
| 10 | Notifications | Expo push, a Notification table, cron reminders, and streak warnings. | **REMOVE** (D19) |
| 11 | Storage / images | Cloudinary avatar upload through multer, with a 512px face-crop. Works, but it's one more vendor with its own keys. | **NOT NEEDED FOR V1** as a separate vendor. Use the database platform's storage for avatars. |
| 12 | Stripe / payments | Checkout, webhooks, subscription status, paywall A/B variants, PaywallEvent analytics. | **REMOVE** (not in V1) |
| 13 | Routes / screens | Login, paywall, Home (sprint), Sprint overview, group progress, group chat, discussion, check-in celebration, profile/notifications. None matches the V1 navigation (Today / Books / You). | **REMOVE**. Treat as reference only. |
| 14 | UI components | `Avatar`, `EmptyState`, `ErrorScreen`, `LoadingScreen`, `TabScreenChrome`, `StreakBadge`. `Button.tsx` and `Input.tsx` are **empty files**. All are React Native, so they don't port to web. | **NOT NEEDED FOR V1** |
| 15 | Styling / design system | No theme tokens: 21 inline `StyleSheet.create` blocks. A dark palette (near-black plus pale lime `#dbe4aa`/`#e7efb2`). Fonts: **Inter** (body) and **Rammetto One** (display). None of it uses the new plum/pink/acid palette. | **ADAPT** fonts as a starting point only. Rebuild the design tokens. |
| 16 | Env vars / integrations | Postgres, JWT secrets, Google OAuth, Stripe ×6, Expo push, Mixpanel (token defined, no usage found), Cloudinary, admin secret. | **REMOVE** most. Keep Google OAuth client credentials if you want Google sign-in (they need reconfiguring for the new domain). |
| 17 | Deployment | Render Docker service (about $7/mo starter) plus EAS builds. No web hosting. | **REBUILD** for web hosting. Retire the Render service once the new app is live. |
| 18 | Security / maintainability | See §3.3. | Flagged |
| 19 | Unnecessary complexity for V1 | WebSockets, cron, Stripe, paywall A/B, push, the admin API, the repository/service/controller layering, Docker, `patch-package` patches for expo-modules-core, and `express-mongo-sanitize` (a MongoDB tool in a Postgres app). | **REMOVE** |
| 20 | Valuable and expensive to rebuild | Very little. Useful as patterns: the Zod-validated env config, the timing-safe admin-secret check, rate-limit and security-header choices, and the React Query usage pattern. Useful assets: the logo PNG, Inter, and Rammetto One. | **KEEP** as reference only |

### 3.3 Security and maintainability concerns

1. **`backend/.env.docker` is committed to git.** I didn't inspect the values. If it holds any real secrets (Stripe, Google, Expo, Mixpanel, JWT, admin, or database), **rotate them** and remove the file from the repo. 🟡 *Action for founder.*
2. **The production API URL is hard-coded as a fallback** in `application/src/config/constants.ts` (`reezy-70oh.onrender.com`). It's not a secret, but it means builds silently point at production.
3. **Auth flows are half-built.** Email-verify and password-reset tokens exist but are never delivered. There's no email service.
4. **No tests.** Jest is configured, but there's no `tests/` directory.
5. **Placeholder files** (the empty `Button.tsx` and `Input.tsx`) and a single migration named `done` suggest the code was mid-build.
6. **Ownership and access.** Confirm you control the Render, Supabase, Stripe, Google Cloud, Expo/EAS, Cloudinary, and Mixpanel accounts, not only the contractor.
7. **Live costs.** If the Render service, Supabase project, or Cloudinary account are still running, they may be billing you.

### 3.4 Reuse matrix (summary)

| Keep | Adapt | Rebuild | Remove | Not needed for V1 |
|---|---|---|---|---|
| Logo asset; Inter and Rammetto One font files (for evaluation); a few patterns as reference | Supabase project (as the database, auth, and storage host); Google OAuth client (if Google sign-in is wanted) | App framework; data model; auth; book search; library; Thoughts; reflection; conversation; styling tokens; hosting | Stripe/paywall; push notifications; WebSockets/chat; cron; groups/sprints; streaks; admin API; Docker/Render; Mixpanel | Cloudinary; RN UI components; Express backend |

---

## 4. Recommendation: build V1 cleanly ✅ Agreed (D34)

**Build the new V1 as a clean, single web app in this repo, and reuse selected pieces** (the Supabase account/project, brand assets, and a few patterns). Don't evolve `reezy-kunal`.

Why:

- **Different product.** The old code is a group sprint and paywall app. None of V1's core objects exist in it: books, library, Thoughts, reflection, the per-book conversation, or spoiler logic.
- **Different platform.** It's a native-first Expo app. V1 is one responsive web product.
- **Removing is most of the work.** Evolving it would mean first deleting Stripe, push, WebSockets, cron, groups, sprints, streaks, and the paywall, which is most of the code, and then still building everything V1 needs.
- **Too heavy to maintain.** Two codebases, Docker, and a custom auth stack are more than a founder should maintain.

## 5. V1 stack ✅ Agreed (D34, D35)

The goal is the fewest moving parts, reusing what already exists (Supabase).

| Concern | Proposal | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript**, one app for UI and server logic | One codebase and one deploy. It renders on the server (fast on mobile) and is the most widely documented React framework. |
| Styling | **Tailwind CSS** with Reezy design tokens (plum/pink/acid plus neutrals) defined once | Responsive by default, with no component library to maintain. |
| Database | **Supabase Postgres** (reuse the existing account; new project or schema for V1) | Already in use. Free tier to start. |
| Auth | **Supabase Auth**: Google + passwordless email one-time codes (D35, D39). No passwords. | Replaces the custom JWT/refresh/bcrypt code. One-time-code emails come built in. |
| Data access | Supabase client from Next.js server code, **Row Level Security** for ownership and privacy, and SQL views/functions for spoiler-aware reads | Privacy rules enforced in the database, not only in the UI. No separate API server. |
| Migrations | Supabase CLI SQL migrations in this repo | Plain SQL, versioned, no ORM layer. |
| File storage | **Supabase Storage** for avatars | Drops Cloudinary as a vendor. |
| Book data | **Open Library API** (free, no key, has explicit *work* and *edition* records with ISBNs), cached in our own `works`/`editions` tables when a user adds a book | It's the only free source that natively groups editions into works (D14). Google Books is a possible fallback for covers and descriptions later. |
| Hosting | **Vercel** | Zero-config Next.js hosting with preview deploys. |
| Email | Supabase's built-in auth email to start. Add an SMTP provider only if limits bite. | Auth email only; no notification email (D19). |
| Analytics / monitoring | None at launch, or Vercel's built-in basics | Add only when there's a question to answer. |
| AI / LLM | **None** | D3, D4. |

**Expected running cost at launch:** $0 on the free tiers, or roughly $20–45/mo if you move to Vercel Pro and/or Supabase Pro (see risks).

### Alternatives considered

- **Evolve the Expo app with Expo Web:** rejected. The mobile-native patterns and the heavy backend are the wrong base for a web-first product.
- **Keep the Express backend on Render, with a new web frontend:** rejected. It means two deploys, a custom auth stack, and a Docker service to babysit.
- **SvelteKit / Remix / plain SPA:** viable, but Next.js has the widest ecosystem and documentation for a solo founder working with Claude Code.

## 5a. Data model and build plan 🟡

Proposed in `IMPLEMENTATION.md` §5 (tables, RLS spoiler/privacy rules, reflection engine) and §8 (phases). It moves here once approved.

## 6. Not yet decided ⬜

- Exact database schema (to be drafted after stack approval)
- Domain name and DNS
- Whether any data from the old database needs migrating (probably not, since the models don't overlap)
