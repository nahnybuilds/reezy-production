# Decision Log

Lightweight record of product and architecture decisions. Newest at the bottom. Status is one of: **Accepted**, **Proposed**, **Superseded** (link the replacement).

---

### D1 — V1 centers on the reading loop
- **Date:** 2026-09-29
- **Decision:** Reezy V1 centers on reading progress, Thoughts, reflection, and lightweight reader conversation.
- **Reason:** This is the core loop that differentiates Reezy from generic book trackers; everything else supports it.
- **Status:** Accepted

### D2 — No book clubs in V1
- **Date:** 2026-09-29
- **Decision:** Book clubs are not part of V1.
- **Reason:** Adds scope and social complexity that doesn't serve the core loop.
- **Status:** Accepted

### D3 — No AI-generated reflections in V1
- **Date:** 2026-09-29
- **Decision:** AI-generated reflections are not part of V1.
- **Reason:** Keeps costs, complexity, and unpredictability low; the reader's own words are the value.
- **Status:** Accepted

### D4 — Reflections use stored Thoughts plus templates
- **Date:** 2026-09-29
- **Decision:** V1 reflections use stored user Thoughts plus simple product logic and prewritten templates.
- **Reason:** Delivers the reflection experience without any LLM dependency.
- **Status:** Accepted

### D5 — Thoughts can be private or shared
- **Date:** 2026-09-29
- **Decision:** Each Thought is either "Just Me" (private) or "Share with Readers" (shared).
- **Reason:** Readers need a safe private space while still being able to join the conversation.
- **Status:** Accepted

### D6 — Shared Thoughts are progress-aware
- **Date:** 2026-09-29
- **Decision:** Shared Thoughts are filtered by reading progress to reduce spoilers.
- **Reason:** A reader at page 50 shouldn't automatically see a Thought from page 200.
- **Status:** Accepted

### D7 — One canonical conversation per book
- **Date:** 2026-09-29
- **Decision:** Each book has one shared conversation; users do not create separate communities.
- **Reason:** Simpler to build and moderate, and concentrates activity rather than fragmenting it.
- **Status:** Accepted

### D8 — One responsive app for desktop and mobile
- **Date:** 2026-09-29
- **Decision:** Desktop and mobile use the same responsive web application.
- **Reason:** One codebase is maintainable by a founder without a dedicated engineering team.
- **Status:** Accepted

### D9 — Existing designs are references only
- **Date:** 2026-09-29
- **Decision:** Existing Figma designs (and old code) are references only and do not dictate the new flow.
- **Reason:** They represent a previous version of Reezy; the V1 spec in `PRODUCT.md` is the source of truth.
- **Status:** Accepted

### D10 — Extremely lightweight infrastructure
- **Date:** 2026-09-29
- **Decision:** Keep infrastructure and operating costs extremely lightweight.
- **Reason:** Founder-maintained product; every extra service is ongoing cost and maintenance.
- **Status:** Accepted

### D11 — New workspace, old repo kept as reference
- **Date:** 2026-09-29
- **Decision:** The V1 rebuild lives in a new folder (`~/Documents/GitHub/reezy`). The previous codebase (`~/Documents/GitHub/reezy-kunal`) is left untouched and used as a reference during the audit.
- **Reason:** Keeps V1 docs and code clean of old scope; avoids overwriting the old repo's own `Claude.md`.
- **Status:** Accepted; repo location superseded by D65

### D12 — Progress normalized to percentage
- **Date:** 2026-09-29
- **Decision:** Users may enter page or percentage. Internally, reading position is stored as a normalized percentage; page entries are converted when total page count is known. The UI may display the format the reader used.
- **Reason:** Positions must be comparable across readers and editions for spoiler rules and reflection logic.
- **Status:** Accepted

### D13 — Multiple Reading books, no primary book
- **Date:** 2026-09-29
- **Decision:** A user may have multiple Reading books. Today defaults to the most recently updated one, with a lightweight switcher. No "primary book" setting.
- **Reason:** Matches how people actually read without adding a setting to manage.
- **Status:** Accepted

### D14 — Editions share one conversation
- **Date:** 2026-09-29
- **Decision:** All editions of a work share one canonical conversation. Edition/ISBN metadata is preserved, but Thoughts and conversation attach to the parent work.
- **Reason:** Avoids splitting readers by format and keeps conversations active.
- **Status:** Accepted

