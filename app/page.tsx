import { redirect } from "next/navigation";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { TodayView } from "@/components/today/TodayView";
import { WantToReadToday } from "@/components/today/WantToReadToday";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Today (DESIGN §1: `/`). Shows, in order:
 * 1. the most recently updated Reading book (D13),
 * 2. otherwise the latest Want to Read book with Start reading,
 * 3. otherwise first-run onboarding ("What are you reading right now?").
 */
export default async function Today() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data: books } = await supabase
    .from("user_books")
    .select("id, status, position_pct, position_page, position_unit, copy_page_count, last_check_in_at, created_at, works(ol_work_key, title, authors, cover_id)")
    .eq("user_id", auth.user.id)
    .in("status", ["reading", "want_to_read"])
    .order("last_check_in_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const reading = books?.find((b) => b.status === "reading" && b.works);
  if (reading?.works) {
    const { count } = await supabase.from("check_ins").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id);
    return (
      <TodayView
        firstRun={(count ?? 0) <= 1}
        book={{
          title: reading.works.title,
          authors: reading.works.authors,
          coverId: reading.works.cover_id,
          unit: reading.position_unit,
          page: reading.position_page,
          pct: Number(reading.position_pct),
          copyPageCount: reading.copy_page_count,
        }}
      />
    );
  }

  const want = books?.find((b) => b.status === "want_to_read" && b.works);
  if (want?.works) {
    return (
      <WantToReadToday
        book={{
          olWorkKey: want.works.ol_work_key,
          title: want.works.title,
          authors: want.works.authors,
          coverId: want.works.cover_id,
          copyPageCount: want.copy_page_count,
        }}
      />
    );
  }

  return <Onboarding />;
}
