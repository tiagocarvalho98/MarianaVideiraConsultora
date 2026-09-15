"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getCrmRepository } from "@/lib/crm";
import {
  buyerFormSchema,
  sellerFormSchema,
  type BuyerFormData,
  type SellerFormData,
} from "@/lib/public/form-validation";

type PublicLeadActionResult = {
  ok: boolean;
  errors?: Record<string, string>;
};

const minimumSubmitIntervalMs = 20_000;
const recentSubmissions = new Map<string, number>();

const sellerKeys = [
  "name",
  "phone",
  "email",
  "propertyLocation",
  "propertyType",
  "currentSituation",
  "sellingTimeframe",
  "alreadyListed",
  "message",
  "privacyConsent",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "landingPage",
  "referrer",
  "gclid",
  "fbclid",
] as const;

const buyerKeys = [
  "name",
  "phone",
  "email",
  "desiredZones",
  "typology",
  "budget",
  "financingStatus",
  "buyingTimeframe",
  "hasPropertyToSell",
  "message",
  "privacyConsent",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "landingPage",
  "referrer",
  "gclid",
  "fbclid",
] as const;

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === "on") return true;
  return typeof value === "string" ? value : "";
}

function collectData<const T extends readonly string[]>(formData: FormData, keys: T) {
  return Object.fromEntries(keys.map((key) => [key, fieldValue(formData, key)]));
}

function fieldErrors(issues: Array<{ path: Array<string | number>; message: string }>) {
  return Object.fromEntries(
    issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
  );
}

async function userAgent() {
  return (await headers()).get("user-agent")?.slice(0, 500) ?? undefined;
}

async function rateLimitKey(formType: "buyer" | "seller", phone: string) {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = headerStore.get("x-real-ip") ?? "";
  const fingerprint = `${formType}:${forwardedFor || realIp}:${phone}`;

  return createHash("sha256").update(fingerprint).digest("hex");
}

function isRateLimited(key: string) {
  const now = Date.now();
  const previous = recentSubmissions.get(key);

  for (const [storedKey, timestamp] of recentSubmissions) {
    if (now - timestamp > minimumSubmitIntervalMs) {
      recentSubmissions.delete(storedKey);
    }
  }

  if (previous && now - previous < minimumSubmitIntervalMs) {
    return true;
  }

  recentSubmissions.set(key, now);

  return false;
}

export async function submitSellerLeadAction(
  formData: FormData,
): Promise<PublicLeadActionResult> {
  const result = sellerFormSchema.safeParse(collectData(formData, sellerKeys));

  if (!result.success) {
    return { ok: false, errors: fieldErrors(result.error.issues) };
  }

  if (isRateLimited(await rateLimitKey("seller", result.data.phone))) {
    return { ok: false, errors: { form: "Pedido recebido ha poucos segundos. Tente novamente dentro de instantes." } };
  }

  try {
    await getCrmRepository().submitSellerLead({
      ...(result.data as SellerFormData),
      userAgent: await userAgent(),
    });
  } catch {
    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  return { ok: true };
}

export async function submitBuyerLeadAction(
  formData: FormData,
): Promise<PublicLeadActionResult> {
  const result = buyerFormSchema.safeParse(collectData(formData, buyerKeys));

  if (!result.success) {
    return { ok: false, errors: fieldErrors(result.error.issues) };
  }

  if (isRateLimited(await rateLimitKey("buyer", result.data.phone))) {
    return { ok: false, errors: { form: "Pedido recebido ha poucos segundos. Tente novamente dentro de instantes." } };
  }

  try {
    await getCrmRepository().submitBuyerLead({
      ...(result.data as BuyerFormData),
      userAgent: await userAgent(),
    });
  } catch {
    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  return { ok: true };
}