### D15 — Spoiler visibility by reading status
- **Date:** 2026-09-29
- **Decision:** Want to Read: no reading Thoughts by default. Reading: shared Thoughts at or behind the reader's normalized progress. Finished: all shared Thoughts.
- **Reason:** Protects readers from spoilers with one simple, predictable rule.
- **Status:** Accepted

### D16 — Replies are spoiler-aware
- **Date:** 2026-09-29
- **Decision:** Each reply stores the replier's progress at the time of replying and is only shown to readers who have reached that position.
- **Reason:** A reply can reveal later events even when the original Thought was early in the book.
- **Status:** Superseded by D26

### D17 — Reflection responses are linked Thoughts
- **Date:** 2026-09-29
- **Decision:** A response to a resurfaced Thought is saved as a new Thought linked to the original, with its own progress, timestamp, and privacy (Just Me or Shared), forming a reflection chain.
- **Reason:** Captures how a reader's view changes over the book using one simple data type.
- **Status:** Accepted

### D18 — Reflection eligibility: ~10 points of progress
- **Date:** 2026-09-29
- **Decision:** A Thought becomes eligible to resurface after about 10 percentage points of additional progress. Avoid resurfacing the same Thought repeatedly unless there's a meaningful linked chain. No AI.
- **Reason:** Simple, explainable rule that's easy to tune later.
- **Status:** Accepted

### D19 — In-app reply visibility only
- **Date:** 2026-09-29
- **Decision:** V1 shows replies to a user's shared Thoughts in-app only. No email, push, or notification service.
- **Reason:** Keeps infrastructure and cost minimal.
- **Status:** Accepted

### D20 — Minimal moderation
- **Date:** 2026-09-29
- **Decision:** Shared Thoughts and replies have a basic Report action. Users can delete their own Thoughts and replies. Moderation infrastructure stays minimal.
- **Reason:** Public conversation needs a baseline safety valve without building a moderation system.
- **Status:** Accepted

### D21 — Users manage their own Thoughts
- **Date:** 2026-09-29
- **Decision:** Users can edit and delete Thoughts, and switch them between Just Me and Shared.
- **Reason:** Readers need control over what they've written and shared.
- **Status:** Accepted

### D22 — Minimal profile, backward progress allowed
- **Date:** 2026-09-29
- **Decision:** Profile has display name, optional avatar, reading history, Thought history, and account settings. No followers, follower counts, bios, DNF status, or rereading. Users may move progress backward to correct mistakes.
- **Reason:** Keeps V1 focused on the reading loop rather than social-graph features.
- **Status:** Accepted

### D23 — Positioning statement
- **Date:** 2026-09-29
- **Decision:** Positioning: "Reezy is a reading companion that goes beyond tracking what you read by helping you capture and revisit what you think while you're reading."
- **Reason:** Describes the difference from trackers without dismissing tracking, which Reezy also does.
- **Status:** Accepted

### D24 — Ask for copy page count when unknown
- **Date:** 2026-09-29
- **Decision:** If a reader uses page-based progress and the API has no reliable page count, ask "How many pages is your copy?" with an option to switch to percentage. Store the copy page count per reader per book.
- **Reason:** Page numbers can't be normalized without a total; asking once avoids friction at every check-in.
- **Status:** Accepted

### D25 — Normalize against the reader's copy
- **Date:** 2026-09-29
- **Decision:** Page progress is normalized against the reader's own copy/edition page count, not a universal work page count. The normalized percentage drives cross-edition spoiler and reflection logic.
- **Reason:** Page 84 of a 250-page paperback and page 84 of a 400-page hardcover are different places in the story.
- **Status:** Accepted

### D26 — Replies inherit the parent Thought's position
- **Date:** 2026-09-29
- **Decision:** Replies inherit the spoiler position of their parent Thought, not the replier's progress. The reply UI tells readers to discuss only up to that point. No AI spoiler detection or reply classification. Replaces D16.
- **Reason:** Simpler, keeps whole threads visible together, and avoids hiding every reply from finished readers.
- **Status:** Accepted

### D27 — Correcting from 100% returns book to Reading
- **Date:** 2026-09-29
- **Decision:** Changing a Finished book's progress below 100% automatically moves it back to Reading.
- **Reason:** Status should always match progress; no separate "unfinish" action needed.
- **Status:** Accepted

