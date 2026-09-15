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

function sameInstant(actual, expected) {
  return actual !== null && new Date(actual).getTime() === new Date(expected).getTime();
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

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Failed to create temporary auth user");

  return data.user;
}

async function signIn(url, publishableKey, email, password) {
  const client = makeClient(url, publishableKey);
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw error;

  return client;
}

async function getRow(client, table, id) {
  const { data, error } = await client.from(table).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function cleanup(admin, ids) {
  if (ids.contacts.length > 0) {
    await admin.from("contacts").delete().in("id", ids.contacts);
  }
  if (ids.profiles.length > 0) {
    await admin.from("profiles").delete().in("id", ids.profiles);
  }
  await Promise.allSettled(ids.users.map((id) => admin.auth.admin.deleteUser(id)));
}

async function main() {
  const env = readEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  assert(url, "Missing NEXT_PUBLIC_SUPABASE_URL");
  assert(publishableKey, "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  assert(serviceRoleKey, "Missing SUPABASE_SERVICE_ROLE_KEY");

  const admin = makeClient(url, serviceRoleKey);
  const anon = makeClient(url, publishableKey);
  const runId = randomUUID().slice(0, 8);
  const password = `Temp-${randomUUID()}-Aa1!`;
  const ids = { users: [], profiles: [], contacts: [] };

  try {
    const { data: realProfiles, error: realProfilesError } = await admin
      .from("profiles")
      .select("full_name, role, is_active")
      .in("full_name", ["Tiago Carvalho", "Mariana Videira"]);

    if (realProfilesError) throw realProfilesError;

    assert(
      realProfiles?.some(
        (profile) =>
          profile.full_name === "Tiago Carvalho" &&
          profile.role === "admin" &&
          profile.is_active === true,
      ),
      "Tiago Carvalho active admin profile not found",
    );
    assert(
      realProfiles?.some(
        (profile) =>
          profile.full_name === "Mariana Videira" &&
          profile.role === "consultor" &&
          profile.is_active === true,
      ),
      "Mariana Videira active consultant profile not found",
    );

    const tempAdmin = await createAuthUser(admin, `rls-admin-${runId}@example.test`, password);
    const tempConsultor = await createAuthUser(admin, `rls-consultor-${runId}@example.test`, password);
    const tempNoProfile = await createAuthUser(admin, `rls-noprofile-${runId}@example.test`, password);
    const tempInactive = await createAuthUser(admin, `rls-inactive-${runId}@example.test`, password);
    ids.users.push(tempAdmin.id, tempConsultor.id, tempNoProfile.id, tempInactive.id);

    const { error: profileInsertError } = await admin.from("profiles").insert([
      { id: tempAdmin.id, full_name: "RLS Temp Admin", role: "admin", is_active: true },
      { id: tempConsultor.id, full_name: "RLS Temp Consultor", role: "consultor", is_active: true },
      { id: tempInactive.id, full_name: "RLS Temp Inactive", role: "consultor", is_active: false },
    ]);

    if (profileInsertError) throw profileInsertError;
    ids.profiles.push(tempAdmin.id, tempConsultor.id, tempInactive.id);

    const adminClient = await signIn(url, publishableKey, `rls-admin-${runId}@example.test`, password);
    const consultorClient = await signIn(url, publishableKey, `rls-consultor-${runId}@example.test`, password);
    const noProfileClient = await signIn(url, publishableKey, `rls-noprofile-${runId}@example.test`, password);
    const inactiveClient = await signIn(url, publishableKey, `rls-inactive-${runId}@example.test`, password);

    expectDeniedOrEmpty(await anon.from("contacts").select("id"), "anon contacts select");
    expectDeniedOrEmpty(await anon.from("opportunities").select("id"), "anon opportunities select");
    expectDeniedOrEmpty(await anon.from("activities").select("id"), "anon activities select");
    expectDeniedOrEmpty(await anon.from("tasks").select("id"), "anon tasks select");
    expectDeniedOrEmpty(await anon.from("form_submissions").select("id"), "anon form submissions select");
    const numericRunId = String(Date.now()).slice(-7);
    const anonPhone = `+35192${numericRunId}`;
    const anonInsert = await anon.from("contacts").insert({
        first_name: "Anon",
        phone: anonPhone,
        phone_normalized: anonPhone,
      })
      .select("id");

    if (anonInsert.data?.[0]?.id) {
      ids.contacts.push(anonInsert.data[0].id);
    }

    expectDeniedOrEmpty(anonInsert, "anon contacts insert");

    expectDeniedOrEmpty(await noProfileClient.from("contacts").select("id"), "auth without profile contacts select");
    expectDeniedOrEmpty(await inactiveClient.from("contacts").select("id"), "inactive profile contacts select");

    const { data: selfProfile, error: selfProfileError } = await consultorClient
      .from("profiles")
      .select("role,is_active")
      .eq("id", tempConsultor.id)
      .single();

    if (selfProfileError) throw selfProfileError;
    assert(selfProfile.role === "consultor" && selfProfile.is_active === true, "active consultant profile not readable");

    const privilegeEscalation = await consultorClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", tempConsultor.id)
      .select("id");

    expectDeniedOrEmpty(privilegeEscalation, "consultant role escalation");

    const { data: roleAfterEscalation, error: roleCheckError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", tempConsultor.id)
      .single();

    if (roleCheckError) throw roleCheckError;
    assert(roleAfterEscalation.role === "consultor", "consultant role changed unexpectedly");

    const adminUpdate = await adminClient
      .from("profiles")
      .update({ full_name: "RLS Temp Consultor Updated" })
      .eq("id", tempConsultor.id)
      .select("id")
      .single();

    if (adminUpdate.error) throw adminUpdate.error;

    const { data: contact, error: contactError } = await consultorClient
      .from("contacts")
      .insert({
        first_name: "RLS",
        last_name: "Contact",
        phone: `+35191${numericRunId}`,
        phone_normalized: `+35191${numericRunId}`,
        email: `rls-${runId}@example.test`,
        email_normalized: `rls-${runId}@example.test`,
      })
      .select("*")
      .single();

    if (contactError) throw contactError;
    ids.contacts.push(contact.id);

    const { data: opportunity, error: opportunityError } = await consultorClient
      .from("opportunities")
      .insert({
        contact_id: contact.id,
        type: "buyer",
        status: "new",
        stage: "nova_lead",
        temperature: "morna",
        created_by: null,
        assigned_to: null,
        location: "Montijo",
      })
      .select("*")
      .single();

    if (opportunityError) throw opportunityError;
    assert(opportunity.created_by === null, "future public intake created_by invariant failed");
    assert(opportunity.assigned_to === null, "future public intake assigned_to invariant failed");

    const now = Date.now();
    const laterDueAt = new Date(now + 48 * 60 * 60 * 1000).toISOString();
    const earlierDueAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();

    const { data: laterTask, error: laterTaskError } = await consultorClient
      .from("tasks")
      .insert({
        opportunity_id: opportunity.id,
        assigned_to: tempConsultor.id,
        title: "RLS later task",
        due_at: laterDueAt,
      })
      .select("*")
      .single();

    if (laterTaskError) throw laterTaskError;

    const { data: earlierTask, error: earlierTaskError } = await consultorClient
      .from("tasks")
      .insert({
        opportunity_id: opportunity.id,
        assigned_to: tempConsultor.id,
        title: "RLS earlier task",
        due_at: earlierDueAt,
      })
      .select("*")
      .single();

    if (earlierTaskError) throw earlierTaskError;

    assert(sameInstant((await getRow(consultorClient, "opportunities", opportunity.id)).next_action_at, earlierDueAt), "next_action_at did not pick earliest open task");

    const { error: completeEarlierError } = await consultorClient
      .from("tasks")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", earlierTask.id);

    if (completeEarlierError) throw completeEarlierError;

    assert(sameInstant((await getRow(consultorClient, "opportunities", opportunity.id)).next_action_at, laterDueAt), "next_action_at did not move to next open task");

    const { error: completeLaterError } = await consultorClient
      .from("tasks")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", laterTask.id);

    if (completeLaterError) throw completeLaterError;

    assert((await getRow(consultorClient, "opportunities", opportunity.id)).next_action_at === null, "next_action_at did not clear after last task");

    const genericLost = await consultorClient.rpc("transition_opportunity_stage", {
      p_opportunity_id: opportunity.id,
      p_new_stage: "perdido",
    });

    assert(genericLost.error, "generic transition unexpectedly allowed perdido");

    const { error: contactadoError } = await consultorClient.rpc("transition_opportunity_stage", {
      p_opportunity_id: opportunity.id,
      p_new_stage: "contactado",
    });

    if (contactadoError) throw contactadoError;
    assert((await getRow(consultorClient, "opportunities", opportunity.id)).status === "open", "contactado did not move new opportunity to open");

    const { error: wonError } = await consultorClient.rpc("transition_opportunity_stage", {
      p_opportunity_id: opportunity.id,
      p_new_stage: "escritura",
    });

    if (wonError) throw wonError;
    const wonOpportunity = await getRow(consultorClient, "opportunities", opportunity.id);
    assert(wonOpportunity.status === "won", "escritura did not set won status");
    assert(wonOpportunity.stage === "escritura", "escritura stage not persisted");

    const todayQueueActive = (await consultorClient
      .from("opportunities")
      .select("id")
      .not("status", "in", "(lost,won,archived)")).data ?? [];
    assert(!todayQueueActive.some((row) => row.id === opportunity.id), "won opportunity remained in active Today Queue set");

    const { data: lostContact, error: lostContactError } = await consultorClient
      .from("contacts")
      .insert({
        first_name: "RLS",
        last_name: "Lost",
        phone: `+35193${numericRunId}`,
        phone_normalized: `+35193${numericRunId}`,
      })
      .select("*")
      .single();

    if (lostContactError) throw lostContactError;
    ids.contacts.push(lostContact.id);

    const { data: lostOpportunity, error: lostOpportunityError } = await consultorClient
      .from("opportunities")
      .insert({
        contact_id: lostContact.id,
        type: "buyer",
        status: "open",
        stage: "contactado",
        temperature: "morna",
      })
      .select("*")
      .single();

    if (lostOpportunityError) throw lostOpportunityError;

    const { error: lostTaskError } = await consultorClient.from("tasks").insert({
      opportunity_id: lostOpportunity.id,
      assigned_to: tempConsultor.id,
      title: "RLS lost task",
      due_at: earlierDueAt,
    });

    if (lostTaskError) throw lostTaskError;

    const { error: markLostError } = await consultorClient.rpc("mark_opportunity_lost", {
      p_opportunity_id: lostOpportunity.id,
      p_reason: "sem_resposta",
      p_notes: "Teste RLS temporario",
    });

    if (markLostError) throw markLostError;

    const lostAfter = await getRow(consultorClient, "opportunities", lostOpportunity.id);
    assert(lostAfter.status === "lost", "mark_opportunity_lost did not set lost status");
    assert(lostAfter.stage === "perdido", "mark_opportunity_lost did not set perdido stage");
    assert(lostAfter.lost_reason === "sem_resposta", "mark_opportunity_lost did not persist reason");
    assert(lostAfter.next_action_at === null, "mark_opportunity_lost did not clear next_action_at");

    const logoutResult = await consultorClient.auth.signOut();
    if (logoutResult.error) throw logoutResult.error;
    const signedOutRead = await consultorClient.from("contacts").select("id");
    expectDeniedOrEmpty(signedOutRead, "signed-out contacts select");

    console.table([
      { check: "real Tiago admin profile", result: "pass" },
      { check: "real Mariana consultor profile", result: "pass" },
      { check: "anon CRM table access blocked", result: "pass" },
      { check: "auth user without profile blocked", result: "pass" },
      { check: "inactive profile blocked", result: "pass" },
      { check: "admin can manage profiles", result: "pass" },
      { check: "consultor cannot promote role", result: "pass" },
      { check: "authenticated CRM operations", result: "pass" },
      { check: "generic perdido transition blocked", result: "pass" },
      { check: "mark lost dedicated operation", result: "pass" },
      { check: "escritura sets won", result: "pass" },
      { check: "tasks recalculate next_action_at", result: "pass" },
      { check: "won excluded from Today Queue active set", result: "pass" },
      { check: "logout loses CRM access", result: "pass" },
    ]);
  } finally {
    await cleanup(admin, ids);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
