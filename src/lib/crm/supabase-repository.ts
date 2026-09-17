import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/types/database";
import type {
  Activity,
  Contact,
  DashboardMetrics,
  FormSubmission,
  LeadSource,
  LeadTemperature,
  Opportunity,
  OpportunityWithRelations,
  Profile,
  Task,
  TodayQueueGroup,
} from "@/types/crm";
import {
  mapBuyerLeadFormToIntake,
  mapSellerLeadFormToIntake,
  type BuyerLeadInput,
  type LeadIntakeResult,
  type MappedLeadIntake,
  type SellerLeadInput,
} from "./intake";
import {
  mapManualOpportunityForRpc,
  type ManualOpportunityInput,
  type ManualOpportunityResult,
} from "./manual-opportunity";
import {
  sortByDateAsc,
  type AddActivityInput,
  type CreateTaskInput,
  type CrmDataset,
  type CrmRepository,
  type OpportunityFilters,
  type TaskFilters,
} from "./repository";

type ProfileRow = Tables<"profiles">;
type ContactRow = Tables<"contacts">;
type LeadSourceRow = Tables<"lead_sources">;
type OpportunityRow = Tables<"opportunities">;
type ActivityRow = Tables<"activities">;
type TaskRow = Tables<"tasks">;
type FormSubmissionRow = Tables<"form_submissions">;

const staleThresholdDays = 7;

type PublicIntakeRpcResult = {
  contactId: string;
  opportunityId: string;
  formSubmissionId: string;
};

type ManualOpportunityRpcResult = {
  contactId: string;
  opportunityId: string;
  taskId: string | null;
};

