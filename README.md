# Reezy

A reading companion that goes beyond tracking what you read by helping you capture and revisit what you think while you're reading.

**Start with the docs:** `CLAUDE.md`, then `docs/PRODUCT.md`, `docs/DESIGN.md` (the Figma "Reezy V1 — Product Design" is frozen, D59), `docs/IMPLEMENTATION.md` and `docs/DECISIONS.md`.

## Stack
Next.js (App Router) + TypeScript + Tailwind · Supabase `Reezy Production` (Postgres, Auth, Storage) · Open Library · Resend (auth email) · Vercel. No AI (D3).

## Local setup
1. `npm install`
2. `cp .env.example .env.local` and fill in the Supabase URL and publishable key (never commit `.env.local`). The secret key isn't needed until Phase 1.
3. `npm run dev` → http://localhost:3000 (dev-only token check at `/dev/foundations`).

## Database
- `supabase/migrations/` mirrors the migrations applied to Reezy Production (file names are the recorded versions).
- Privacy and spoiler policy tests run those migrations in an in-process Postgres (no Docker, no production data): `npm run test:db`.

## Scripts
`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`

## Brand assets
Logo and worm are placeholders until the final files arrive. Put them in `public/brand/` and set the paths in `lib/brand.ts`; every appearance uses `<LogoSlot>` / `<WormSlot>`.
