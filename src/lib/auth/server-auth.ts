import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/crm";

function toProfile(row: {
  id: string;
  full_name: string;
  role: "admin" | "consultor";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSupabaseSessionProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  return data ? toProfile(data) : null;
}

export async function signOutSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