### D28 — Final reflection is a standalone Thought at 100%
- **Date:** 2026-09-29
- **Decision:** The answer to the final question is stored as a Thought at 100%, normally not linked to an earlier Thought. The reader chooses Just Me or Shared.
- **Reason:** Reuses the Thought model; no special data type.
- **Status:** Accepted

### D29 — Private parents never exposed
- **Date:** 2026-09-29
- **Decision:** A Shared reflection linked to a Just Me Thought never displays or quotes the private parent publicly.
- **Reason:** Privacy settings must be trustworthy.
- **Status:** Accepted

### D30 — Skipped reflections shown at most once more
- **Date:** 2026-09-29
- **Decision:** A skipped resurfaced Thought may reappear at most one more time, after another threshold of progress, then stops.
- **Reason:** Gives a second chance without nagging.
- **Status:** Accepted

### D31 — Reflection continues from newest Thought in a chain
- **Date:** 2026-09-29
- **Decision:** After a reader responds to a resurfaced Thought, future reflection uses the newest Thought in that chain, not the original.
- **Reason:** Moves the reflection forward instead of repeating the same prompt.
- **Status:** Accepted

### D32 — Edit text/privacy only; soft-hide on unshare/delete
- **Date:** 2026-09-29
- **Decision:** Users can edit a Thought's text and privacy, not its position (delete and recreate instead). When a Shared Thought becomes private or is deleted, its replies and likes stop displaying publicly but records are preserved in the database.
- **Reason:** Fixed positions keep spoiler logic trustworthy; preserving records avoids destroying other users' content.
- **Status:** Accepted

### D33 — Reports stored for manual review
- **Date:** 2026-09-29
- **Decision:** Reports are stored in the database for manual founder/admin review. No automatic hiding and no admin system in V1.
- **Reason:** Minimal moderation that still gives a paper trail.
- **Status:** Accepted

### D34 — V1 technical stack approved
- **Date:** 2026-09-29
- **Decision:** Next.js + TypeScript on Vercel, Tailwind CSS, Supabase (Postgres, Auth, Storage), Open Library for book data. No separate backend, no AI, no Stripe, no external notification service. V1 is built cleanly in this repo; `reezy-kunal` is reference only.
- **Reason:** Fewest moving parts for a founder-maintained responsive web app; reuses the existing Supabase account. See ARCHITECTURE.md §3–5.
- **Status:** Accepted

### D35 — Sign-in with email and Google
- **Date:** 2026-09-29
- **Decision:** V1 supports email and Google sign-in via Supabase Auth.
- **Reason:** Covers most readers with minimal setup.
- **Status:** Accepted

### D36 — V1 UX direction approved
- **Date:** 2026-09-29
- **Decision:** The V1 UX plan recorded in `DESIGN.md` is approved: five routes (Welcome, Today, Books, Book, You), a single check-in sheet for progress → Thought/reflection, sheets and inline states instead of extra pages.
- **Reason:** Keeps the core loop to seconds and the number of screens and decisions minimal.
- **Status:** Accepted

### D37 — Reflection lives inside the check-in
- **Date:** 2026-09-29
- **Decision:** When a reflection is due, it is the primary prompt after progress is updated. The reader can always choose "Write something new instead" or skip; responding is never forced. Today only shows a reflection if the reader left mid-check-in.
- **Reason:** Eligibility changes when progress changes, so the check-in is the natural moment; one prompt per check-in instead of two competing ones.
- **Status:** Accepted

### D38 — "What's on your mind?"
- **Date:** 2026-09-29
- **Decision:** The normal Thought prompt is "What's on your mind?" with supporting copy "Capture something you want to remember from this point in the book." Replaces "Anything you want to remember?"
- **Reason:** Warmer and more open; supporting copy keeps the margin-note intent.
- **Status:** Accepted

### D39 — Passwordless email codes plus Google
- **Date:** 2026-09-29
- **Decision:** Email sign-in uses one-time codes. No passwords, no password-reset flow. Google sign-in as well (refines D35).
- **Reason:** Removes several screens and support burden; codes work better than magic links on mobile.
- **Status:** Accepted

