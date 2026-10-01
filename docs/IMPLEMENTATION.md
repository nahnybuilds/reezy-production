# Reezy V1 — Implementation Plan

> Status: **✅ Approved (with D60–D62).** Schema approved (D63) and applied; Phase 0 foundation merged to `main`. Phase 1 (sign in and add a book) in review.
>
> Last updated: 2026-09-29 · Sources: `PRODUCT.md`, `DESIGN.md` (frozen Figma, D59), `DECISIONS.md`, `ARCHITECTURE.md` (stack D34/D35/D39)

## 0. Where we're starting from

| Repo | What's there today | Role in V1 |
|---|---|---|
| `nahnybuilds/reezy-production` (this repo, D65) | Approved docs, the 6 production migrations, the database tests, and the Phase 0 foundation on a fresh Next.js scaffold. | **The canonical V1 codebase.** |
| `~/Documents/GitHub/reezy` (local folder) | Where the docs, migrations and Phase 0 foundation were first written. | **Archived reference only.** Never pushed. |
| `~/Documents/GitHub/reezy-kunal` | Expo/React Native app (`application/`) and Express + Prisma API (`backend/`) for the old sprint/streak/paywall product. Last commit `4793d06`, 24 Apr 2026. No book search, library, Thoughts, reflection or spoiler code (audit in `ARCHITECTURE.md` §3). | **Read-only reference.** It's never modified; we reuse accounts, config and patterns, not app code. |
| Figma "Reezy V1 — Product Design" | Frozen UI (D59), tokens, components and the prototype. | UI source of truth. |

Honest summary: almost nothing of the *product* can be reused, because the old app is a different product on a different platform. What's worth reusing is **infrastructure and accounts** (the Supabase account, the Google OAuth client), **brand assets** (Rammetto One; the logo PNG as a placeholder) and a few **patterns**. Everything below says exactly where.

---

## 1. Keep

| Item | Where it is | How it's reused |
|---|---|---|
| **Supabase account** | External; `reezy-kunal/backend/README.md:174` ("Supabase PostgreSQL is external") | Same account. **Recommend a new Supabase project for V1** (free tier allows 2) rather than sharing the old project's `public` schema, whose `users`, `groups`, `sprints`… tables would collide. See blockers. |
| **Google OAuth client** | Google Cloud project behind `GOOGLE_CLIENT_ID` (`backend/src/config/env.ts`, `backend/src/services/OAuthVerificationService.ts`) | Reuse the Google Cloud project and client. Add the Supabase callback URL as an authorised redirect, and the V1 domain as an origin. The old verification code isn't needed, because Supabase Auth verifies Google itself. |
| **Rammetto One** | `reezy-kunal/application/assets/fonts/RammettoOne-Regular.ttf` (OFL) | Load it via `next/font/google` (same font, self-hosted by Next), so the file isn't needed. The OFL licence is confirmed (D52). |
| **Logo placeholder** | `application/assets/images/Reezy_logo.png` | A temporary placeholder only, until the final assets arrive (D59). |
| **Env validation pattern** | `backend/src/config/env.ts` (Zod `safeParse` on boot) | Same pattern, far fewer variables (§6). |
| **Security header set** | `backend/src/app.ts` (Helmet/CSP, nosniff, frame DENY, referrer policy) | Recreated as Next.js `headers()` in `next.config`. |
| **Commit conventions** | `commitlint.config.js`, `.husky/` | Optional: copy the conventional-commit config into the new repo. |

## 2. Modify

Nothing in `reezy-kunal` is modified (D11). What changes is **configuration** of existing external accounts:

| What | Change |
|---|---|
| Google Cloud OAuth client | Add the redirect URI `https://<project>.supabase.co/auth/v1/callback`, the Vercel preview/production origins, and the consent-screen app name and logo. A **privacy policy URL** is needed for production verification. |
| Supabase | Either a new V1 project, or (not recommended) a separate schema in the old project. Configure Auth: Google provider, email OTP (6-digit code template), site URL and redirect URLs, and **custom SMTP** (see §6). |
| `docs/ARCHITECTURE.md` | Replace "to be defined" with the data model in §5 once it's approved. |

