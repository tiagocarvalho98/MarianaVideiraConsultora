import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function readEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1)];
      }),
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectDeniedOrEmpty(result, label) {
  if (result.error) return;
  assert(Array.isArray(result.data) && result.data.length === 0, `${label} was not denied or empty`);
}

function makeClient(url, key) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function sellerPayload(runId, suffix, overrides = {}) {
  const localPhone = `91${suffix.padStart(7, "0").slice(-7)}`;
  const phone = overrides.phone ?? localPhone;
  const email = overrides.email ?? `seller-${runId}-${suffix}@example.test`;

  return {
    contact: {
      firstName: overrides.firstName ?? "Smoke",
      lastName: overrides.lastName ?? `Seller ${suffix}`,
      phone,
      email,
    },
    opportunity: {
      location: "Montijo",
      budgetMin: null,
      budgetMax: null,
      propertyType: "Apartamento",
      timeframe: "1 a 3 meses",
      financingStatus: null,
      currentPropertyToSell: null,
      propertyAlreadyListed: false,
    },
    formSubmission: {
      formType: "seller",
      utmSource: "qa",
      utmMedium: "script",
      utmCampaign: `public-intake-${runId}`,
      utmContent: "seller-smoke",
      utmTerm: null,
      gclid: `gclid-${runId}`,
      fbclid: `fbclid-${runId}`,
      referrer: "http://localhost/referrer",
      landingPage: "/vender",
      userAgent: "Public intake smoke test",
      privacyConsent: true,
      marketingConsent: false,
      rawPayload: {
        runId,
        formType: "seller",
        message: overrides.message ?? "Mensagem seller smoke",
      },
    },
    message: overrides.message ?? "Mensagem seller smoke",
  };
}

function buyerPayload(runId, suffix, overrides = {}) {
  const localPhone = `93${suffix.padStart(7, "0").slice(-7)}`;
  const phone = overrides.phone ?? localPhone;
  const email = overrides.email ?? `buyer-${runId}-${suffix}@example.test`;

  return {
    contact: {
      firstName: overrides.firstName ?? "Smoke",
      lastName: overrides.lastName ?? `Buyer ${suffix}`,
      phone,
      email,
    },
    opportunity: {
      location: "Alcochete / Montijo",
      budgetMin: 300000,
      budgetMax: 350000,
      propertyType: "T3",
      timeframe: "3 a 6 meses",
      financingStatus: "Pre-aprovado",
      currentPropertyToSell: true,
      propertyAlreadyListed: null,
    },
    formSubmission: {
      formType: "buyer",
      utmSource: "qa",
      utmMedium: "script",
      utmCampaign: `public-intake-${runId}`,
      utmContent: "buyer-smoke",
      utmTerm: "comprar montijo",
      gclid: null,
      fbclid: null,
      referrer: "http://localhost/referrer",
      landingPage: "/comprar",
      userAgent: "Public intake smoke test",
      privacyConsent: true,
      marketingConsent: false,
      rawPayload: {
        runId,
        formType: "buyer",
        message: overrides.message ?? "Mensagem buyer smoke",
      },
    },
    message: overrides.message ?? "Mensagem buyer smoke",
  };
}

async function submitIntake(client, payload) {
  const { data, error } = await client.rpc("submit_public_lead_intake", { _payload: payload });
  if (error) throw error;

  assert(typeof data?.contactId === "string", "RPC did not return contactId");
  assert(typeof data?.opportunityId === "string", "RPC did not return opportunityId");
  assert(typeof data?.formSubmissionId === "string", "RPC did not return formSubmissionId");

  return data;
}