### D40 — No Reading History in You
- **Date:** 2026-09-29
- **Decision:** Remove Reading History from You. Finished books live under Books. You holds Thought history and inline settings.
- **Reason:** Avoids duplicating Books → Finished.
- **Status:** Accepted

### D41 — Display name requested only when needed
- **Date:** 2026-09-29
- **Decision:** Ask for a display name only when the reader first shares publicly, unless Google already supplied one.
- **Reason:** Shortens onboarding; private-only readers never need one.
- **Status:** Accepted

### D42 — Thoughts default to Just Me
- **Date:** 2026-09-29
- **Decision:** New Thoughts default to Just Me. Sharing with readers is a deliberate toggle.
- **Reason:** Keeps capture feeling like a margin note; social layer stays secondary.
- **Status:** Accepted

### D43 — "I finished it" shortcut
- **Date:** 2026-09-29
- **Decision:** The check-in offers an "I finished it" shortcut that sets progress to 100%.
- **Reason:** Readers shouldn't need to know or type the last page.
- **Status:** Accepted

### D44 — No Thought page, inbox, or settings page
- **Date:** 2026-09-29
- **Decision:** Threads open as a sheet (mobile) or side panel (desktop); reply notices are a line on Today; settings are an inline section on You.
- **Reason:** Fewer screens to design, build, and maintain.
- **Status:** Accepted

### D45 — Conversation counts without content
- **Date:** 2026-09-29
- **Decision:** Want to Read readers may see a conversation count ("23 readers are talking about this"). Reading readers may see a count of Thoughts ahead of their position. Neither shows content.
- **Reason:** Adds pull to start and keep reading without spoilers. Consistent with D15.
- **Status:** Accepted

### D46 — Visual system approved: "the annotated book"
- **Date:** 2026-09-29
- **Decision:** The visual system in DESIGN.md §9 is approved and locked. Paper and ink surfaces; plum = brand ink, pink = memory/reflection, lime = highlighter/now. Light mode only in V1.
- **Reason:** Comfortable reading and writing with an intentional, distinctive brand; accessible contrast.
- **Status:** Accepted

### D47 — Typography: Rafter Bold, Instrument Sans, Newsreader
- **Date:** 2026-09-29
- **Decision:** Rafter Bold for brand/display moments only; Instrument Sans for product UI; Newsreader for the reader's own words. Bricolage Grotesque, Rammetto One, and Inter (as primary) are dropped.
- **Reason:** Rafter is the designer's chosen brand face; open-source companions keep cost at zero; the sans/serif split makes Thoughts feel like margin notes.
- **Status:** Superseded in part by D52 (brand font is now Rammetto One; Instrument Sans and Newsreader unchanged)

### D48 — #F4FD1D is the only lime
- **Date:** 2026-09-29
- **Decision:** `#F4FD1D` is the only Reezy lime. `#D4F060` and `#DBE4AA` are retired.
- **Reason:** One brand lime; the older limes came from the superseded direction.
- **Status:** Accepted

### D49 — Old creative brief superseded
- **Date:** 2026-09-29
- **Decision:** `Reezy_Brief.pdf` is superseded for product, UX, and visual decisions. It may be used only as loose cultural reference where it doesn't conflict with PRODUCT.md or DESIGN.md.
- **Reason:** It describes the old sprint/streak product and a dark, no-pastel direction that conflicts with the current brand.
- **Status:** Accepted

### D50 — Placeholders don't block design; Rafter license before production
- **Date:** 2026-09-29
- **Decision:** Figma work uses the supplied worm/logo as-is, or a labeled placeholder if it doesn't render; never redrawn. Rafter is used if available, otherwise a labeled display-font placeholder. The Rafter web/app license must be verified before production implementation.
- **Reason:** Keeps design moving without committing to unlicensed or unfinished assets.
- **Status:** Superseded in part by D52 (Rafter is no longer used, so its license check is no longer needed; the worm/logo placeholder rule still applies)

### D51 — Old Figma not used
- **Date:** 2026-09-29
- **Decision:** The old Reezy Figma is not inspected or used, even as visual reference. V1 design starts fresh from PRODUCT.md, DESIGN.md, the logo, palette, and typography.
- **Reason:** Removes any risk of the old product flow influencing V1.
- **Status:** Accepted

