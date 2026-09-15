import {
  mockActivities,
  mockContacts,
  mockFormSubmissions,
  mockLeadSources,
  mockOpportunities,
  mockProfiles,
  mockTasks,
} from "@/data/mock";
import { daysAgo, daysBetweenNowAnd, isPastIso, isTodayIso, now } from "@/data/mock/date";
import { buyerLostReasons, sellerLostReasons } from "@/data/lost-reasons";
import {
  sortByDateAsc,
  type AddActivityInput,
  type CreateTaskInput,
  type CrmRepository,
  type OpportunityFilters,
  type TaskFilters,
} from "./repository";
import {
  mapBuyerLeadFormToIntake,
  mapSellerLeadFormToIntake,
  type BuyerLeadInput,
  type MappedLeadIntake,
  type SellerLeadInput,
} from "./intake";
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

const currentMockProfileId = "10000000-0000-4000-8000-000000000001";
const staleThresholdDays = 7;

type MockRepositoryState = {
  profiles: Profile[];
  contacts: Contact[];
  leadSources: LeadSource[];
  opportunities: Opportunity[];
  activities: Activity[];
  tasks: Task[];
  formSubmissions: FormSubmission[];
};

function cloneState(): MockRepositoryState {
  return {
    profiles: structuredClone(mockProfiles),
    contacts: structuredClone(mockContacts),
    leadSources: structuredClone(mockLeadSources),
    opportunities: structuredClone(mockOpportunities),
    activities: structuredClone(mockActivities),
    tasks: structuredClone(mockTasks),
    formSubmissions: structuredClone(mockFormSubmissions),
  };
}

function makeId(prefix: string, sequence: number) {
  return `${prefix}-0000-4000-8000-${String(sequence).padStart(12, "0")}`;
}

function contactName(opportunity: OpportunityWithRelations) {
  return `${opportunity.contact.firstName} ${opportunity.contact.lastName ?? ""}`.trim();
}

