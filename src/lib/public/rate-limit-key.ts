import { createHash } from "node:crypto";
import { normalizePhone } from "@/lib/crm/intake";

export type PublicIntakeFormType = "buyer" | "seller";

export function hashPublicIntakeKey(input: {
  formType: PublicIntakeFormType;
  ipAddress: string;
  phone: string;
}) {
  const normalizedPhone = normalizePhone(input.phone);
  const fingerprint = [
    input.formType,
    input.ipAddress || "unknown",
    normalizedPhone || "unknown",
  ].join(":");

  return createHash("sha256").update(fingerprint).digest("hex");
}