## 3. Build (everything V1 needs)

One Next.js (App Router) + TypeScript + Tailwind app in this repo, on Vercel and Supabase (D34).

- **Auth:** Google, and email with a 6-digit code (Supabase Auth). A session middleware protects app routes.
- **Onboarding:** "What are you reading right now?", then search, then "Where are you?" (with the copy page-count ask when needed), then first-run Today. There's also the "Not reading anything right now" path.
- **Book data:** an Open Library search proxy, work/edition caching into our DB, and cover URLs with a typographic fallback.
- **Library:** Want to Read / Reading / Finished, with status following progress (D27).
- **Progress:** page or %, normalized to % against the reader's copy page count (D12, D24, D25), backward correction allowed, and "I finished it".
- **Today:** the most recently updated Reading book, the switcher, Log progress, Leave a Thought, the reply line, the waiting reflection, and first-run and empty states.
- **Check-in sheet:** step 1 progress; step 2 is either "What's on your mind?" or a reflection. It's a sheet on mobile and a 560px dialog on desktop.
- **Thoughts:** create, edit text, change privacy, delete (soft), with position immutable (D32). Final reflection at 100% (D28).
- **Reflection engine:** eligibility rule (≈10 points), chains continue from the newest Thought, skip allowed at most once more, a waiting card on Today. No AI (D18, D30, D31, D37).
- **Reflection UI** (exactly as frozen): the pink sheet, the Rammetto "72 pages later." headline, the pinned note at −1.5°, the gap line, three paths, and the response screen.
- **Book page:** hero, progress, description, then the Your margin / Readers tabs (D53). Chains grouped under their original Thought.
- **Readers (marginalia):**
  - the page spine and the signature treatment
  - likes and replies, with replies inheriting the parent position (D26)
  - the bookmark boundary and the "N more Thoughts ahead" count
  - a content-free count for Want to Read and not-in-library readers (D45, D55)
  - Report, and your own-content menu
- **Sharing:** a first-share explanation plus the display-name prompt (skipped when Google provided a name, D41). Unshare or delete soft-hides replies and likes (D32).
- **In-app reply notices:** the Today line and "2 new" on the Thought. No push or email (D19).
- **Finish:** the plum Rammetto moment, then the final question, then Your journey.
- **My Books:** search on top and three shelves.
- **You:** identity, Thoughts across books (All / Shared), inline settings (name, photo, sign out, delete account).
- **Reports:** a table only, reviewed by the founder in the Supabase dashboard (D33).
- **Responsive layouts:** mobile tab bar and desktop masthead; 640px reading column; book 300+640; Readers 220+560 with a 440px thread panel.
- **Placeholders:** `LogoSlot` and `WormSlot` components, so the final assets can be dropped in later (§8 worm positions).

## 4. Remove / deprecate (old product)

Nothing old is ported. These parts of `reezy-kunal` conflict with V1 and should be **retired operationally** once V1 is live, not edited:

| Old thing | Where | Action |
|---|---|---|
| Sprints, groups, streaks, check-in days, discussion prompts, group chat | `backend/prisma/schema.prisma` (Group, Sprint, CheckIn, DiscussionPrompt/Post, Message), `backend/src/websocket/`, `backend/src/jobs/sprintCron.ts`, `application/app/(tabs)/sprint/*`, `chat.tsx`, `discussion/[groupId].tsx` | Not carried over. They conflict with D2 (no clubs), D7 (one conversation per book) and "no streaks". |
| Stripe paywall and A/B variants | `backend/src/services/PaymentService.ts`, `routes/v1/payment.routes.ts`, `application/app/paywall.tsx`, `PaywallEvent` | Retire. Also **deactivate the Stripe products/webhook** in the Stripe dashboard. |
| Expo push notifications | `backend/src/services/NotificationService.ts`, `application/src/utils/pushNotifications.ts` | Retire (D19). |
| Cloudinary avatars | `backend/src/services/UploadService.ts` | Replaced by Supabase Storage. Retire the account or keys. |
| Mixpanel | `MIXPANEL_TOKEN` in `backend/src/config/env.ts` (no usage found) | Retire the token. |
| Custom JWT/bcrypt auth, admin API | `backend/src/services/AuthService.ts`, `middleware/admin.middleware.ts` | Replaced by Supabase Auth; there's no admin API in V1. |
| Render web service | `reezy-kunal/render.yaml` (starter plan) | **Shut down after V1 launch.** It may be billing now. |
| EAS/Expo project | `application/app.json` (`projectId edabd740…`), `eas.json` | Leave dormant. There's no native app in V1. |
| Committed `backend/.env.docker` | `reezy-kunal/backend/.env.docker` | **Rotate** any real secrets it contains (still open in TODO). |
| Old user data | Old Supabase project (`users`, etc.) | No migration: the models don't overlap. Decide whether to export or keep it, then delete it. |

