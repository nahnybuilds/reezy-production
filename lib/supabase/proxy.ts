import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/** Paths a signed-out visitor may open. Everything else requires a session. */
const PUBLIC_PREFIXES = ["/welcome", "/auth", "/terms", "/privacy", "/dev"];

export function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase session on every request (pattern from Supabase's Next.js SSR guide) and
 * routes visitors: signed-out → /welcome (or 401 for the API); signed-in → away from /welcome.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims() (Supabase guidance).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!signedIn && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (signedIn && (pathname === "/welcome" || pathname.startsWith("/welcome/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
