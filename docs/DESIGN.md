# Reezy V1 Design

> Approved UX (D36–D45) and visual system (D46–D50) for V1. `PRODUCT.md` defines *what* Reezy does; this document defines *how it's experienced*. If they conflict, PRODUCT.md wins; raise the conflict.
>
> Last updated: 2026-09-29 · Status: **UX approved** · Visual system: **approved and locked** · Figma V1 designs: **FROZEN (D59) — approved source of truth for implementation**

## Design principles

1. Reading is the primary activity, not scrolling Reezy.
2. A check-in takes seconds.
3. Capturing a Thought feels like jotting in the margin, not composing a post.
4. Reflection feels thoughtful and surprising, not like a productivity task.
5. Social interaction is secondary to the reader's relationship with the book.
6. No dashboards, dense analytics, or SaaS-looking UI.
7. Not Goodreads, not Fable, not a social feed.
8. Mobile especially matters (people check in while holding a book); desktop is first-class.
9. Minimum screens, controls, and decisions.
10. Progressive disclosure: don't show options until they're needed.

**The core idea:** the app is built around one sheet. A typical visit is open → tap → type a number → jot a line or skip → close, in under 15 seconds.

---

## 1. Routes

Five routes. Everything else is a sheet, an inline state, or a full-screen moment.

| Route | Purpose |
|---|---|
| `/welcome` | Signed-out entry and sign-in |
| `/` **Today** | Current book and check-in. First-run onboarding happens here as inline states. |
| `/books` | Search, plus Reading / Want to Read / Finished shelves |
| `/book/[id]` | Book detail: your margin and the readers' conversation |
| `/you` | Your Thoughts across all books, plus inline settings |

There's no separate page for onboarding, a single Thought, finishing, notifications, or settings (D44).

## 2. Screens

### Welcome
Primary action: **Continue with Google**.
- Logo and worm, with one line: *"Keep track of what you think while you read."*
- **Continue with Google** · **Continue with email** (one-time 6-digit code; no passwords, D39)

### Today
Primary action: **Log progress**.
- Current book: cover, title, position as a thin progress line plus *"p. 84 of 320"* (or %)
- A title ▾ switcher, only if the reader has more than one Reading book
- **Log progress** (the one big button) · **Leave a Thought** (quieter text button)
- A waiting reflection, only if one was offered at check-in and left unanswered (D37)
- Reply notice: one quiet line, e.g. *"2 replies to your Thought at p. 84"*. Hidden when there are none. Not a feed.
- Empty state: the worm, *"What are you reading?"*, and a search field

### Books
Primary action: search.
- A search field at top; while typing, results replace the shelves
- A segmented control: Reading · Want to Read · Finished
- A simple list: cover, title, author, and progress for books being read

### Book page
The primary action depends on the reader's status:

| Status | Primary action |
|---|---|
| Not in library | **Start reading** (secondary: *Want to read*) |
| Want to Read | **Start reading** |
| Reading | **Log progress** |
| Finished | **Your journey** |

- Cover, title, author, collapsed description (*more*), page count
- **Your margin:** the reader's Thoughts in page order, with reflection chains visually threaded
- **Readers:** shared Thoughts up to the reader's position, then a boundary line: *"14 more Thoughts ahead. Keep reading."* (count only, D45)
- Want to Read readers see only *"23 readers are talking about this"*, with no content (D45)
- … menu for rare actions: change status, remove from library, edit copy page count

### You
Primary action: none (a place to look back).
- Display name and avatar
- All Thoughts, grouped by book, newest first; filter All / Shared
- Settings as a collapsed inline section: name, avatar, sign out, delete account
- No reading history (D40); Finished books live under Books

## 3. The check-in sheet

One sheet, two steps. This is the heart of the product.

**Step 1: Where are you?**
- One number field, pre-filled with the last position, numeric keypad on mobile
- *page / %* toggle, remembered per book
- If pages are chosen and the page count is unknown, this appears inline: *"How many pages is your copy?"*
- An **"I finished it"** shortcut (D43)
- **Save**

**Step 2: one prompt**, in the same sheet:

- **If a reflection is due (primary, D37):**
  > At p. 84 you wrote:
  > *"I don't trust this character."*
  > You're on p. 156 now. Still feel that way?

  A writing field, then **Write something new instead** · **Skip**. Responding is never required.
