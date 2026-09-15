"use server";

import { redirect } from "next/navigation";
import { getSupabaseSessionProfile, signOutSupabaseUser } from "@/lib/auth/server-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/crm/hoje");

  if (!email || !password) {
    return { error: "Preencha o email e a palavra-passe." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciais invalidas ou conta sem acesso." };
  }

  const profile = await getSupabaseSessionProfile();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Conta sem perfil ativo autorizado." };
  }

  redirect(next.startsWith("/crm") ? next : "/crm/hoje");
}

export async function logoutAction() {
  await signOutSupabaseUser();
  redirect("/login");
}
