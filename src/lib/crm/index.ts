import { createSupabaseRepository } from "./supabase-repository";
import type { CrmRepository } from "./repository";

export function getCrmRepository(): CrmRepository {
  return createSupabaseRepository();
}