async function rowById(client, table, id) {
  const { data, error } = await client.from(table).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function countByRunId(client, runId) {
  const { count, error } = await client
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .eq("raw_payload->>runId", runId);

  if (error) throw error;
  return count ?? 0;
}

async function cleanup(client, contactIds) {
  if (contactIds.size > 0) {
    await client.from("contacts").delete().in("id", [...contactIds]);
  }
}

async function main() {
  const env = readEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  assert(url, "Missing NEXT_PUBLIC_SUPABASE_URL");
  assert(publishableKey, "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  assert(serviceRoleKey, "Missing SUPABASE_SERVICE_ROLE_KEY");

  const service = makeClient(url, serviceRoleKey);
  const anon = makeClient(url, publishableKey);
  const runId = randomUUID().slice(0, 8);
  const contactIds = new Set();

  try {
    expectDeniedOrEmpty(await anon.from("contacts").select("id"), "anon contacts select");
    expectDeniedOrEmpty(await anon.from("opportunities").select("id"), "anon opportunities select");
    expectDeniedOrEmpty(await anon.from("activities").select("id"), "anon activities select");
    expectDeniedOrEmpty(await anon.from("form_submissions").select("id"), "anon form submissions select");

    const anonRpc = await anon.rpc("submit_public_lead_intake", {
      _payload: sellerPayload(runId, "000001"),
    });
    assert(anonRpc.error, "anon unexpectedly executed public intake RPC");
    const anonRateLimitRpc = await anon.rpc("check_public_intake_rate_limit", {
      p_key_hash: "f".repeat(64),
      p_limit: 3,
      p_window_seconds: 600,
    });
    assert(anonRateLimitRpc.error, "anon unexpectedly executed rate limit RPC");

    const serviceRateLimitRpc = await service.rpc("check_public_intake_rate_limit", {
      p_key_hash: `${runId}${"0".repeat(64)}`.slice(0, 64),
      p_limit: 3,
      p_window_seconds: 600,
    });
    if (serviceRateLimitRpc.error) throw serviceRateLimitRpc.error;
    assert(serviceRateLimitRpc.data === true, "service role could not execute rate limit RPC");

    const seller = await submitIntake(service, sellerPayload(runId, "100001"));
    contactIds.add(seller.contactId);

    const sellerContact = await rowById(service, "contacts", seller.contactId);
    const sellerOpportunity = await rowById(service, "opportunities", seller.opportunityId);
    const sellerSubmission = await rowById(service, "form_submissions", seller.formSubmissionId);
    const sellerActivities = await service
      .from("activities")
      .select("*")
      .eq("opportunity_id", seller.opportunityId)
      .order("created_at", { ascending: true });

    if (sellerActivities.error) throw sellerActivities.error;

    assert(sellerContact.phone_normalized === "+351910100001", "seller phone was not normalized");
    assert(sellerOpportunity.type === "seller", "seller opportunity type mismatch");
    assert(sellerOpportunity.status === "new", "seller status mismatch");
    assert(sellerOpportunity.stage === "nova_lead", "seller stage mismatch");
    assert(sellerOpportunity.temperature === "morna", "seller temperature mismatch");
    assert(sellerOpportunity.created_by === null, "seller created_by should be null");
    assert(sellerOpportunity.assigned_to === null, "seller assigned_to should be null");
    assert(sellerSubmission.utm_source === "qa", "seller attribution not persisted");
    assert(sellerSubmission.gclid === `gclid-${runId}`, "seller gclid not persisted");
    assert(sellerSubmission.fbclid === `fbclid-${runId}`, "seller fbclid not persisted");
    assert(sellerSubmission.privacy_consent === true, "seller privacy consent mismatch");
    assert(sellerSubmission.marketing_consent === false, "seller marketing consent mismatch");
    assert(sellerSubmission.raw_payload.runId === runId, "seller raw_payload not preserved");
    assert(
      sellerActivities.data.some((activity) => activity.type === "form_submission"),
      "seller form_submission activity missing",
    );
    assert(
      sellerActivities.data.some((activity) => activity.type === "note"),
      "seller note activity missing",
    );

    const buyer = await submitIntake(service, buyerPayload(runId, "100002"));
    contactIds.add(buyer.contactId);
    const buyerOpportunity = await rowById(service, "opportunities", buyer.opportunityId);
    const buyerSubmission = await rowById(service, "form_submissions", buyer.formSubmissionId);

    assert(buyerOpportunity.type === "buyer", "buyer opportunity type mismatch");
    assert(buyerOpportunity.budget_min === 300000, "buyer budget_min mismatch");
    assert(buyerOpportunity.budget_max === 350000, "buyer budget_max mismatch");
    assert(buyerOpportunity.financing_status === "Pre-aprovado", "buyer financing status mismatch");
    assert(buyerOpportunity.current_property_to_sell === true, "buyer current property flag mismatch");
    assert(buyerSubmission.utm_term === "comprar montijo", "buyer utm_term not persisted");
    assert(buyerSubmission.raw_payload.runId === runId, "buyer raw_payload not preserved");

    const phoneDedupeFirst = await submitIntake(service, sellerPayload(runId, "100003"));
    contactIds.add(phoneDedupeFirst.contactId);
    const phoneDedupeSecond = await submitIntake(
      service,
      buyerPayload(runId, "100004", {
        phone: "+351 910100003",
        email: `different-${runId}@example.test`,
        message: "",
      }),
    );
    assert(
      phoneDedupeSecond.contactId === phoneDedupeFirst.contactId,
      "phone dedupe did not reuse contact",
    );
    assert(
      phoneDedupeSecond.opportunityId !== phoneDedupeFirst.opportunityId,
      "phone dedupe should still create a new opportunity",
    );

    const emailDedupeFirst = await submitIntake(service, sellerPayload(runId, "100005"));
    contactIds.add(emailDedupeFirst.contactId);
    const emailDedupeSecond = await submitIntake(
      service,
      buyerPayload(runId, "100006", {
        email: `seller-${runId}-100005@example.test`,
      }),
    );
    assert(
      emailDedupeSecond.contactId === emailDedupeFirst.contactId,
      "email fallback dedupe did not reuse contact",
    );

    const sameNameFirst = await submitIntake(
      service,
      sellerPayload(runId, "100007", {
        firstName: "Mesmo",
        lastName: "Nome",
        email: "",
      }),
    );
    contactIds.add(sameNameFirst.contactId);
    const sameNameSecond = await submitIntake(
      service,
      sellerPayload(runId, "100008", {
        firstName: "Mesmo",
        lastName: "Nome",
        email: "",
      }),
    );
    contactIds.add(sameNameSecond.contactId);
    assert(sameNameSecond.contactId !== sameNameFirst.contactId, "name-only dedupe happened unexpectedly");

    const beforeInvalid = await countByRunId(service, runId);
    const invalid = await service.rpc("submit_public_lead_intake", {
      _payload: {
        ...sellerPayload(runId, "100009"),
        contact: { firstName: "Invalid", phone: "" },
      },
    });
    assert(invalid.error, "invalid payload unexpectedly succeeded");
    const afterInvalid = await countByRunId(service, runId);
    assert(afterInvalid === beforeInvalid, "invalid payload was not rolled back atomically");

    const todayQueueLead = await rowById(service, "opportunities", seller.opportunityId);
    assert(todayQueueLead.status === "new" && todayQueueLead.stage === "nova_lead", "new lead is not eligible for Today Queue");

    console.table([
      { check: "anon CRM table reads blocked", result: "pass" },
      { check: "anon public intake RPC blocked", result: "pass" },
      { check: "rate limit RPC permissions", result: "pass" },
      { check: "seller public intake", result: "pass" },
      { check: "buyer public intake", result: "pass" },
      { check: "message creates note activity", result: "pass" },
      { check: "tracking and raw_payload persisted", result: "pass" },
      { check: "initial lead invariants", result: "pass" },
      { check: "phone dedupe contact only", result: "pass" },
      { check: "email fallback dedupe", result: "pass" },
      { check: "no name-only dedupe", result: "pass" },
      { check: "invalid payload rollback", result: "pass" },
      { check: "new lead eligible for Today Queue", result: "pass" },
    ]);
  } finally {
    await cleanup(service, contactIds);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