## 5. Backend and data model (Supabase Postgres)

All access goes through Supabase from Next.js server code (server components, route handlers, server actions). **Row Level Security (RLS) enforces privacy and spoilers in the database**, not only in the UI. Migrations are plain SQL in `supabase/migrations/`, named with the versions recorded in Reezy Production (`drzrdvxvrrhatlyunuyi`, D64). API grants are explicit and least-privilege (D64).

### 5.1 Tables (9 + `avatars` bucket; `editions` deferred, D63)

**Authority rule (D63):** `user_books.copy_page_count` and `position_pct` are authoritative. `works.page_count_median` is metadata/fallback only and is never used for spoiler visibility.


| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `display_name` (null until needed), `avatar_path`, `created_at` | Created by trigger on sign-up. Google fills `display_name` (D41). |
| `works` | `id`, `ol_work_key` (unique, e.g. `OL20893680W`), `title`, `authors text[]`, `first_publish_year`, `description`, `cover_id`, `page_count_median`, `updated_at` | The parent work. **The conversation attaches here** (D14). Cached from Open Library on first add or view. |
| `user_books` | `id`, `user_id`, `work_id`, `ol_edition_key?`, `isbn_13?`, `status` (`want_to_read`/`reading`/`finished`), `copy_page_count?`, `position_pct numeric(5,2)`, `position_page?`, `position_unit` (`page`/`percent`), `started_at`, `finished_at`, `last_check_in_at`, timestamps; **unique(user_id, work_id)** | One row per reader per work. `copy_page_count` is asked once (D24). Today uses the latest `last_check_in_at` among `reading` books (D13). |
| `check_ins` | `id`, `user_book_id`, `user_id`, `position_pct`, `position_page?`, `position_unit`, `created_at` | Append-only. Powers "Last time p. 61 · 3 days ago", the journey start, and the reflection gap. |
| `thoughts` | `id`, `user_id`, `work_id`, `user_book_id`, `body`, `position_pct` (**immutable**), `position_page?`, `position_unit`, `privacy` (`private`/`shared`, default `private`), `parent_thought_id?`, `chain_root_id?`, `is_final bool`, `author_seen_replies_at`, `created_at`, `edited_at`, `deleted_at?` | Reflections are Thoughts linked to their parent (D17). `chain_root_id` makes chains cheap to query. Deletion is **soft** (D32). A trigger blocks updates to `position_*`. |
| `reflection_events` | `id`, `user_id`, `thought_id` (the resurfaced one), `shown_at_pct`, `outcome` (`shown`/`responded`/`skipped`/`new_instead`), `response_thought_id?`, `created_at`, `resolved_at` | Drives skip limits (D30), chain continuation (D31) and the "waiting on Today" card (D37). |
| `likes` | PK(`user_id`, `thought_id`), `created_at` | |
| `replies` | `id`, `thought_id`, `user_id`, `body`, `created_at`, `edited_at`, `deleted_at?` | **No position of its own**; it inherits the parent's (D26). |
| `reports` | `id`, `reporter_id`, `target_type` (`thought`/`reply`), `target_id`, `reason?`, `status` default `open`, `created_at` | Insert-only for users; the founder reviews in the dashboard (D33). |
| Storage bucket `avatars` | `avatars/{user_id}.jpg` | Public read, owner write (D22). |