- **Otherwise (D38):**
  > **What's on your mind?**
  > Capture something you want to remember from this point in the book.

  A writing field · **Not now**

Writing controls: privacy defaults to **Just Me** (D42), with one small toggle: *"Share with readers at p. 156"*. **Save** closes the sheet with a quiet confirmation.

**Leave a Thought** (from Today) opens step 2's normal prompt directly, tagged *"at p. 156"*. Tapping the tag goes to step 1.

## 4. Flows

### First-time user
1. Welcome → Google, or email + code → Today (first-run state)
2. *"What are you reading right now?"* → search → tap a book
3. *"Where are you?"* → page/% (plus copy page count if needed)
4. Save → Today, with one worm line: *"When you're reading, check in here."*

Alternative path: *"Not reading anything right now"* → pick a book → Want to Read → Today shows it with **Start reading**.

There's no profile setup. A display name is asked only at first share, unless Google supplied one (D41).

### Returning reader
Open → Today (most recently updated Reading book) → **Log progress** → step 1 → step 2 (reflection if due, otherwise "What's on your mind?") → write or skip → sheet closes → back to reading.

### Sharing and replies
1. Toggle *Share with readers*. The first time only: *"Only readers who've reached p. 156 will see this."* and a display-name prompt if needed.
2. Another reader sees it under **Readers** on the book page once they reach that point. There's no global feed.
3. Tapping it opens the thread: a sheet on mobile, a side panel on desktop. There they can like it, reply, or report it via ….
4. The reply composer note: *"Keep it to p. 156, no spoilers past this point."*
5. The author sees *"1 reply to your Thought at p. 156"* on Today and on the Thought itself. There's no inbox or badge.

### Finishing a book
1. Enter 100% or the last page, or tap **I finished it**
2. Full-screen moment: a short worm celebration → **Your journey** (Thoughts in page order, chains threaded; a keepsake, not stats)
3. *"Looking back, what changed most about how you saw this book?"* → writing field plus privacy → Save or skip
4. The book moves to Finished. Today shows the next Reading book, or offers one from Want to Read, or search.
5. The journey can be revisited from the book page.

## 5. Navigation

**Mobile**
- A bottom tab bar: Today · Books · You
- No floating action button
- Sheets rise from the bottom. While writing, they expand to full height and the tab bar hides.
- The finish moment is full-screen

**Desktop**
- A slim top bar: wordmark on the left, Today · Books · You in the centre
- One centred reading column (~640px), with no sidebars on Today
- Sheets become centred dialogs
- Book page: book info in a sticky left column, Your margin and Readers on the right; threads open in a right side panel

## 6. Where interactions happen

| Interaction | Where |
|---|---|
| Log progress → Thought / reflection | Sheet (one sheet, two steps) |
| Leave a Thought | Sheet (step 2) |
| Copy page-count question | Inline in step 1 |
| Book switcher | Popover on the title |
| Waiting reflection, reply notices | Inline on Today |
| Search results | Inline, replacing the shelves |
| Start reading / Want to read | Inline buttons on the book page |
| Thread (Thought and replies) | Sheet on mobile / side panel on desktop |
| Edit, delete, change privacy, report | … menu → inline |
| Finish and journey | Full-screen moment |
| Onboarding | Inline states on Today |
| Settings | Inline section on You |

## 7. Design priorities

The screens and states that get the most design attention, in order:

1. **The check-in sheet:** seconds to use, a margin-note feel
2. **The reflection moment:** editorial quote treatment, the p. 84 → p. 156 gap made visible
3. **Today:** calm, nearly empty, one button
4. **The spoiler boundary on the book page:** trust plus anticipation
5. **Your journey (finish):** the payoff of the loop

## 8. Worm and logo

The worm and logo are **approved brand assets that are temporary**. The final files are still to come from the designer. Never redraw, approximate, recolor or reinterpret either one. Until the files arrive, every appearance uses a labelled placeholder: `Logo / PLACEHOLDER …` or `Worm / PLACEHOLDER — peek`.

