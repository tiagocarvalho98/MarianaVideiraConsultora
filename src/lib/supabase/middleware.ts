import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (request.nextUrl.pathname.startsWith("/crm")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasActiveProfile = false;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    hasActiveProfile = Boolean(data);
  }

  if (request.nextUrl.pathname.startsWith("/crm") && (!user || !hasActiveProfile)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/login" && user && hasActiveProfile) {
    const crmUrl = request.nextUrl.clone();
    crmUrl.pathname = "/crm/hoje";
    crmUrl.search = "";
    return NextResponse.redirect(crmUrl);
  }

  return response;
}
