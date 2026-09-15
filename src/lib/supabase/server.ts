import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseBrowserEnv, getSupabaseServiceEnv } from "./env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseBrowserEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware refreshes sessions.
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  return createServerClient<Database>(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        return;
      },
    },
  });
}