- The worm is a **restrained recurring character**, not an assistant, mascot guide, chatbot or reward system. It never speaks, and never appears in navigation, buttons, check-in steps, writing, threads, loading, errors, You, or the Readers conversation.
- Appearances use the **single approved drawing**, cropped, scaled, rotated or masked at a frame edge. There are no invented poses.
- **Approved appearances (D58):**
  1. **Welcome:** full size, bleeding off the right edge of the plum screen.
  2. **First-run Today:** peeks over the top edge of the book cover. First run only.
  3. **Empty states:** peeks from behind the search field (empty Today), or sits on a shelf line (empty shelf).
  4. **Reflection resurfacing:** peeks over the top edge of the pinned note (~40px visible).
  5. **Finish celebration:** full size on plum.
  6. **End of Your journey:** tiny, curled below the final lime dot at the last page.
- The **R mark** is used for the app icon and favicon. The wordmark goes in the desktop masthead and the small Today masthead.

## 9. Visual system ✅ Locked (D46–D50)

### 9.1 Direction: "the annotated book"
Reezy should feel like a well-designed independent magazine that someone has been writing in the margins of. The base is warm paper and ink. Plum is the brand's ink; lime is the highlighter; pink is memory. The confidence comes from typography and restraint, not decoration. Screens are about 80% neutral, with at most one bright moment each. No dark mode in V1.

### 9.2 Typography: three voices, one job each

| Voice | Typeface | Use | Never |
|---|---|---|---|
| **Brand** | **Rammetto One** (OFL) | Welcome headline, finish celebration, empty-state headlines, the **reflection resurfacing headline** ("72 pages later."), and the **page number on Today** (plum, 40px mobile / 48px desktop). | Body, buttons, inputs, labels, nav, Thoughts, replies, book titles, anything under ~28px |
| **Product** | **Instrument Sans** (OFL). Fallback: Figtree. | All UI: nav, buttons, labels, prompts, book titles, metadata, replies | n/a |
| **Reader** | **Newsreader** (OFL). Fallback: Literata. | The reader's words: Thoughts, reflection quotes (italic), final reflection, book descriptions | UI chrome |

**Core rule:** Reezy speaks in sans; the reader writes in serif.

- Body text: 17px on mobile. Inputs are always ≥16px.
- Thoughts: 19–20px, line height 1.5.
- Page numbers use tabular figures.
- Sentence case throughout; no all-caps paragraphs.
- **Brand font:** Rammetto One is licensed under the SIL Open Font License, which permits commercial web/app use. There is no licensing blocker (D52). Rammetto One has a single weight (Regular, visually heavy).

### 9.3 Color

| Token | Value | Role | Never |
|---|---|---|---|
| `paper` | `#FAF7F2` | Page background | n/a |
| `surface` | `#FFFFFF` | Sheets, dialogs, writing surface | n/a |
| `ink` | `#1C1A1F` | Body text (16:1 on paper) | n/a |
| `ink-muted` | ~`#6B6470` (≥4.5:1) | Metadata, dates, quiet actions | Body copy |
| `rule` | ~`#E8E2DA` | Hairlines, progress track | n/a |
| `plum` | `#660045` | **Brand ink**: primary buttons, links, active tab, progress fill, wordmark, emphasis. Full-bleed only on Welcome and the finish moment. | Large areas on everyday screens |
| `pink` | `#FCB5ED` | **Memory**: reflection surfaces, reflection-chain threads, the writing margin rule, text selection | Text on light surfaces; decoration |
| `lime` | `#F4FD1D` | **Highlighter / now**: "you are here" dot, confirmation flash, highlighter fills behind ink text, accents on plum | Text on light surfaces; appearing without a dark partner |

- `#F4FD1D` is the **only** Reezy lime. `#D4F060` and `#DBE4AA` are retired.
- Measured contrast:

  | Pair | Ratio |
  |---|---|
  | Plum on paper | 11.9:1 |
  | Ink on lime | 15.5:1 |
  | Plum on pink | 7.9:1 |
  | Lime on plum | 11.5:1 |
  | Lime on paper | 1.04:1 (never use for text) |
  | Pink on paper | 1.5:1 (never use for text) |

- Lime always appears with plum or ink next to it.
- Each color keeps the same meaning everywhere.