### 5.2 Core rules as code (with where they run)

- **Normalization** (server action and a shared TS util):
  - `pct = min(100, page / copy_page_count × 100)`. when a book is added, `works.page_count_median` may *seed* `user_books.copy_page_count` (editable later via the book's … menu); from then on only the stored copy count is used
  - If no count is known and the unit is `page`, the UI asks "How many pages is your copy?" (D24, D25).
- **Status follows progress:** a DB trigger on `user_books` makes 100 → `finished` (sets `finished_at`), and below 100 from `finished` → `reading` (D27). Adding a book sets `want_to_read` or `reading`.
- **Visibility (RLS on `thoughts`):** the author always sees their own. Everyone else sees a Thought only if all of these hold:
  - `privacy = shared` and `deleted_at is null`
  - the viewer has a `user_books` row for that work with `status = finished`, **or** `status = reading` and `thought.position_pct <= viewer.position_pct`
  - Want to Read or no row means **no rows** (D15)
- **Replies and likes:** visible only when their parent Thought is visible to the viewer. RLS subqueries go through the `thoughts` policy, so a Thought that was unshared or deleted hides its replies and likes automatically without deleting them (D26, D32).
- **Private parent protection:** a shared reflection's `parent_thought_id` is never joined for other viewers. The API returns the parent only when the parent itself passes RLS (D29).
- **Counts without content:** `SECURITY DEFINER` functions return numbers only:
  - `readers_talking(work_id)` counts distinct sharers (D45, D55)
  - `thoughts_ahead(work_id)` counts visible-if-caught-up Thoughts above the viewer's position

  Neither returns ids or positions.
- **Reflection selection** (a server function run after each check-in, D18, D30, D31):
  1. Candidates are the reader's non-deleted, non-final Thoughts in this book that are the **newest in their chain**.
  2. A candidate needs `current_pct − position_pct ≥ 10`.
  3. It must never have been skipped, **or** skipped once with `current_pct − last_skip_pct ≥ 10`.
  4. It must have no unresolved `shown` event elsewhere.
  5. Pick the candidate with the largest gap (the most surprising), and show one per check-in.
- **Headline rule (D62):**
  1. Both positions were entered as pages on the same copy and are at least 5 pages apart → "**N pages later.**"
  2. Otherwise, at least 1 day has passed → "**N days later.**" for 1–13 days, then "**Two weeks later.**", "**Three weeks later.**", and "**Two months later.**" etc. (weeks and months spelled out).
  3. Otherwise → "**A little later.**"

  Never percentages.
- **In-app reply notices:** Today shows replies where `reply.created_at > thought.author_seen_replies_at`. Opening the thread updates `author_seen_replies_at`.
- **Account deletion (D60):** one server action with the service role. It hard-deletes the user's `user_books`, `check_ins`, `replies`, `likes` and `reflection_events`, tombstones their `thoughts` (`body` erased, `user_id` null, `deleted_at` set), sets `reports.reporter_id` null, removes their avatar, deletes the profile, then deletes the auth user.

## 6. External services

| Service | Use | Status |
|---|---|---|
| **Supabase** (existing account) | Postgres, Auth (Google + email code), Storage | Reuse the account; new project recommended. |
| **Google Cloud OAuth** (existing client) | Google sign-in via Supabase | Reuse; add redirect URIs. |
| **Open Library** (no key) | `search.json` (title/author), `/works/{key}.json` (description), `/books/{edition}.json` (page count), covers via `covers.openlibrary.org/b/id/{cover_id}-M.jpg` | Server-side proxy with caching and a descriptive `User-Agent` (Open Library asks for a contact). Use cover **IDs**, not ISBN URLs, which are rate-limited. |
| **Vercel** | Hosting and previews | Approved (D34). ⚠ **No purchase yet; a commercial (Pro) plan is required before public launch** (D61). |
| **Resend** (SMTP for Supabase Auth) | Production 6-digit sign-in codes | Approved (D61). Development uses Supabase's default email. Not a blocker for the first build. |
| Stripe, Expo push, Cloudinary, Mixpanel, Render | — | **Not used**; retire (§4). |
| Analytics / AI | — | None in V1 (D3). |

**Environment variables (all):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, for the few definer tasks)
- `OPEN_LIBRARY_CONTACT` (for the User-Agent)
- the SMTP details, which live in the Supabase dashboard and not in the app

