# Reezy V1

> Source of truth for the Reezy V1 product. Changes to this document must be flagged and agreed first, then logged in `DECISIONS.md`.
>
> Last updated: 2026-09-29

## What Reezy Is

**Reezy is a reading companion that goes beyond tracking what you read by helping you capture and revisit what you think while you're reading.**

Reezy is a social reading app that helps people read more intentionally by capturing what they think while they read.

Instead of only tracking books and leaving a review when finished, Reezy lets readers track their progress, record thoughts in real time, revisit those thoughts as they continue reading, and optionally discuss them with other readers.

The core loop is:

Read → Check in → Capture a thought → Reflect later → Discuss → Finish


## 1. Onboarding

Keep onboarding minimal.

- Create an account: **Continue with Google** or **email one-time code**. No passwords, no password reset.
- Search for the book you're currently reading
- Mark it as Reading
- Enter current page or percentage
- If not currently reading anything, search for a book and save it as Want to Read

No profile setup during onboarding. A display name is only requested when the reader first shares a Thought, unless Google already supplied one.


## 2. Today

The main home screen centers on the user's current book.

Users see:

- Current book
- Current page/percentage
- Log Progress
- Leave a Thought
- A previous Thought to reflect on, **only** if a reflection was offered during a check-in and the reader left before answering or skipping it (see §5)
- Recent replies to shared Thoughts (see §9)

### Multiple current books

A user may have more than one book with Reading status.

- Today defaults to the **most recently updated** Reading book.
- Provide a lightweight way to switch to the user's other currently-reading books.
- There is **no "primary book" setting**.

### Check-in Flow

User taps Log Progress.

1. Enter new page or percentage (or tap **"I finished it"**).
2. Reezy updates progress.
3. Reezy shows one prompt:
   - **If a reflection is due:** the resurfaced Thought is the primary prompt (see §5). The reader can respond, choose **"Write something new instead"**, or skip. Responding is never required.
   - **Otherwise:** **"What's on your mind?"** with supporting copy "Capture something you want to remember from this point in the book."
4. User can write a Thought or skip.
5. Thoughts default to **Just Me**. Sharing with readers is a deliberate choice.

"Leave a Thought" on Today opens the Thought prompt directly at the reader's current position.


## 3. Progress

Users may enter progress as either a **page number** or a **percentage**.

- Internally, reading position is always stored as a **normalized percentage** so progress can be compared across readers and editions.
- When the total page count is known, a page entry is converted to a normalized percentage.
- The UI can continue to display the format the reader used where appropriate (e.g. "Page 84").
- Users may move their progress **backward** (e.g. to correct a mistaken entry).
- When progress reaches 100%, the book is finished (see §8). The check-in offers an **"I finished it"** shortcut so the reader doesn't have to type the last page.
- If a Finished book's progress is changed to below 100%, it automatically moves back to **Reading**.

### Page normalization

- Page progress is normalized against the **reader's own copy/edition page count**, not a universal work page count.
- If the reader chooses page-based progress and the book API does not provide a reliable total page count, ask: **"How many pages is your copy?"** The reader can switch to percentage instead.
- The reader's copy page count is stored per book so they don't have to re-enter it at every check-in.
- The resulting normalized percentage is what all cross-edition spoiler and reflection logic uses.

All progress-aware rules in this document (spoilers, replies, reflection eligibility) use the normalized percentage.


## 4. Thoughts

A Thought is a short note captured while reading.

Every Thought stores:

- Book
- Reading progress (normalized percentage, plus the page/percentage format the reader entered)
- Thought
- Date
- Privacy setting: **Just Me** (default) or **Shared**
- Link to an earlier Thought, if it is a reflection response (see §5)

Example:

Page 84
"I'm starting to think she's the only person who understands what's happening."

Users can view their previous Thoughts throughout the book.

### Managing Thoughts

Users can:

- Edit their Thought's **text**
- Change a Thought between Just Me and Shared
- Delete their Thought

A Thought's **reading position cannot be edited**. If it's wrong, the user deletes the Thought and writes a new one.

If a Shared Thought is made Just Me or deleted:

- Its replies and likes stop being publicly displayed.
- The associated records (including other users' replies) are preserved in the database, not destroyed.


## 5. Reflection

Reezy periodically resurfaces something the reader previously wrote.

Example:

Earlier at page 84 you wrote:
"I don't trust this character."

You're now on page 156. Still feel that way?

The reader can respond or continue reading.

### When reflection happens

Reflection happens **primarily inside the check-in flow**, right after progress is updated, because eligibility depends on progress. When a reflection is due it is the primary prompt, but the reader can always choose **"Write something new instead"** or skip. The reader is never forced to respond.

If the reader leaves mid-check-in without answering or skipping, the reflection waits on Today.

V1 uses simple logic and prewritten reflection prompts. **No AI is used for reflection content or reflection logic.**

### Reflection responses

When the reader responds to a resurfaced Thought, the response is saved as a **new Thought linked to the original**. The new Thought has its own:

- progress position
- timestamp
- privacy setting (Just Me or Shared)

This creates a reflection chain over the course of a book:

Original Thought → Later Reflection → Later Reflection → Final Reflection

### Eligibility

Keep V1 logic simple:

- A previous Thought becomes eligible to resurface once the reader has made meaningful progress since writing it.
- Initial threshold: approximately **10 percentage points** of additional normalized progress.
- Avoid repeatedly resurfacing the exact same Thought, unless there is a meaningful linked reflection chain.

### Chains

Once the reader responds to a resurfaced Thought, future reflection continues from the **newest Thought in that chain**, not the original.

### Skipping

If the reader skips a resurfaced Thought, it may be shown **at most one more time**, after another threshold of progress. After that, it stops resurfacing.

### Privacy in chains

Private content must never be exposed through a shared reflection. If a Shared reflection is linked to a Just Me Thought, the private parent is never displayed or quoted to other readers; they see only the shared reflection.


## 6. Shared Conversation

If a Thought is set to Shared ("Share with Readers"), other people reading the same book can see it.

Readers can:

- Like
- Reply

The first time a reader shares, Reezy explains who can see it (readers who have reached that point) and asks for a display name if none exists.

Each book has **one canonical shared conversation** rather than users creating separate communities. All editions of the same work share that conversation (see §7).

### Spoiler visibility

Visibility of shared Thoughts depends on the viewer's status for that book:

| Viewer's status | What they see |
|---|---|
| Want to Read | No reading Thoughts. May see a conversation count only (e.g. "23 readers are talking about this"). |
| Reading | Shared Thoughts only at or behind their normalized progress, plus a count of Thoughts further ahead (no content) |
| Finished | All shared Thoughts |

### Replies

Keep V1 simple:

- Replies **inherit the spoiler position of the parent Thought**, not the replier's current position. Anyone who can see the Thought can see its replies.
- The reply UI makes clear that replies should only discuss the book **up to that point**.
- No AI spoiler detection or reply classification in V1.

### Moderation

Keep moderation minimal for V1.

- Shared Thoughts and replies have a basic **Report** action.
- Reports are stored in the database for manual founder/admin review.
- Reported content is **not** automatically hidden.
- No moderation/admin system in V1.
- Users can delete their own Thoughts and replies.


## 7. Books

Users can search for books using an external book database.

Every book can be:

- Want to Read
- Reading
- Finished

The book page contains:

- Cover
- Title
- Author
- Description
- Page count
- User's progress
- Shared reader Thoughts (subject to spoiler visibility)

### Editions

- Different editions of the same work share the **same canonical Reezy book conversation**.
- Preserve edition/ISBN metadata when available.
- Shared Thoughts and conversation are associated with the **parent work**, not split by paperback, hardcover, etc.


## 8. Finishing a Book

When progress reaches 100%, Reezy marks the book as finished.

The reader sees their reading journey, including Thoughts they left at different points in the book.

Reezy asks one final question:

"Looking back, what changed most about how you saw this book?"

The answer is stored as a **Thought at 100%**. It is normally standalone (not linked to an earlier Thought), and the reader chooses Just Me or Shared.

The book moves to Finished.


## 9. Replies to Your Thoughts (In-app only)

V1 only needs lightweight **in-app** visibility of replies to a user's shared Thoughts: a quiet line on Today and on the Thought itself. No notifications inbox.

Not in V1:

- Email notifications
- Push notifications
- A notification service


## 10. My Books

Simple personal library:

Reading
- Books currently being read with progress

Want to Read
- Saved books

Finished
- Completed books and previous Thoughts


## 11. Profile (You)

V1 profile is minimal:

- Display name
- Optional avatar
- Thought history (across all books)
- Account settings, as an inline section (no separate settings page)

Reading history is **not** part of You; Finished books live under Books.


## V1 Navigation

See `DESIGN.md` for screens, flows, and mobile/desktop navigation.

Today
- Current reading experience and check-in
- Switch between currently-reading books

Books
- Search
- Reading
- Want to Read
- Finished

You
- Thought history
- Basic account settings (display name, optional avatar)


## Explicitly Not in V1

- Book clubs or user-created communities
- AI-generated reflections, or AI in any core functionality
- Email or push notifications
- Followers, follower counts
- Bios
- DNF (did not finish) status
- Rereading functionality
- A "primary book" setting
- Passwords and password reset (sign-in is Google or email one-time code)
- Reading history in You (Finished books live under Books)
- A separate Thought page, notifications inbox, or settings page


## V1 Core Product

The most important experience to get right is:

Open Reezy → see current book → read → update progress → capture what you're thinking → return later → Reezy reminds you what you previously thought → reflect on whether your perspective changed.

Everything else in V1 supports that loop.


---

# Brand Direction

The current logo is a temporary concept from our designer and may change later. It introduces a playful Reezy/bookworm character.

Current working colors:

| Name | Hex |
|---|---|
| Deep plum | `#660045` |
| Pink | `#FCB5ED` |
| Acid/lime | `#F4FD1D` |

The product should feel:

- culturally relevant
- playful
- editorial
- contemporary
- warm
- intelligent without feeling academic
- community-oriented
- distinctive rather than SaaS-like

Do not overuse the bright palette. Reading and writing Thoughts should remain comfortable and accessible.

## Older designs

Older Figma designs represent a previous version of Reezy and may be provided later. When they are:

- Do NOT treat them as the required product flow.
- Do NOT automatically reproduce them.
- Use them only to understand useful visual patterns, typography, spacing, components, and previous design thinking.
- This V1 specification overrides the old Figma whenever they conflict.


---

# Open Questions

None currently. All earlier open questions were resolved on 2026-09-29 (see DECISIONS.md D24–D33).