function jsonToRecord(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function recordToJson(value: Record<string, unknown>): Json {
  return value as Json;
}

function intakeToJson(value: MappedLeadIntake): Json {
  return value as unknown as Json;
}

function manualOpportunityToJson(value: ReturnType<typeof mapManualOpportunityForRpc>): Json {
  return value as unknown as Json;
}

function assertStringId(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid public intake result: ${label}`);
  }

  return value;
}

function parsePublicIntakeResult(value: Json): PublicIntakeRpcResult {
  const result = jsonToRecord(value);

  return {
    contactId: assertStringId(result.contactId, "contactId"),
    opportunityId: assertStringId(result.opportunityId, "opportunityId"),
    formSubmissionId: assertStringId(result.formSubmissionId, "formSubmissionId"),
  };
}

function parseManualOpportunityResult(value: Json): ManualOpportunityRpcResult {
  const result = jsonToRecord(value);
  const taskId = result.taskId;

  return {
    contactId: assertStringId(result.contactId, "contactId"),
    opportunityId: assertStringId(result.opportunityId, "opportunityId"),
    taskId: typeof taskId === "string" && taskId.length > 0 ? taskId : null,
  };
}

function toProfile(row: ProfileRow): Profile {
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

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    phoneNormalized: row.phone_normalized,
    email: row.email,
    emailNormalized: row.email_normalized,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLeadSource(row: LeadSourceRow): LeadSource {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: row.created_at,
  };
}

function toOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    contactId: row.contact_id,
    type: row.type,
    status: row.status,
    stage: row.stage,
    temperature: row.temperature,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    sourceId: row.source_id,
    location: row.location,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    propertyType: row.property_type,
    typology: row.typology,
    timeframe: row.timeframe,
    financingStatus: row.financing_status,
    currentPropertyToSell: row.current_property_to_sell,
    propertyAlreadyListed: row.property_already_listed,
    nextActionAt: row.next_action_at,
    firstContactAt: row.first_contact_at,
    lastActivityAt: row.last_activity_at,
    lostReason: row.lost_reason,
    lostNotes: row.lost_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    metadata: jsonToRecord(row.metadata),
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    assignedTo: row.assigned_to,
    title: row.title,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toFormSubmission(row: FormSubmissionRow): FormSubmission {
  return {
    id: row.id,
    contactId: row.contact_id,
    opportunityId: row.opportunity_id,
    formType: row.form_type,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmContent: row.utm_content,
    utmTerm: row.utm_term,
    gclid: row.gclid,
    fbclid: row.fbclid,
    referrer: row.referrer,
    landingPage: row.landing_page,
    userAgent: row.user_agent,
    privacyConsent: row.privacy_consent,
    marketingConsent: row.marketing_consent,
    rawPayload: jsonToRecord(row.raw_payload),
    createdAt: row.created_at,
  };
}

function daysBetweenNowAnd(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
}

function isPastIso(value: string | null) {
  return value ? new Date(value).getTime() < Date.now() : false;
}

function isTodayIso(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function contactName(opportunity: OpportunityWithRelations) {
  return `${opportunity.contact.firstName} ${opportunity.contact.lastName ?? ""}`.trim();
}

function isActive(opportunity: OpportunityWithRelations) {
  return !["lost", "won", "archived"].includes(opportunity.status);
}

function isMeetingOpportunity(opportunity: OpportunityWithRelations) {
  const title = opportunity.nextTask?.title.toLowerCase() ?? "";
  return (
    title.includes("reuniao") ||
    title.includes("visita") ||
    opportunity.stage.includes("reuniao") ||
    opportunity.stage === "visitas"
  );
}

function isStale(opportunity: OpportunityWithRelations) {
  return isActive(opportunity) && daysBetweenNowAnd(opportunity.lastActivityAt) >= staleThresholdDays;
}

function buildTodayQueue(opportunities: OpportunityWithRelations[]): TodayQueueGroup[] {
  const active = opportunities.filter(isActive);
  const alreadyShown = new Set<string>();

  const take = (predicate: (opportunity: OpportunityWithRelations) => boolean) => {
    const matches = active.filter(
      (opportunity) => !alreadyShown.has(opportunity.id) && predicate(opportunity),
    );

    matches.forEach((opportunity) => alreadyShown.add(opportunity.id));

    return sortByDateAsc(
      matches,
      (opportunity) => opportunity.nextActionAt ?? opportunity.createdAt,
    );
  };

  return [
    {
      id: "newUncontacted",
      title: "Leads novas ainda nao contactadas",
      description: "Entrada recente sem primeiro contacto registado.",
      opportunities: take(
        (opportunity) => opportunity.stage === "nova_lead" && !opportunity.firstContactAt,
      ),
    },
    {
      id: "overdue",
      title: "Follow-ups vencidos",
      description: "Tarefas em atraso que precisam de resposta.",
      opportunities: take((opportunity) => isPastIso(opportunity.nextActionAt)),
    },
    {
      id: "todayActions",
      title: "Acoes de hoje",
      description: "Chamadas e proximas acoes agendadas para hoje.",
      opportunities: take(
        (opportunity) =>
          isTodayIso(opportunity.nextActionAt) && !isMeetingOpportunity(opportunity),
      ),
    },
    {
      id: "todayMeetings",
      title: "Reunioes de hoje",
      description: "Interacoes presenciais ou comerciais marcadas para hoje.",
      opportunities: take(
        (opportunity) =>
          isTodayIso(opportunity.nextActionAt) && isMeetingOpportunity(opportunity),
      ),
    },
    {
      id: "missingNextAction",
      title: "Qualificadas sem proxima acao",
      description: "Oportunidades qualificadas que requerem atencao imediata.",
      opportunities: take(
        (opportunity) => opportunity.stage === "qualificado" && !opportunity.nextActionAt,
      ),
    },
    {
      id: "unassigned",
      title: "Sem responsavel",
      description: "Oportunidades que ainda nao foram atribuidas.",
      opportunities: take((opportunity) => !opportunity.assignedTo),
    },
    {
      id: "stale",
      title: "Paradas ha demasiado tempo",
      description: "Negocios sem atividade recente.",
      opportunities: take(isStale),
    },
  ];
}

function filterOpportunities(
  opportunities: OpportunityWithRelations[],
  filters?: OpportunityFilters,
) {
  const query = filters?.query?.trim().toLowerCase();

  return opportunities.filter((opportunity) => {
    const matchesType = filters?.type ? opportunity.type === filters.type : true;
    const matchesStatus = filters?.status ? opportunity.status === filters.status : true;
    const matchesAssignee =
      filters?.assignedTo !== undefined
        ? opportunity.assignedTo === filters.assignedTo
        : true;
    const matchesTemperature = filters?.temperature
      ? opportunity.temperature === filters.temperature
      : true;
    const matchesSource = filters?.sourceId ? opportunity.sourceId === filters.sourceId : true;
    const matchesQuery = query
      ? [
          contactName(opportunity),
          opportunity.contact.phone,
          opportunity.contact.email ?? "",
          opportunity.location ?? "",
          opportunity.stage,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return (
      matchesType &&
      matchesStatus &&
      matchesAssignee &&
      matchesTemperature &&
      matchesSource &&
      matchesQuery
    );
  });
}

function buildDashboardMetrics(
  opportunities: OpportunityWithRelations[],
  leadSources: LeadSource[],
): DashboardMetrics {
  const weekStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const openOpportunities = opportunities.filter(isActive);

  return {
    newLeads: openOpportunities.filter((opportunity) => opportunity.stage === "nova_lead")
      .length,
    openOpportunities: openOpportunities.length,
    leadsThisWeek: opportunities.filter((opportunity) => opportunity.createdAt >= weekStart)
      .length,
    sellers: openOpportunities.filter((opportunity) => opportunity.type === "seller")
      .length,
    buyers: openOpportunities.filter((opportunity) => opportunity.type === "buyer").length,
    qualified: openOpportunities.filter((opportunity) => opportunity.stage === "qualificado")
      .length,
    lost: opportunities.filter((opportunity) => opportunity.status === "lost").length,
    overdueFollowUps: openOpportunities.filter((opportunity) =>
      isPastIso(opportunity.nextActionAt),
    ).length,
    todayActions: openOpportunities.filter((opportunity) =>
      isTodayIso(opportunity.nextActionAt),
    ).length,
    bySource: leadSources.map((source) => ({
      source: source.name,
      count: opportunities.filter((opportunity) => opportunity.sourceId === source.id)
        .length,
    })),
    byStage: Array.from(new Set(opportunities.map((opportunity) => opportunity.stage))).map(
      (stage) => ({
        stage,
        count: opportunities.filter((opportunity) => opportunity.stage === stage).length,
      }),
    ),
  };
}

function byDueDate(taskA: Task, taskB: Task) {
  return new Date(taskA.dueAt).getTime() - new Date(taskB.dueAt).getTime();
}

async function activeProfileForCurrentUser() {
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

async function allRelations() {
  const supabase = await createSupabaseServerClient();
  const [
    contactsResult,
    profilesResult,
    sourcesResult,
    opportunitiesResult,
    activitiesResult,
    tasksResult,
    formSubmissionsResult,
  ] = await Promise.all([
    supabase.from("contacts").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("lead_sources").select("*").order("name", { ascending: true }),
    supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
    supabase.from("activities").select("*").order("occurred_at", { ascending: false }),
    supabase.from("tasks").select("*").order("due_at", { ascending: true }),
    supabase.from("form_submissions").select("*").order("created_at", { ascending: false }),
  ]);

  const failed = [
    contactsResult,
    profilesResult,
    sourcesResult,
    opportunitiesResult,
    activitiesResult,
    tasksResult,
    formSubmissionsResult,
  ].find((result) => result.error);

  if (failed?.error) throw failed.error;

  const contacts = (contactsResult.data ?? []).map(toContact);
  const profiles = (profilesResult.data ?? []).map(toProfile);
  const leadSources = (sourcesResult.data ?? []).map(toLeadSource);
  const activities = (activitiesResult.data ?? []).map(toActivity);
  const tasks = (tasksResult.data ?? []).map(toTask);
  const formSubmissions = (formSubmissionsResult.data ?? []).map(toFormSubmission);
  const opportunities = (opportunitiesResult.data ?? []).map((row) => {
    const opportunity = toOpportunity(row);
    const contact = contacts.find((item) => item.id === opportunity.contactId);

    if (!contact) {
      throw new Error(`Missing contact for opportunity ${opportunity.id}`);
    }

    const opportunityTasks = tasks.filter((task) => task.opportunityId === opportunity.id);

    return {
      ...opportunity,
      contact,
      assignedProfile:
        profiles.find((profile) => profile.id === opportunity.assignedTo) ?? null,
      createdByProfile:
        profiles.find((profile) => profile.id === opportunity.createdBy) ?? null,
      source:
        leadSources.find((source) => source.id === opportunity.sourceId) ?? null,
      nextTask: [...opportunityTasks]
        .filter((task) => !task.completedAt)
        .sort(byDueDate)[0] ?? null,
      activities: activities.filter((activity) => activity.opportunityId === opportunity.id),
    } satisfies OpportunityWithRelations;
  });

  return {
    profiles,
    contacts,
    leadSources,
    opportunities,
    activities,
    tasks,
    formSubmissions,
  } satisfies CrmDataset;
}

async function getOpportunityOrThrow(opportunityId: string) {
  const opportunity = await createSupabaseRepository().getOpportunity(opportunityId);

  if (!opportunity) {
    throw new Error(`Opportunity not found: ${opportunityId}`);
  }

  return opportunity;
}

async function submitPublicLeadIntake(mapped: MappedLeadIntake): Promise<LeadIntakeResult> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("submit_public_lead_intake", {
    _payload: intakeToJson(mapped),
  });

  if (error) throw error;

  const ids = parsePublicIntakeResult(data);
  const [contactResult, opportunityResult, formSubmissionResult] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", ids.contactId).single(),
    supabase.from("opportunities").select("*").eq("id", ids.opportunityId).single(),
    supabase.from("form_submissions").select("*").eq("id", ids.formSubmissionId).single(),
  ]);

  if (contactResult.error) throw contactResult.error;
  if (opportunityResult.error) throw opportunityResult.error;
  if (formSubmissionResult.error) throw formSubmissionResult.error;

  return {
    contact: toContact(contactResult.data),
    opportunity: toOpportunity(opportunityResult.data),
    formSubmission: toFormSubmission(formSubmissionResult.data),
  };
}

async function createManualOpportunityInSupabase(
  input: ManualOpportunityInput,
): Promise<ManualOpportunityResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_manual_opportunity", {
    _payload: manualOpportunityToJson(mapManualOpportunityForRpc(input)),
  });

  if (error) throw error;

  const ids = parseManualOpportunityResult(data);
  const [contactResult, opportunityResult, taskResult] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", ids.contactId).single(),
    supabase.from("opportunities").select("*").eq("id", ids.opportunityId).single(),
    ids.taskId
      ? supabase.from("tasks").select("*").eq("id", ids.taskId).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (contactResult.error) throw contactResult.error;
  if (opportunityResult.error) throw opportunityResult.error;
  if (taskResult.error) throw taskResult.error;

  return {
    contact: toContact(contactResult.data),
    opportunity: toOpportunity(opportunityResult.data),
    task: taskResult.data ? toTask(taskResult.data) : null,
  };
}

export function createSupabaseRepository(): CrmRepository {
  return {
    async getCurrentUser() {
      return activeProfileForCurrentUser();
    },
    async getCurrentProfile() {
      return activeProfileForCurrentUser();
    },
    async getProfiles() {
      return (await allRelations()).profiles;
    },
    async listProfiles() {
      return this.getProfiles();
    },
    async getContacts() {
      return (await allRelations()).contacts;
    },
    async listContacts() {
      return this.getContacts();
    },
    async getContact(id) {
      return (await allRelations()).contacts.find((contact) => contact.id === id) ?? null;
    },
    async getOpportunities(filters) {
      return filterOpportunities((await allRelations()).opportunities, filters);
    },
    async listOpportunities(filters) {
      return this.getOpportunities(filters);
    },
    async getOpportunity(id) {
      return (await allRelations()).opportunities.find((opportunity) => opportunity.id === id) ?? null;
    },
    async getTodayQueue() {
      return buildTodayQueue((await allRelations()).opportunities);
    },
    async getTodayPriorityGroups() {
      return this.getTodayQueue();
    },
    async submitSellerLead(input: SellerLeadInput) {
      return submitPublicLeadIntake(mapSellerLeadFormToIntake(input));
    },
    async submitBuyerLead(input: BuyerLeadInput) {
      return submitPublicLeadIntake(mapBuyerLeadFormToIntake(input));
    },
    async createManualOpportunity(input: ManualOpportunityInput) {
      return createManualOpportunityInSupabase(input);
    },
    async getActivities(opportunityId) {
      return (await allRelations()).activities.filter(
        (activity) => activity.opportunityId === opportunityId,
      );
    },
    async getTasks(filters?: TaskFilters) {
      const tasks = (await allRelations()).tasks;

      return tasks.filter((task) => {
        const matchesOpportunity = filters?.opportunityId
          ? task.opportunityId === filters.opportunityId
          : true;
        const matchesAssignee =
          filters && "assignedTo" in filters ? task.assignedTo === filters.assignedTo : true;
        const matchesCompleted =
          filters && typeof filters.completed === "boolean"
            ? Boolean(task.completedAt) === filters.completed
            : true;

        return matchesOpportunity && matchesAssignee && matchesCompleted;
      });
    },
    async getLeadSources() {
      return (await allRelations()).leadSources;
    },
    async getDashboardMetrics() {
      const dataset = await allRelations();
      return buildDashboardMetrics(dataset.opportunities, dataset.leadSources);
    },
    async updateOpportunityStage(opportunityId, newStage) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.rpc("transition_opportunity_stage", {
        p_opportunity_id: opportunityId,
        p_new_stage: newStage,
      });

      if (error) throw error;

      return getOpportunityOrThrow(opportunityId);
    },
    async assignOpportunity(opportunityId, profileId) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("opportunities")
        .update({ assigned_to: profileId })
        .eq("id", opportunityId);

      if (error) throw error;

      return getOpportunityOrThrow(opportunityId);
    },
    async setOpportunityTemperature(opportunityId, temperature: LeadTemperature) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("opportunities")
        .update({ temperature })
        .eq("id", opportunityId);

      if (error) throw error;

      return getOpportunityOrThrow(opportunityId);
    },
    async createTask(input: CreateTaskInput) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          opportunity_id: input.opportunityId,
          assigned_to: input.assignedTo,
          title: input.title,
          due_at: input.dueAt,
          priority: input.priority ?? "normal",
        })
        .select("*")
        .single();

      if (error) throw error;

      await this.addActivity({
        opportunityId: input.opportunityId,
        userId: input.assignedTo,
        type: "task_created",
        title: "Tarefa criada",
        body: input.title,
        metadata: { due_at: input.dueAt },
      });

      return toTask(data);
    },
    async completeTask(taskId, userId = null) {
      const supabase = await createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed_at: timestamp })
        .eq("id", taskId)
        .select("*")
        .single();

      if (error) throw error;

      await this.addActivity({
        opportunityId: data.opportunity_id,
        userId,
        type: "task_completed",
        title: "Tarefa concluida",
        body: data.title,
        metadata: { task_id: data.id },
        occurredAt: timestamp,
      });

      return toTask(data);
    },
    async addActivity(input: AddActivityInput) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("activities")
        .insert({
          opportunity_id: input.opportunityId,
          user_id: input.userId ?? null,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          metadata: recordToJson(input.metadata ?? {}),
          occurred_at: input.occurredAt,
        })
        .select("*")
        .single();

      if (error) throw error;

      return toActivity(data);
    },
    async markOpportunityLost(opportunityId, reason, notes = null) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.rpc("mark_opportunity_lost", {
        p_opportunity_id: opportunityId,
        p_reason: reason,
        p_notes: notes ?? undefined,
      });

      if (error) throw error;

      return getOpportunityOrThrow(opportunityId);
    },
    async getDataset() {
      return allRelations();
    },
  };
}