### D52 — Rammetto One replaces Rafter as brand/display font
- **Date:** 2026-09-29
- **Decision:** Rammetto One is the approved Reezy brand/display font for now, used only in the `Brand/*` styles and brand moments. Rafter is no longer used and is not a production dependency or licensing blocker. Instrument Sans (UI) and Newsreader (reader Thoughts/reflections) are unchanged. This also reverses Rammetto One's earlier "drop" status in DESIGN.md §9.16.
- **Reason:** Rammetto One was already part of the previous Reezy assets and is licensed under the SIL Open Font License for commercial use, which removes a licensing dependency.
- **Status:** Accepted

### D53 — Book page: margin and readers as two tabs; chains grouped
- **Date:** 2026-09-29
- **Decision:** The book page shows **Your margin** and **Readers** as a segmented control under the book's hero and progress. In Your margin, a reflection chain is grouped under its original Thought (threaded in pink) rather than scattered by page.
- **Reason:** Keeps the personal margin first, keeps the page short on mobile, and keeps "what I thought → what I think" readable.
- **Status:** Accepted (approved with the Figma freeze, D59)

### D54 — Design-system additions from the sprint
- **Date:** 2026-09-29
- **Decision:** Added the text style `UI/Heading` (28/34), the color `status/danger` `#A8201A` (destructive actions only), the mobile tab bar and desktop top bar components, and a compact Just me / Shared switch for the writing toolbar.
- **Reason:** Each was needed by a V1 screen; nothing else was added.
- **Status:** Accepted

### D55 — Conversation count also shown before a book is added
- **Date:** 2026-09-29
- **Decision:** A book page for a book not yet in the reader's library shows the same content-free count as Want to Read ("23 readers are talking about this"). This extends D45.
- **Reason:** It's the same spoiler-safe signal, at the moment a reader decides whether to start.
- **Status:** Accepted (approved with the Figma freeze, D59)

### D56 — Text-only navigation
- **Date:** 2026-09-29
- **Decision:** The mobile tab bar and desktop top bar use text labels only (Today · Books · You) with a plum dot for the active tab; no icons.
- **Reason:** Three tabs don't need icons; it's more editorial and less SaaS.
- **Status:** Accepted (approved with the Figma freeze, D59)

### D57 — Account deletion removes the user's content
- **Date:** 2026-09-29
- **Decision:** The Delete account copy currently says it removes the reader's books and Thoughts and the replies they wrote. This differs from D32, where deleting a single Thought preserves other readers' replies to it.
- **Reason:** Placeholder behaviour drawn for the settings screen; it needs a real decision (delete everything vs. anonymise) before build.
- **Status:** Superseded by D60

### D58 — Brand integration pass
- **Date:** 2026-09-29
- **Decision:** Final visual/brand pass, with no IA or feature changes. It adds:
  - Rammetto One for the reflection resurfacing headline and the Today page number
  - a pink full sheet with a pinned white note rotated −1.5° for reflection, as the maximum treatment (no tape, pins, doodles or textures)
  - six worm appearances (Welcome, first-run Today, empty states, reflection, finish, end of journey), none in Readers
  - Readers as marginalia on a page spine, with a lime bookmark boundary and secondary reader identity
  - an underline active state on mobile tabs and a desktop editorial masthead
  - the Today cover kept straight
  - real Open Library covers in Figma for internal review only
- **Reason:** Makes Reezy feel editorial, tactile and distinctive rather than a polished utility, while keeping every approved flow and rule.
- **Status:** Accepted

### D59 — Figma V1 design frozen
- **Date:** 2026-09-29
- **Decision:** The Figma file "Reezy V1 — Product Design" (pages 01–04 and the prototype) is the approved V1 source of truth for UI. No further aesthetic or UX changes unless implementation exposes a real usability problem or the founder asks. The reflection interaction ("72 pages later.", pink sheet, pinned note, hierarchy) and the spoiler-safe Readers marginalia must be implemented exactly. Logo and worm stay as placeholders and don't block development. D53, D55 and D56 are accepted with this freeze.
- **Reason:** Founder approval after review.
- **Status:** Accepted

