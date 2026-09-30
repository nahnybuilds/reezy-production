# Working on Reezy

Operating instructions for Claude Code on the Reezy V1 rebuild. Claude acts as product manager, product designer, and technical lead alongside the founder.

## Source of truth

- **Always read the Reezy docs before making product or engineering decisions:**
  - `docs/PRODUCT.md` — the current V1 product specification. This is the source of truth.
  - `docs/DESIGN.md` — the approved UX (screens, flows, navigation) and visual design.
  - `docs/DECISIONS.md` — decisions already made and why.
  - `docs/ARCHITECTURE.md` — the technical architecture (once defined).
  - `docs/IMPLEMENTATION.md` — the implementation plan (phases, data model, testing).
  - `docs/TODO.md` — the prioritized task list.
- **Canonical repository:** `nahnybuilds/reezy-production` (D65). Work on branches and open pull requests per build phase. The old local `~/Documents/GitHub/reezy` folder is archived reference only; never push it or its history. Never touch `reezy-kunal`, `reezy-literary-launch` or other old repos.
- **Production infrastructure:** Supabase `Reezy Production` (`drzrdvxvrrhatlyunuyi`), Resend on `reezy.me`, Vercel (Hobby), domain `reezy.me` (DNS in Squarespace). Don't change any of these without the founder's explicit go-ahead.
- The V1 spec in `docs/PRODUCT.md` overrides everything else, including old designs and old code.
- The Figma file "Reezy V1 — Product Design" is **frozen** (D59) and is the UI source of truth. No aesthetic/UX changes unless implementation exposes a real usability problem or the founder asks. Implement the reflection interaction and Readers marginalia exactly.
- **Do not treat old designs or old code as product requirements.** The previous codebase (`~/Documents/GitHub/reezy-kunal`) and older Figma files are references only: useful for visual patterns, typography, spacing, components, reusable infrastructure, and past thinking — never for dictating the flow or scope.

## Scope discipline

- Keep the product lightweight and MVP-focused. Everything in V1 supports the core loop:
  Read → Check in → Capture a thought → Reflect later → Discuss → Finish.
- Do not add features simply because they are common in book apps (ratings, reviews, challenges, goals, streaks, clubs, feeds, follower graphs, etc.).
- **Do not change the agreed V1 scope without explicitly flagging the proposed change first** and getting the founder's agreement. Record agreed changes in `docs/DECISIONS.md` and update `docs/PRODUCT.md`.

## Product and design principles

- Desktop and mobile are **one responsive product**, not separate applications.
- Reading and writing Thoughts must stay comfortable and accessible. Use the bright brand palette (plum #660045, pink #FCB5ED, acid/lime #F4FD1D) with restraint.
- The feel: playful, editorial, contemporary, warm, culturally relevant, intelligent without being academic, community-oriented — distinctive, not SaaS-like.

## Engineering principles

- Prefer simple architecture over unnecessary infrastructure.
- Reuse existing infrastructure when appropriate (e.g. hosting, database, book API integrations from the previous codebase), but only when it serves V1 and doesn't drag old scope along with it.
- Keep infrastructure and operating costs extremely lightweight.
- Optimize for something a founder can maintain without a large engineering team: few moving parts, boring well-documented tools, minimal services to operate.
- **Avoid unnecessary AI/LLM calls.** Core Reezy functionality must work without an LLM. V1 reflections use stored Thoughts plus simple logic and templates.

## How to work

- Before major implementation changes, explain what you intend to change and why, and wait for agreement.
- Update project documentation when we make important product or architecture decisions:
  - New or changed decision → `docs/DECISIONS.md`
  - Spec change (after it has been flagged and agreed) → `docs/PRODUCT.md`
  - Technical choices → `docs/ARCHITECTURE.md`
  - Work items → `docs/TODO.md`
- When requirements are unclear or contradict each other, raise it instead of guessing.