### 9.4 Surfaces
- Paper page; white for sheets and writing.
- Flat surfaces separated by hairlines. No textures, gradients, or glass effects.
- Shadows only on sheets/dialogs and book covers.
- Plum full-bleed only on Welcome and the finish moment.
- **Pink full sheet** only for reflection resurfacing and the reflection response (and the desktop check-in dialog in that state).
- The faint outline-R repeat pattern is allowed on Welcome only.

### 9.5 Buttons

| Level | Treatment |
|---|---|
| Primary | Plum fill, paper text, pill shape, 52px tall on mobile, full width in sheets. **One per screen.** |
| Secondary | Plum text with a 1.5px plum outline, pill shape |
| Quiet | Muted-ink text, no border (Not now, Skip, Write something new instead) |
| Destructive | Deep red text, only inside … menus |

### 9.6 Inputs and writing
- **Progress:** large numerals (~48px) on an underline, no box. Numeric keypad on mobile. A small pill toggle for *page / %*.
- **Writing field:**
  - No box. White surface, Newsreader text.
  - A thin vertical **pink margin rule** on the left.
  - No counter, no toolbar.
  - The prompt sits above the field in Instrument Sans.
- **Focus:** a 2px plum ring, never color alone.

### 9.7 Book covers
- Real covers at 2:3 with 3–4px corners.
- A slight shadow plus a 1px inner hairline.
- Sizes: ~112px on Today (mobile), 48px in lists, hero size on the book page.
- **Missing cover:** a typographic cover with the title in Instrument Sans on a plum, pink, or paper block, chosen deterministically. No worm, no stock art.
- In Figma, covers are real Open Library artwork for **internal design review only** (Foundations → "Cover art library"). *The Ladies of Grace Adieu* deliberately keeps the typographic fallback. The UI never adapts to individual cover colors.

### 9.8 Thoughts (the reader's margin)
- No card chrome and no avatar on your own Thoughts.
- A margin page marker ("p. 84", small sans): in a left column on desktop, above the text on mobile.
- Newsreader text; date in muted ink.
- A small "Shared" label and icon only on shared Thoughts. Just Me is unmarked.
- Actions live in a … menu.

### 9.9 Reflection (signature moment)
This is the **maximum** treatment (D58). Don't add tape, pins, doodles, paper textures or other decoration; it should feel editorial and tactile, not like a scrapbook.
- **The whole sheet turns pink** when a reflection resurfaces, and stays pink for the response.
- **Rammetto One headline** in plum, naming the gap: "72 pages later." (or "Two weeks later." when time is the bigger gap).
- **Pinned note:** the old Thought on a white card, **rotated −1.5°**, with 4px corners and a soft plum-tinted shadow. It holds a date stamp ("Earlier you wrote · p. 84 · 12 Sep") and the quote in Newsreader italic with plum quote marks. Rotation is used **only** here.
- **Worm #4** peeks over the note's top edge.
- Below the note: "You were on p. 84. You're on p. 156 now.", then the gap line (then = white dot, now = lime dot, both ringed in plum), then "Still feel that way?".
- Paths: **Respond** (primary), **Write something new instead** and **Not now** (quiet). On pink, quiet text uses **ink**, not ink-muted, which fails AA on pink.
- **Response:** the note stays pinned at the top, smaller. The new writing sits below on the pink with a lime "p. 156 · now" marker.
- **Motion (for build):** the note slides up and settles with a small overshoot; the worm appears after. Respect reduced motion.
- Chains on the book page and in Your journey stay threaded in pink on paper, as in §11.

### 9.10 Progress
- A 4px line: `rule` track, `plum` fill, and a lime "you are here" dot with a plum ring.
- The number leads ("p. 84", large), with "of 320" in muted ink.
- Small **pink margin marks** (3×10px) show where Thoughts were left.
- No rings, charts, streaks, or percentage-first displays.

### 9.11 Shared conversation (marginalia)
- **A page spine** on the left: the page number ("p. 58", plum) sits in a 40px gutter, with a dot on a 2px rule line. Each shared Thought hangs off its page mark, and Thoughts at the same page share one mark. Page order runs oldest first.
- **The Thought comes first** (Newsreader). The **author is a signature** underneath, in `UI/Label` ink-muted: "— [16px avatar] Priya S.". Reader identity always stays secondary to page and text.
- The actions line: heart + count · replies · Reply · … (Report, or Edit/Make private/Delete on your own). There are no separators or cards; space separates the notes.
- **Your own shared Thought** carries the pink margin rule and is signed "— you".
- **Spoiler boundary = bookmark:** a lime ribbon on the spine at your page, then "**You're here**" (plum). Below it the spine turns dashed and faint, with "14 more Thoughts ahead. Keep reading." Future Thoughts are never marked on the spine (no content, no positions).
- **Replies** are sans, indented under a **pink** hairline ("notes on the note"). The composer says "Replies stay at p. 97. No spoilers past this point."