### D60 — Account deletion removes the user's own content
- **Date:** 2026-09-29
- **Decision:** Deleting an account deletes the user's own content: books, check-ins, Thoughts, replies they wrote (including on other people's Thoughts), likes and reflection history. Their Thoughts become content-free **tombstones** (text erased, author removed, marked deleted) only so that *other readers'* replies to them can remain stored but hidden, consistent with D32. Reports they filed keep the report but drop the reporter.
- **Reason:** The user's words leave with them; other readers' words are never destroyed by someone else's action.
- **Status:** Accepted

### D61 — Infrastructure setup choices for V1
- **Date:** 2026-09-29
- **Decision:**
  - A **new** Supabase project in the founder's existing account; the old database isn't reused.
  - **Resend** for production auth email; Supabase's default email during development, which doesn't block the first build.
  - **Vercel**, with no plan purchase yet; the commercial plan requirement is flagged before public launch.
  - `reezy` is initialized as its own git repo; `reezy-kunal` stays reference-only.
  - Rotating old secrets and auditing old services are separate housekeeping, not part of V1 work.
  - Draft Terms and Privacy pages are written as placeholders and don't block development.
- **Reason:** Founder decisions on the implementation plan.
- **Status:** Accepted; repo item superseded by D65

### D62 — Reflection headline is narrative, never a percentage
- **Date:** 2026-09-29
- **Decision:** The reflection headline names the gap as a story. Both positions tracked by page on the same copy, with meaningful movement → "72 pages later." Percentage tracking, or when time is the stronger story → "8 days later." / "Two weeks later." Very short intervals → "A little later." No "% later" copy. "72 pages later." is preserved exactly for the approved Piranesi flow.
- **Reason:** Keeps the signature moment narrative rather than analytical.
- **Status:** Accepted

### D63 — V1 schema: 9 tables, editions deferred; copy page count is authoritative
- **Date:** 2026-09-29
- **Decision:** V1 uses 9 tables (`profiles`, `works`, `user_books`, `check_ins`, `thoughts`, `reflection_events`, `replies`, `likes`, `reports`) plus an `avatars` storage bucket. The `editions` table is deferred; edition data V1 needs (ISBN, edition key, the reader's copy page count) lives on `user_books`. **`user_books.copy_page_count` and normalized `position_pct` are authoritative** for progress and spoiler visibility. `works.page_count_median` is metadata/fallback only, never used for visibility. Spoiler visibility compares normalized positions, never raw page numbers across copies. The Thought/reflection architecture is approved as specified (responses are new Thoughts; `parent_thought_id` = then → now; `chain_root_id` groups a chain; `reflection_events` records behavior; privacy is per Thought; deleting/unsharing never corrupts a chain or exposes hidden content).
- **Reason:** Founder schema review.
- **Status:** Accepted

### D64 — Reezy Production database and least-privilege grants
- **Date:** 2026-09-29
- **Decision:** The V1 database is the Supabase project **Reezy Production** (`drzrdvxvrrhatlyunuyi`, us-east-1, Postgres 17). It was created with automatic table exposure disabled, so API access is granted explicitly, table by table (`explicit_grants` migration): readers get only the approved read/write rights, the server-only secret key gets read everywhere plus writes to `works` (and report status), no API role can TRUNCATE, and future tables stay private until a migration grants them. Function EXECUTE is limited to signed-in readers (`function_privileges` migration). Local migration files are named with the versions recorded in production.
- **Reason:** Keeps the database private by default while enabling exactly the RLS architecture in D63.
- **Status:** Accepted

### D65 — Canonical repository: `nahnybuilds/reezy-production`
- **Date:** 2026-09-30
- **Decision:** The canonical Reezy V1 codebase is the private GitHub repository `nahnybuilds/reezy-production`, cloned locally at `~/Documents/GitHub/reezy-production/`. It started fresh: the approved docs, the 6 production migrations and the database test harness were copied in verbatim as new files, and the reviewed Phase 0 foundation code was ported into a fresh Next.js scaffold. No old Git history was carried over. The earlier local `~/Documents/GitHub/reezy` folder is archived reference only and is never pushed. `reezy-kunal`, `reezy-literary-launch` and other old repositories are legacy and untouched. Work lands through branches and pull requests per coherent build phase. Local GitHub access uses a repo-local credential helper (`gh`, signed in as `nahnybuilds`); global Git configuration is unchanged.
- **Reason:** A clean technical foundation without discarding approved product, design and database decisions.
- **Status:** Accepted
