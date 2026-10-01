# TODO

Prioritized project task list. Phase 0 foundation is merged in `reezy-production`; Phase 1 (sign in and add a book) is in review.

## Housekeeping (separate from V1 build, D61)

- [ ] Check whether `reezy-kunal/backend/.env.docker` holds real secrets. If so, rotate them and remove the file from that repo.
- [ ] Confirm you own or have admin access to: Supabase, Render, Google Cloud (OAuth), Expo/EAS, Stripe, Cloudinary, Mixpanel
- [ ] Check which old services are still running or billing (Render, Supabase, Cloudinary), and decide when to shut them down

## Next: implementation plan approval

- [x] Founder approves `docs/IMPLEMENTATION.md` (with D60–D62)
- [x] Founder approves the schema (9 tables, D63), then start Phase 0
- [x] Draft V1 Terms + Privacy placeholder pages (marked DRAFT) for founder review (Phase 1)
- [ ] **Founder:** review/replace the DRAFT Terms and Privacy text before public launch
- [ ] Before public launch: Vercel commercial plan; Resend production SMTP; domain
- [ ] Final vector worm/logo from the designer, then replace `LogoSlot` / `WormSlot` placeholders (not blocking)

## Phase 0: foundations (in `reezy-production`, D65)

- [x] Reezy Production database: 6 migrations applied, explicit grants, 24 rollback-only checks passed (D64)
- [x] Canonical repo `nahnybuilds/reezy-production` created; local access via repo-local `gh` credential helper
- [x] Docs, migrations and database tests copied in verbatim; foundation ported to a fresh Next.js 16 scaffold (first PR)
- [x] **Founder:** review and merge the foundation PR
- [x] **Founder:** import `nahnybuilds/reezy-production` into Vercel (Hobby, no purchase); add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → first preview deployment
- [x] **Founder:** Supabase Auth: Site URL + `/auth/callback` redirects; email code template (`{{ .Token }}`, 6 digits, 600s)
- [ ] **Founder:** Google provider (Google Cloud steps); the Welcome button appears automatically once enabled
- [ ] Performance tidy-up migration before launch: wrap `auth.uid()` as `(select auth.uid())` in policies; index 6 unindexed foreign keys

## Then: core loop (build in this order)

- [x] Phase 1: Auth (email one-time code; Google button hidden until configured) plus minimal onboarding (find a book → Reading + progress, or Want to Read), first-run Today, minimal Want to Read Today
- [ ] **Founder:** add `SUPABASE_SECRET_KEY` to the Vercel **Preview** environment (and to local `.env.local` yourself) to test adding books outside Production
- [x] Book search on Open Library; cache works (editions deferred, D63)
- [ ] Library statuses (Want to Read / Reading / Finished) and My Books
- [ ] Progress logging: page or %, "How many pages is your copy?", normalization, and status auto-updates
- [ ] Today screen: most recently updated Reading book, switcher, Log Progress, Leave a Thought
- [ ] Check-in flow: "Anything you want to remember?", Thought, Just Me / Shared
- [ ] Thoughts: create, edit text/privacy, delete, per-book history
- [ ] Reflection: eligibility rule, chains, skip limit, response as a linked Thought
- [ ] Finishing: reading journey plus the final question as a Thought at 100%

## Later: shared layer and polish

- [ ] Book page with the spoiler-aware shared conversation
- [ ] Likes and replies (inheriting the parent position, with the "up to this point" UI note)
- [ ] In-app "recent replies" on Today
- [ ] Report action plus reports table
- [ ] You: display name, avatar (Supabase Storage), Thought history, inline settings
- [ ] Responsive QA on desktop and mobile; accessibility pass

## Done

- [x] Project docs created (CLAUDE.md, PRODUCT, DECISIONS, ARCHITECTURE, TODO)
- [x] Product open questions resolved (D12–D33)
- [x] Read-only audit of `reezy-kunal`
- [x] V1 stack approved (D34); email + Google sign-in (D35)
- [x] V1 UX approved and recorded in DESIGN.md (D36–D45)
- [x] Visual system approved and locked in DESIGN.md §9 (D46–D50)
- [x] Figma file created; 01 — Foundations page built
- [x] Brand font switched to Rammetto One (D52)
- [x] V1 design sprint in Figma: core loop (02), complete mobile (03), desktop (04), prototype
- [x] Brand integration pass (D58): covers, worm placements, reflection, Readers marginalia, Today, navigation