function isActive(opportunity: OpportunityWithRelations) {
  return (
    opportunity.status !== "lost" &&
    opportunity.status !== "won" &&
    opportunity.status !== "archived"
  );
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

function hasValidLostReason(opportunity: Opportunity, reason: string) {
  const allowedReasons = opportunity.type === "buyer" ? buyerLostReasons : sellerLostReasons;
  return allowedReasons.some((item) => item.id === reason);
}

function statusForStage(opportunity: Opportunity, newStage: string) {
  if (newStage === "escritura") return "won";
  if (opportunity.status === "won") return "open";
  if (opportunity.status === "new" && newStage !== "nova_lead") return "open";

  return opportunity.status;
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
      filters && "assignedTo" in filters
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

function buildDashboardMetrics(
  opportunities: OpportunityWithRelations[],
  leadSources: LeadSource[],
): DashboardMetrics {
  const weekStart = daysAgo(7);
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

export function createMockCrmRepository(
  initialState: MockRepositoryState = cloneState(),
): CrmRepository {
  const state = initialState;

  const toRelations = (): OpportunityWithRelations[] =>
    state.opportunities.map((opportunity) => {
      const contact = state.contacts.find((item) => item.id === opportunity.contactId);

      if (!contact) {
        throw new Error(`Missing mock contact for opportunity ${opportunity.id}`);
      }

      const opportunityTasks = state.tasks.filter(
        (task) => task.opportunityId === opportunity.id,
      );

      return {
        ...opportunity,
        contact,
        assignedProfile:
          state.profiles.find((profile) => profile.id === opportunity.assignedTo) ?? null,
        createdByProfile:
          state.profiles.find((profile) => profile.id === opportunity.createdBy) ?? null,
        source:
          state.leadSources.find((source) => source.id === opportunity.sourceId) ?? null,
        nextTask:
          sortByDateAsc(
            opportunityTasks.filter((task) => !task.completedAt),
            (task) => task.dueAt,
          )[0] ?? null,
        activities: state.activities
          .filter((activity) => activity.opportunityId === opportunity.id)
          .sort(
            (a, b) =>
              new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
          ),
      };
    });

  const getOpportunityRecord = (opportunityId: string) => {
    const opportunity = state.opportunities.find((item) => item.id === opportunityId);

    if (!opportunity) {
      throw new Error(`Opportunity not found: ${opportunityId}`);
    }

    return opportunity;
  };

  const getTaskRecord = (taskId: string) => {
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    return task;
  };

  const touchOpportunity = (opportunityId: string, timestamp: string) => {
    const opportunity = getOpportunityRecord(opportunityId);
    opportunity.lastActivityAt = timestamp;
    opportunity.updatedAt = timestamp;
  };

  const recalculateNextActionAt = (opportunityId: string) => {
    const opportunity = getOpportunityRecord(opportunityId);
    const nextTask = sortByDateAsc(
      state.tasks.filter(
        (task) => task.opportunityId === opportunityId && !task.completedAt,
      ),
      (task) => task.dueAt,
    )[0];

    opportunity.nextActionAt = nextTask?.dueAt ?? null;
    opportunity.updatedAt = now().toISOString();
  };

  const findDedupedContact = (intake: MappedLeadIntake) => {
    const phoneMatch = state.contacts.find(
      (contact) => contact.phoneNormalized === intake.contact.phoneNormalized,
    );

    if (phoneMatch) return phoneMatch;

    if (!intake.contact.emailNormalized) return null;

    return (
      state.contacts.find(
        (contact) => contact.emailNormalized === intake.contact.emailNormalized,
      ) ?? null
    );
  };

  const submitLeadIntake = async (intake: MappedLeadIntake) => {
    const timestamp = now().toISOString();
    const contact =
      findDedupedContact(intake) ??
      ({
        id: makeId("20000000", state.contacts.length + 1),
        ...intake.contact,
        createdAt: timestamp,
        updatedAt: timestamp,
      } satisfies Contact);

    if (!state.contacts.some((item) => item.id === contact.id)) {
      state.contacts.push(contact);
    }

    const opportunity: Opportunity = {
      id: makeId("40000000", state.opportunities.length + 1),
      contactId: contact.id,
      ...intake.opportunity,
      lastActivityAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    state.opportunities.push(opportunity);

    const formSubmission: FormSubmission = {
      id: makeId("70000000", state.formSubmissions.length + 1),
      contactId: contact.id,
      opportunityId: opportunity.id,
      ...intake.formSubmission,
      createdAt: timestamp,
    };

    state.formSubmissions.push(formSubmission);

    await repository.addActivity({
      opportunityId: opportunity.id,
      userId: null,
      type: "form_submission",
      title:
        intake.opportunity.type === "seller"
          ? "Formulario vendedor recebido"
          : "Formulario comprador recebido",
      metadata: {
        form_submission_id: formSubmission.id,
        form_type: intake.formSubmission.formType,
        landing_page: intake.formSubmission.landingPage,
        utm_source: intake.formSubmission.utmSource,
        utm_campaign: intake.formSubmission.utmCampaign,
        gclid: intake.formSubmission.gclid,
        fbclid: intake.formSubmission.fbclid,
      },
      occurredAt: timestamp,
    });

    if (intake.message) {
      await repository.addActivity({
        opportunityId: opportunity.id,
        userId: null,
        type: "note",
        title: "Mensagem do formulario",
        body: intake.message,
        metadata: { source: "public_form" },
        occurredAt: timestamp,
      });
    }

    return { contact, opportunity, formSubmission };
  };

  const repository: CrmRepository = {
    async getCurrentUser() {
      return state.profiles.find((profile) => profile.id === currentMockProfileId) ?? null;
    },
    async getCurrentProfile() {
      return repository.getCurrentUser();
    },
    async getProfiles() {
      return state.profiles;
    },
    async listProfiles() {
      return repository.getProfiles();
    },
    async getContacts() {
      return state.contacts;
    },
    async listContacts() {
      return repository.getContacts();
    },
    async getContact(id) {
      return state.contacts.find((contact) => contact.id === id) ?? null;
    },
    async getOpportunities(filters) {
      return filterOpportunities(toRelations(), filters);
    },
    async listOpportunities(filters) {
      return repository.getOpportunities(filters);
    },
    async getOpportunity(id) {
      return toRelations().find((opportunity) => opportunity.id === id) ?? null;
    },
    async getTodayQueue() {
      return buildTodayQueue(toRelations());
    },
    async getTodayPriorityGroups() {
      return repository.getTodayQueue();
    },
    async submitSellerLead(input: SellerLeadInput) {
      return submitLeadIntake(mapSellerLeadFormToIntake(input));
    },
    async submitBuyerLead(input: BuyerLeadInput) {
      return submitLeadIntake(mapBuyerLeadFormToIntake(input));
    },
    async getActivities(opportunityId) {
      return state.activities
        .filter((activity) => activity.opportunityId === opportunityId)
        .sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        );
    },
    async getTasks(filters?: TaskFilters) {
      return state.tasks.filter((task) => {
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
      return state.leadSources;
    },
    async getDashboardMetrics() {
      return buildDashboardMetrics(toRelations(), state.leadSources);
    },
    async updateOpportunityStage(opportunityId, newStage, userId = currentMockProfileId) {
      if (newStage === "perdido") {
        throw new Error("Use markOpportunityLost to move an opportunity to perdido");
      }

      const opportunity = getOpportunityRecord(opportunityId);
      const previousStage = opportunity.stage;

      if (previousStage === newStage) {
        const unchanged = await repository.getOpportunity(opportunityId);
        if (!unchanged) throw new Error(`Opportunity not found: ${opportunityId}`);
        return unchanged;
      }

      const timestamp = now().toISOString();
      opportunity.stage = newStage;
      opportunity.status = statusForStage(opportunity, newStage);
      opportunity.updatedAt = timestamp;

      await repository.addActivity({
        opportunityId,
        userId,
        type: "stage_changed",
        title: "Estado alterado",
        metadata: { from: previousStage, to: newStage },
        occurredAt: timestamp,
      });

      const updated = await repository.getOpportunity(opportunityId);
      if (!updated) throw new Error(`Opportunity not found: ${opportunityId}`);
      return updated;
    },
    async assignOpportunity(opportunityId, profileId) {
      const opportunity = getOpportunityRecord(opportunityId);
      const timestamp = now().toISOString();
      opportunity.assignedTo = profileId;
      opportunity.updatedAt = timestamp;

      const updated = await repository.getOpportunity(opportunityId);
      if (!updated) throw new Error(`Opportunity not found: ${opportunityId}`);
      return updated;
    },
    async setOpportunityTemperature(opportunityId, temperature: LeadTemperature) {
      const opportunity = getOpportunityRecord(opportunityId);
      const timestamp = now().toISOString();
      opportunity.temperature = temperature;
      opportunity.updatedAt = timestamp;

      const updated = await repository.getOpportunity(opportunityId);
      if (!updated) throw new Error(`Opportunity not found: ${opportunityId}`);
      return updated;
    },
    async createTask(input: CreateTaskInput) {
      getOpportunityRecord(input.opportunityId);
      const timestamp = now().toISOString();
      const task: Task = {
        id: makeId("50000000", state.tasks.length + 1),
        opportunityId: input.opportunityId,
        assignedTo: input.assignedTo,
        title: input.title,
        dueAt: input.dueAt,
        completedAt: null,
        priority: input.priority ?? "normal",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      state.tasks.push(task);
      recalculateNextActionAt(input.opportunityId);

      await repository.addActivity({
        opportunityId: input.opportunityId,
        userId: input.assignedTo,
        type: "task_created",
        title: "Tarefa criada",
        body: input.title,
        metadata: { due_at: input.dueAt },
        occurredAt: timestamp,
      });

      return task;
    },
    async completeTask(taskId, userId = currentMockProfileId) {
      const task = getTaskRecord(taskId);
      const timestamp = now().toISOString();
      task.completedAt = timestamp;
      task.updatedAt = timestamp;
      recalculateNextActionAt(task.opportunityId);

      await repository.addActivity({
        opportunityId: task.opportunityId,
        userId,
        type: "task_completed",
        title: "Tarefa concluida",
        body: task.title,
        metadata: { task_id: task.id },
        occurredAt: timestamp,
      });

      return task;
    },
    async addActivity(input: AddActivityInput) {
      getOpportunityRecord(input.opportunityId);
      const timestamp = input.occurredAt ?? now().toISOString();
      const activity: Activity = {
        id: makeId("60000000", state.activities.length + 1),
        opportunityId: input.opportunityId,
        userId: input.userId ?? null,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        metadata: input.metadata ?? {},
        occurredAt: timestamp,
        createdAt: timestamp,
      };

      state.activities.push(activity);
      touchOpportunity(input.opportunityId, timestamp);

      const opportunity = getOpportunityRecord(input.opportunityId);
      if (!opportunity.firstContactAt && (input.type === "call" || input.type === "meeting")) {
        opportunity.firstContactAt = timestamp;
      }

      return activity;
    },
    async markOpportunityLost(opportunityId, reason, notes = null, userId = currentMockProfileId) {
      const opportunity = getOpportunityRecord(opportunityId);

      if (!hasValidLostReason(opportunity, reason)) {
        throw new Error(`Invalid ${opportunity.type} lost reason: ${reason}`);
      }

      const timestamp = now().toISOString();
      opportunity.status = "lost";
      opportunity.stage = "perdido";
      opportunity.lostReason = reason;
      opportunity.lostNotes = notes;
      opportunity.nextActionAt = null;
      opportunity.updatedAt = timestamp;

      await repository.addActivity({
        opportunityId,
        userId,
        type: "lost",
        title: "Oportunidade marcada como perdida",
        body: notes,
        metadata: { reason },
        occurredAt: timestamp,
      });

      const updated = await repository.getOpportunity(opportunityId);
      if (!updated) throw new Error(`Opportunity not found: ${opportunityId}`);
      return updated;
    },
    async getDataset() {
      return {
        profiles: state.profiles,
        contacts: state.contacts,
        leadSources: state.leadSources,
        opportunities: toRelations(),
        activities: state.activities,
        tasks: state.tasks,
        formSubmissions: state.formSubmissions,
      };
    },
  };

  return repository;
}

export const mockCrmRepository = createMockCrmRepository();
