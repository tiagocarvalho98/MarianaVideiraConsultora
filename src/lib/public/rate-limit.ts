import { randomUUID } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
export { hashPublicIntakeKey } from "./rate-limit-key";
export type { PublicIntakeFormType } from "./rate-limit-key";

const publicIntakeLimit = 3;
const publicIntakeWindowSeconds = 10 * 60;

export function createCorrelationId() {
  return randomUUID();
}

export async function checkPublicIntakeRateLimit(keyHash: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("check_public_intake_rate_limit", {
    p_key_hash: keyHash,
    p_limit: publicIntakeLimit,
    p_window_seconds: publicIntakeWindowSeconds,
  });

  if (error) {
    throw error;
  }

  return data === true;
}
