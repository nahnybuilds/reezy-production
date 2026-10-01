import { DraftLegalPage } from "@/components/legal/DraftLegalPage";

export const metadata = { title: "Terms (draft) · Reezy", robots: { index: false } };

// DRAFT placeholder (D61). Needs review before public launch.
export default function Terms() {
  return (
    <DraftLegalPage title="Terms">
      <p>Reezy helps you keep your place in the books you read and capture what you think along the way.</p>
      <h2>Your account</h2>
      <p>You sign in with Google or a one-time code sent to your email. Keep access to that email or Google account secure.</p>
      <h2>What you write</h2>
      <p>Your Thoughts are yours. Thoughts set to Just Me are private. Thoughts you share are visible to other readers of the same book who have reached that point in it. Don&rsquo;t share anything unlawful, abusive or that isn&rsquo;t yours to share.</p>
      <h2>Reports and removal</h2>
      <p>Readers can report shared Thoughts and replies. We may remove content or accounts that break these terms.</p>
      <h2>The service</h2>
      <p>Reezy is provided as-is while it&rsquo;s being built. Book details and covers come from Open Library.</p>
      <h2>Leaving</h2>
      <p>You can delete your account at any time, which deletes your books and Thoughts.</p>
    </DraftLegalPage>
  );
}