### 9.12 Spacing, borders, radius
- A 4px base unit on an 8-point scale, with generous whitespace. Space separates more than lines do.
- 1px warm hairlines, used sparingly.
- **Radius** (round UI, square books):

  | Element | Radius |
  |---|---|
  | Buttons and toggles | Pill |
  | Sheet top corners | 24px |
  | Reflection block, dialogs, text inputs | 16px |
  | Book covers | 3–4px |

### 9.13 Mobile
- Tab bar: Today · Books · You in text; the active tab is plum with a **short plum underline** (20×2), the same language as the desktop masthead.
- One column, 20px gutters, primary action in thumb reach.
- A paper tab bar with a hairline on top and a plum active tab. It hides while writing.
- Sheets go full height when writing; the keyboard never hides Save.
- Minimal motion: the sheet slides, the progress fill eases, the reflection fades in, a single lime flash confirms. All of it respects reduced-motion.

### 9.14 Desktop
- **Editorial masthead** (72px, paper, one hairline): the logo at left, **Today · Books · You set right after it**, the active tab marked by a 2px plum underline, and the account avatar at right.
- A slim top bar and a ~640px centred column; the surrounding paper is deliberate.
- Type is about 10% larger.
- **Book page:** book info in a pinned left column, margin and readers on the right, threads in a right side panel.
- Dialogs are ~560px wide.
- Hover states are quiet (a slight darkening), with no movement.

### 9.15 Accessibility
- WCAG AA minimum for all text.
- Lime and pink are never text on light surfaces and never the only signal.
- Privacy, spoiler state, and progress always combine a label or icon with color.
- Tap targets ≥44px, inputs ≥16px, visible focus.
- Layouts survive 200% zoom and large system text.
- Progress is announced to screen readers; covers have alt text.
- Reduced-motion is respected.

