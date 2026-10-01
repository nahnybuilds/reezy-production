import { DraftLegalPage } from "@/components/legal/DraftLegalPage";

export const metadata = { title: "Privacy Policy (draft) · Reezy", robots: { index: false } };

// DRAFT placeholder (D61). Needs review before public launch and before Google OAuth verification.
export default function Privacy() {
  return (
    <DraftLegalPage title="Privacy Policy">
      <h2>What we store</h2>
      <p>Your email address and, if you sign in with Google, your name and profile picture. The books you add, your reading progress, and the Thoughts, replies and likes you write.</p>
      <h2>Who can see it</h2>
      <p>Your library and progress are private. Thoughts are private (Just Me) unless you choose to share them; shared Thoughts are only shown to readers who have reached the same point in the book.</p>
      <h2>Services we use</h2>
      <p>Supabase (database and sign-in), Vercel (hosting), Resend (sign-in emails) and Open Library (book details and covers). We don&rsquo;t sell your data and there&rsquo;s no advertising or analytics tracking.</p>
      <h2>Deleting your data</h2>
      <p>Deleting your account deletes your books, progress, Thoughts, replies and likes.</p>
      <h2>Contact</h2>
      <p>Contact details will be added before launch.</p>
    </DraftLegalPage>
  );
}