## 7. Frontend: frozen Figma → code

**Stack:** Next.js App Router, Tailwind with the Figma variables as tokens, and `next/font/google` for Rammetto One, Instrument Sans and Newsreader. **Radix UI primitives** (Dialog, DropdownMenu, Switch, Tabs) provide accessible behaviour; they're a library, not a service. No component kit and no CSS-in-JS.

### 7.1 Routes

| Route | Figma frames |
|---|---|
| `/welcome` | A1 (and A2, which is Google's own UI) |
| `/welcome/email` | A3, A4 |
| `/auth/callback` | — |
| `/` Today | A5–A7 first run, B1–B4, plus the check-in overlay L1–L5 and the finish overlay H1–H2; desktop DK1, DK4 |
| `/books` | C1, C4–C6, D1–D4 |
| `/book/[workId]` | C2–C3, E1, G1–G6 (Readers tab and thread as `?tab=readers&thread=<id>`), F1 journey (`?view=journey`); desktop DK2, DK3 |
| `/you` | I1, I2 |

### 7.2 Components (Figma name → code)

| Figma | Component |
|---|---|
| `Button / Primary · Secondary · Quiet` | `Button` (variant prop); quiet text uses ink on pink |
| `Input / Text` | `TextField` (≥16px) |
| `Input / Progress entry` | `ProgressEntry` (numeric keypad, page/% toggle, copy page-count inline card) |
| `Thought field` | `MarginComposer` (pink margin rule, Newsreader) |
| `Privacy` + compact switch | `PrivacySwitch` (44px hit area) |
| `Progress / Book` | `ProgressLine` (plum fill, lime "you are here", pink margin marks) |
| `Cover / *` | `Cover` (Open Library image → typographic fallback) |
| `Thought / *`, margin rows, chains | `MarginThought`, `MarginList`, `ChainThread` |
| `Reflection / Block` → frozen reflection | `ReflectionSheet`: `RefHeadline` (Rammetto), `PinnedNote` (−1.5°), `GapLine`, `ReflectionPaths`, `ReflectionResponse` |
| Readers marginalia | `ReadersSpine`, `SpineNote`, `Signature`, `SpoilerBookmark`, `ThreadSheet` (mobile) / `ThreadPanel` (desktop) |
| Sheet / dialog | `ResponsiveSheet` (bottom sheet below 768px, centred dialog above) |
| Segmented | `SegmentedTabs` |
| `Nav / Tab bar`, `Nav / Top bar` | `TabBar` (mobile), `Masthead` (desktop) |
| `Logo / PLACEHOLDER`, `Worm / PLACEHOLDER — peek` | `LogoSlot`, `WormSlot` (render nothing, or a placeholder, until assets arrive) |
| Finish moment, journey | `FinishMoment`, `Journey` |

## 8. Implementation sequence

Each phase ends with something testable on a phone. **Phases 1–3 prove the core loop before anything social is built.**

| Phase | Scope | Done when |
|---|---|---|
| **0 · Foundations** | `git init`, a GitHub repo, Next.js + Tailwind scaffold, tokens and fonts, a Supabase project and migrations, Vercel previews, the `ResponsiveSheet`/`Button`/`TextField`/`Cover`/`ProgressLine` primitives, and a CI running lint, type checks and tests | An empty app deploys, and tokens match Foundations. |
| **1 · Sign in and add a book** | Supabase Auth (Google and email code), onboarding (A5–A7), Open Library search and caching, `user_books`, progress normalization and status trigger, a minimal Today | You can sign up on a phone, add *Piranesi* at p. 61, and see it on Today. |
| **2 · Core loop** | The check-in sheet (L1–L3), Thoughts (create, edit, privacy, soft delete), Today proper (B1–B2), book page with Your margin (E1), My Books (D1–D4) | You can read a real book for a week using only Reezy. **Founder dogfood starts.** |
| **3 · Reflection** | The eligibility engine, `reflection_events`, the frozen reflection sheet and response (L4–L5), chains, skip limits, the waiting card (B3) | A reflection surfaces about 10 points later, exactly as designed. |
| **4 · Finish** | "I finished it", the finish moment (H1), final reflection (H2), Your journey (F1), Finished shelf, correcting back to Reading | You can finish a book and see the journey. |
| **5 · Shared layer** | Sharing plus the display-name prompt (G6), Readers marginalia with RLS spoiler rules (G1), likes, replies (G2), reply notices, report (G3), own menu (G4–G5), counts (C2) | Two test accounts at different pages see exactly what they should. |
| **6 · You and account** | You (I1–I2), avatar upload, sign out, delete account (after D57) | |
| **7 · Desktop and hardening** | Desktop layouts (DK1–DK4), the three undrawn small states (built from existing patterns), empty/loading/error states, accessibility pass, Terms/Privacy pages, SMTP, domain | Launch checklist (§9) passes. **Closed beta.** |

## 9. Testing

- **Unit (Vitest):**
  - normalization (page ↔ %, missing counts, capping at 100)
  - status transitions (to 100, back below 100)
  - reflection eligibility: thresholds, chain head, first and second skip, only one per check-in, no final Thoughts
  - the headline rule
- **Database policy tests (pgTAP or Supabase test helpers), highest priority.** These run against real RLS with several test users:
  - Want to Read and not-in-library viewers get **zero** Thoughts but correct counts.
  - A reader at 40% never receives a Thought, reply or like anchored above 40%, including through replies and chain parents.
  - Finished readers see everything shared.
  - Private Thoughts are never visible to others, including a **private parent of a shared reflection**.
  - Unsharing or deleting hides replies and likes, and the rows still exist.
  - A Thought's position can't be updated.
  - Counts return numbers only.
  - Report rows can't be read by other users.
- **End-to-end (Playwright),** at 390×844 and 1440×1024:
  - sign in → add a book → check in → Thought → later check-in → reflection → respond → book page → Readers → reply → finish → journey
  - the email code flow (using a test inbox)
  - the Google button renders; the real Google flow is checked manually
- **Edge cases:**
  - an unknown page count
  - switching between page and %
  - moving backward
  - skipping twice
  - "Write something new instead"
  - leaving mid-check-in, then the waiting card
  - two Reading books
  - deleting a Thought in a chain
  - an Open Library outage (error state) and missing covers (fallback)
  - very long Thoughts and titles
  - a reader with no display name sharing for the first time
- **Responsive and device:**
  - iOS Safari and Android Chrome: the keyboard never covers Save, and sheets and safe areas behave
  - 200% zoom and large system text
  - the desktop reading width holds at 1920px
- **Accessibility:**
  - automated axe checks
  - WCAG AA contrast, including quiet text on pink
  - visible focus and 44px targets
  - screen reader labels for progress, privacy and the spoiler bookmark
  - reduced motion
- **Before launch:**
  - RLS reviewed by hand and Supabase's security advisor run
  - rate limits on auth and writes
  - backups on
  - SMTP deliverability tested
  - Terms and Privacy pages live
  - old secrets rotated
  - Render, Stripe and other retired services shut down or scheduled

## 10. Repo mapping (new repo layout)

```
reezy-production/
  CLAUDE.md, docs/                    ← existing
  app/                                ← Next.js routes (§7.1)
    (auth)/welcome/, auth/callback/
    (app)/page.tsx (Today), books/, book/[workId]/, you/
  components/                         ← §7.2
  lib/
    supabase/ (server + browser clients, middleware)
    openlibrary/ (search, work, edition, covers)
    reading/ (normalize.ts, status.ts, reflection.ts, headline.ts)
  supabase/
    migrations/ (tables, triggers, RLS, definer functions)
    tests/ (policy tests)
  tests/ (unit + e2e)
  tailwind.config.ts                  ← tokens from Figma 01 — Foundations
```

`reezy-kunal` is referenced only for the items in §1 and retired per §4. It isn't edited.