### 9.15a Figma foundations
- File: [Reezy V1 — Product Design](https://www.figma.com/design/Cer104KacTvspgUoXEEBQS), page **01 — Foundations** (built 2026-09-29).
- Variables: `Reezy / Color` (8 colors) and `Reezy / Tokens` (spacing, radius, hairline). Nine text styles: `Brand/*`, `UI/*`, `Reader/*`.
- The `Brand/*` text styles use **Rammetto One** (D52).
- `Worm / PLACEHOLDER — peek` component and the "Cover art library" section live on Foundations.
- The worm/logo is a labelled dashed placeholder component (`Logo / PLACEHOLDER …`).
- The Just Me / Shared control is drawn as a switch with a text label. Inside the writing toolbar it uses a compact version (40×24 switch plus a label); the tap area must still be ≥44px when built.
- **Added in the V1 design sprint:** the text style `UI/Heading` (Instrument Sans SemiBold 28/34) for screen and book titles; the color `status/danger` `#A8201A` for destructive actions only (7.2:1 on surface); components `Nav / Tab bar · Today|Books|You` (mobile, on page 03) and `Nav / Top bar (desktop) · Today|Books` (page 04).
- **Translucency:** Figma ignores opacity on paints bound to variables, so scrims use the ink fill with **layer opacity 38%**. Cover hairlines (ink 10%) and the reflection gap line (plum 35%) use unbound translucent colors. Mirror this in code with rgba tokens.

### 9.16 Not carried forward from the old direction

| | Items |
|---|---|
| **Keep** | The R mark. Rammetto One (now the brand/display font, D52). Confident typographic layouts with little clutter. The outline-R pattern (Welcome only). The "not corporate, not Canva" instinct. |
| **Maybe** | Off-white `#F5F0E8` as a tuning reference for `paper`. One chunky display moment per flow (e.g. finish). Inter as a system fallback only. |
| **Drop** | Dark-first UI, olive cards, near-black backgrounds, `#D4F060` and `#DBE4AA` limes, Bricolage Grotesque, Bagel Fat One (former placeholder), streak and fire visuals, Lottie celebrations, streak-pressure tone. |

### 9.17 Borrowed-element log
_Record each element adopted from the old Figma or old brand material here, with its source._

| Element | Source | Where used |
|---|---|---|
| R mark | Old app logo / social slides | App icon, favicon, wordmark companion |
| Outline-R pattern | `reezy_post2` social slides | Welcome background (faint) |

## 11. V1 designs in Figma

File: [Reezy V1 — Product Design](https://www.figma.com/design/Cer104KacTvspgUoXEEBQS). Content: one reader (Maya), *Piranesi* (272 pp), from 11 Sep to 12 Oct.

| Page | What's there |
|---|---|
| 01 — Foundations | Tokens, type, components, brand (§9) |
| 02 — Core Reading Loop | The signature loop with notes: log progress → Thought → Thought written → (two weeks later) reflection due → reflection response / chain |
| 03 — V1 Mobile | Flows as sections: A Entry & onboarding · B Today · C Find & add · D My Books · L Check-in loop (copy of 02, for the prototype) · E Book & journey · G Shared conversation · H Finish · I You. **Prototype** starts at A1 ("Reezy V1 · primary journey"). |
| 04 — V1 Desktop | Today, Book · your margin, Readers + thread panel, check-in dialog with reflection |

### Design decisions made while designing (see D53–D57)
- **Book page:** hero (cover, title, author) → progress → Log progress → collapsed description → segmented **Your margin · Readers**. Your margin lists Thoughts in page order, except that a **reflection chain is grouped under its original Thought** and threaded in pink ("· reflecting on p. 84").
- **Your journey** (finished book): the same margin as a vertical rail from start to finish. The final reflection sits at p. 272 in a quiet box under the final question, with the lime dot as the end.
- **Readers:** shared marginalia on a page spine, with a lime bookmark at your page (§9.11).
- **Today:** a small masthead (wordmark + date), a straight cover, the title (▾ switcher when reading more than one book), an italic Newsreader byline ("by Susanna Clarke"), the page number in Rammetto One (plum) + progress line with pink margin marks, **Log progress**, quiet **Leave a Thought**, one reply line. A waiting reflection is a compact pink card with **Respond** and **Skip**. No other content was added.
- **Adding a book:** the book page offers **Start reading** / **Want to read** and a conversation count. **Start reading** opens the "Where are you?" sheet with an **"I'm just starting"** shortcut. The copy page-count question appears inline as a small card, only when needed.
- **Finish:** a plum Rammetto moment (*"You finished Piranesi."*) → **Look back** → the final question (with the reader's first Thought as a callback) → Save or Skip → Your journey.
- **Navigation:** text-only tabs (Today · Books · You) with a short plum underline; hidden during onboarding and writing. On desktop, an editorial masthead (§9.14) and 640px reading columns: Book uses 300 + 640, Readers uses 220 + 560 + a 440 thread panel, and check-in is a 560 dialog.
- **Rammetto One** is used only on Welcome, the empty Today, and the finish moment.

### Brand integration pass (D58)
- Real Open Library covers everywhere (internal design use only), plus one typographic fallback.
- Six worm appearances placed as labelled placeholders (§8), and logo placeholders kept, until the designer's final files arrive.
- Reflection made the most distinctive moment (§9.9); Readers turned into marginalia (§9.11); Today given a masthead, byline and Rammetto page number; navigation uses the underline language on both mobile and desktop.

### Known gaps (small, not yet drawn)
- Today when the reader has only Want to Read books (show one with **Start reading**).
- The book page in the Want to Read and Finished states (the actions follow §2; only Not-in-library and Reading are drawn).
- The progress entry in % mode.

## 10. Old Figma and old brand material

- **The old Reezy Figma is not used at all** (founder decision, 2026-09-29). V1 visual design starts fresh from PRODUCT.md, this document, the logo, the palette, and the approved typography.
- `Reezy_Brief.pdf` (old creative brief) is **superseded** for product, UX, and visual decisions (D49). It may be used only as loose cultural reference where it doesn't conflict with PRODUCT.md or this document.
