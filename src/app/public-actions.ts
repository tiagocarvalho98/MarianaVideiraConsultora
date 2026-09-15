"use server";

import { headers } from "next/headers";
import { getCrmRepository } from "@/lib/crm";
import { logEvent } from "@/lib/observability/logging";
import {
  buyerFormSchema,
  sellerFormSchema,
  type BuyerFormData,
  type SellerFormData,
} from "@/lib/public/form-validation";
import {
  checkPublicIntakeRateLimit,
  createCorrelationId,
  hashPublicIntakeKey,
  type PublicIntakeFormType,
} from "@/lib/public/rate-limit";

type PublicLeadActionResult = {
  ok: boolean;
  errors?: Record<string, string>;
};

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

async function clientIpAddress() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = headerStore.get("x-real-ip") ?? "";

  return forwardedFor || realIp || "unknown";
}

function safeIssueFields(issues: Array<{ path: Array<string | number> }>) {
  return [...new Set(issues.map((issue) => String(issue.path[0] ?? "form")))];
}

function isHoneypotFilled(formData: FormData) {
  const value = formData.get("companyWebsite");
  return typeof value === "string" && value.trim().length > 0;
}

async function assertAllowedByRateLimit(
  formType: PublicIntakeFormType,
  phone: string,
  correlationId: string,
) {
  const keyHash = hashPublicIntakeKey({
    formType,
    ipAddress: await clientIpAddress(),
    phone,
  });

  const allowed = await checkPublicIntakeRateLimit(keyHash);

  if (!allowed) {
    logEvent("warn", "public_intake_rate_limited", {
      correlationId,
      formType,
    });
  }

  return allowed;
}

export async function submitSellerLeadAction(
  formData: FormData,
): Promise<PublicLeadActionResult> {
  const correlationId = createCorrelationId();

  if (isHoneypotFilled(formData)) {
    logEvent("warn", "public_intake_honeypot", { correlationId, formType: "seller" });
    return { ok: true };
  }

  const result = sellerFormSchema.safeParse(collectData(formData, sellerKeys));

  if (!result.success) {
    logEvent("warn", "public_intake_validation_failed", {
      correlationId,
      formType: "seller",
      fields: safeIssueFields(result.error.issues),
    });

    return { ok: false, errors: fieldErrors(result.error.issues) };
  }

  try {
    if (!(await assertAllowedByRateLimit("seller", result.data.phone, correlationId))) {
      return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
    }
  } catch {
    logEvent("error", "public_intake_rate_limit_failure", {
      correlationId,
      formType: "seller",
    });

    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  try {
    await getCrmRepository().submitSellerLead({
      ...(result.data as SellerFormData),
      userAgent: await userAgent(),
    });
    logEvent("info", "public_intake_success", { correlationId, formType: "seller" });
  } catch {
    logEvent("error", "public_intake_server_failure", {
      correlationId,
      formType: "seller",
    });

    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  return { ok: true };
}

export async function submitBuyerLeadAction(
  formData: FormData,
): Promise<PublicLeadActionResult> {
  const correlationId = createCorrelationId();

  if (isHoneypotFilled(formData)) {
    logEvent("warn", "public_intake_honeypot", { correlationId, formType: "buyer" });
    return { ok: true };
  }

  const result = buyerFormSchema.safeParse(collectData(formData, buyerKeys));

  if (!result.success) {
    logEvent("warn", "public_intake_validation_failed", {
      correlationId,
      formType: "buyer",
      fields: safeIssueFields(result.error.issues),
    });

    return { ok: false, errors: fieldErrors(result.error.issues) };
  }

  try {
    if (!(await assertAllowedByRateLimit("buyer", result.data.phone, correlationId))) {
      return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
    }
  } catch {
    logEvent("error", "public_intake_rate_limit_failure", {
      correlationId,
      formType: "buyer",
    });

    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  try {
    await getCrmRepository().submitBuyerLead({
      ...(result.data as BuyerFormData),
      userAgent: await userAgent(),
    });
    logEvent("info", "public_intake_success", { correlationId, formType: "buyer" });
  } catch {
    logEvent("error", "public_intake_server_failure", {
      correlationId,
      formType: "buyer",
    });

    return { ok: false, errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." } };
  }

  return { ok: true };
}
