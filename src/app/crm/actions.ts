"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";
import { manualOpportunitySchema } from "@/lib/crm/manual-opportunity";
import type { CrmNoteCategory, LeadTemperature, TaskPriority } from "@/types/crm";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const entry = value(formData, key);
  return entry.length > 0 ? entry : null;
}

function optionalNumberValue(formData: FormData, key: string) {
  const entry = optionalValue(formData, key);
  return entry ? Number(entry) : null;
}

function optionalBooleanValue(formData: FormData, key: string) {
  const entry = optionalValue(formData, key);
  return entry ?? null;
}

function revalidateCrmPaths(opportunityId?: string, contactId?: string) {
  revalidatePath("/crm/hoje");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm/contactos");
  revalidatePath("/crm/dashboard");

  if (opportunityId) {
    revalidatePath(`/crm/oportunidades/${opportunityId}`);
  }

  if (contactId) {
    revalidatePath(`/crm/contactos/${contactId}`);
  }
}

async function currentUserId() {
  const profile = await getSupabaseSessionProfile();
  return profile?.id ?? null;
}

export async function updateOpportunityStageAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const stage = value(formData, "stage");

  const updated = await getCrmRepository().updateOpportunityStage(
    opportunityId,
    stage,
    await currentUserId(),
  );

  revalidateCrmPaths(opportunityId, updated.contactId);
}

export async function assignOpportunityAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const profileId = optionalValue(formData, "assignedTo");
  const updated = await getCrmRepository().assignOpportunity(opportunityId, profileId);

  revalidateCrmPaths(opportunityId, updated.contactId);
}

export async function setOpportunityTemperatureAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const temperature = value(formData, "temperature") as LeadTemperature;
  const updated = await getCrmRepository().setOpportunityTemperature(
    opportunityId,
    temperature,
  );

  revalidateCrmPaths(opportunityId, updated.contactId);
}

export async function createTaskAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const title = value(formData, "title");
  const dueAt = value(formData, "dueAt");
  const assignedTo = optionalValue(formData, "assignedTo");
  const priority = (optionalValue(formData, "priority") ?? "normal") as TaskPriority;
  const dueAtIso = new Date(dueAt).toISOString();

  await getCrmRepository().createTask({
    opportunityId,
    assignedTo,
    title,
    dueAt: dueAtIso,
    priority,
  });

  const opportunity = await getCrmRepository().getOpportunity(opportunityId);
  revalidateCrmPaths(opportunityId, opportunity?.contactId);
}

export async function updateTaskAction(formData: FormData) {
  const taskId = value(formData, "taskId");
  const title = value(formData, "title");
  const dueAt = value(formData, "dueAt");
  const assignedTo = optionalValue(formData, "assignedTo");
  const priority = (optionalValue(formData, "priority") ?? "normal") as TaskPriority;
  const dueAtIso = new Date(dueAt).toISOString();

  const task = await getCrmRepository().updateTask({
    taskId,
    assignedTo,
    title,
    dueAt: dueAtIso,
    priority,
  });
  const opportunity = await getCrmRepository().getOpportunity(task.opportunityId);

  revalidateCrmPaths(task.opportunityId, opportunity?.contactId);
}

export async function completeTaskAction(formData: FormData) {
  const taskId = value(formData, "taskId");
  const task = await getCrmRepository().completeTask(taskId, await currentUserId());
  const opportunity = await getCrmRepository().getOpportunity(task.opportunityId);

  revalidateCrmPaths(task.opportunityId, opportunity?.contactId);
}

export async function updateContactAction(formData: FormData) {
  const contactId = value(formData, "contactId");
  const firstName = value(formData, "firstName");
  const lastName = optionalValue(formData, "lastName");
  const phone = value(formData, "phone");
  const email = optionalValue(formData, "email");

  await getCrmRepository().updateContact({
    contactId,
    firstName,
    lastName,
    phone,
    email,
  });

  revalidateCrmPaths(undefined, contactId);
}

export async function addNoteAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const body = value(formData, "body");

  await getCrmRepository().addActivity({
    opportunityId,
    userId: await currentUserId(),
    type: "note",
    title: "Nota adicionada",
    body,
  });

  const opportunity = await getCrmRepository().getOpportunity(opportunityId);
  revalidateCrmPaths(opportunityId, opportunity?.contactId);
}

function formDataValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim());
}

export async function createCrmNoteAction(formData: FormData) {
  const ownerId = await currentUserId();
  if (!ownerId) throw new Error("Utilizador sem sessao ativa.");

  const opportunityId = optionalValue(formData, "opportunityId");
  const contactId = optionalValue(formData, "contactId");

  const note = await getCrmRepository().createCrmNote({
    ownerId,
    opportunityId,
    contactId,
    title: optionalValue(formData, "title"),
    body: value(formData, "body"),
    category: (value(formData, "category") || "warm") as CrmNoteCategory,
    teamIds: formDataValues(formData, "teamIds"),
  });

  revalidateCrmPaths(opportunityId ?? undefined, contactId ?? undefined);
  revalidatePath("/crm/dashboard");

  if (note.opportunityId) revalidatePath(`/crm/oportunidades/${note.opportunityId}`);
}

export async function updateCrmNoteAction(formData: FormData) {
  const noteId = value(formData, "noteId");
  const opportunityId = optionalValue(formData, "opportunityId");
  const contactId = optionalValue(formData, "contactId");
  const archive = value(formData, "archive") === "on";
  const note = await getCrmRepository().updateCrmNote({
    noteId,
    title: optionalValue(formData, "title"),
    body: value(formData, "body"),
    category: (value(formData, "category") || "warm") as CrmNoteCategory,
    archivedAt: archive ? new Date().toISOString() : null,
    teamIds: formDataValues(formData, "teamIds"),
  });

  revalidateCrmPaths(opportunityId ?? undefined, contactId ?? undefined);
  revalidatePath("/crm/dashboard");

  if (note.opportunityId) revalidatePath(`/crm/oportunidades/${note.opportunityId}`);
}

export async function createNoteTeamAction(formData: FormData) {
  const createdBy = await currentUserId();
  if (!createdBy) throw new Error("Utilizador sem sessao ativa.");

  await getCrmRepository().createNoteTeam({
    name: value(formData, "name"),
    createdBy,
    memberIds: formDataValues(formData, "memberIds"),
  });

  revalidatePath("/crm/dashboard");
}

export async function registerCallAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const body = optionalValue(formData, "body") ?? "Chamada registada no CRM.";

  await getCrmRepository().addActivity({
    opportunityId,
    userId: await currentUserId(),
    type: "call",
    title: "Chamada registada",
    body,
  });

  const opportunity = await getCrmRepository().getOpportunity(opportunityId);
  revalidateCrmPaths(opportunityId, opportunity?.contactId);
}

export async function registerMeetingAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const body = optionalValue(formData, "body") ?? "Reuniao registada no CRM.";

  await getCrmRepository().addActivity({
    opportunityId,
    userId: await currentUserId(),
    type: "meeting",
    title: "Reuniao registada",
    body,
  });

  const opportunity = await getCrmRepository().getOpportunity(opportunityId);
  revalidateCrmPaths(opportunityId, opportunity?.contactId);
}

export async function markOpportunityLostAction(formData: FormData) {
  const opportunityId = value(formData, "opportunityId");
  const reason = value(formData, "reason");
  const notes = optionalValue(formData, "notes");

  const updated = await getCrmRepository().markOpportunityLost(
    opportunityId,
    reason,
    notes,
    await currentUserId(),
  );

  revalidateCrmPaths(opportunityId, updated.contactId);
}

export type ManualOpportunityActionState = {
  error: string | null;
};

export async function createManualOpportunityAction(
  _state: ManualOpportunityActionState,
  formData: FormData,
): Promise<ManualOpportunityActionState> {
  let createdOpportunityId: string | null = null;

  try {
    const hasNextTask = value(formData, "hasNextTask") === "on";
    const opportunityType = value(formData, "type");
    const buyerPropertyType = optionalValue(formData, "buyerPropertyType");
    const buyerTypology = optionalValue(formData, "buyerTypology");
    const parsed = manualOpportunitySchema.parse({
      contactId: optionalValue(formData, "contactId"),
      contact: {
        name: optionalValue(formData, "name"),
        phone: optionalValue(formData, "phone"),
        email: optionalValue(formData, "email"),
      },
      opportunity: {
        type: opportunityType,
        sourceId: value(formData, "sourceId"),
        temperature: value(formData, "temperature") || "morna",
        assignedTo: optionalValue(formData, "assignedTo"),
        location: optionalValue(formData, "location"),
        propertyType:
          opportunityType === "buyer"
            ? buyerPropertyType
            : optionalValue(formData, "propertyType"),
        typology: opportunityType === "buyer" ? buyerTypology : null,
        sellerSituation: optionalValue(formData, "sellerSituation"),
        timeframe: optionalValue(formData, "timeframe"),
        financingStatus: optionalValue(formData, "financingStatus"),
        currentPropertyToSell: optionalBooleanValue(formData, "currentPropertyToSell"),
        propertyAlreadyListed: optionalBooleanValue(formData, "propertyAlreadyListed"),
        budgetMin: optionalNumberValue(formData, "budgetMin"),
        budgetMax: optionalNumberValue(formData, "budgetMax"),
      },
      nextTask: hasNextTask
        ? {
            type: value(formData, "nextTaskType"),
            dueAt: value(formData, "nextTaskDueAt"),
            title: value(formData, "nextTaskTitle"),
          }
        : null,
      note: optionalValue(formData, "note"),
    });

    const result = await getCrmRepository().createManualOpportunity(parsed);

    revalidateCrmPaths(result.opportunity.id, result.contact.id);
    createdOpportunityId = result.opportunity.id;
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: error.issues[0]?.message ?? "Dados invalidos.",
      };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar a oportunidade.",
    };
  }

  if (createdOpportunityId) {
    redirect(`/crm/oportunidades/${createdOpportunityId}?created=1`);
  }

  return { error: "Nao foi possivel criar a oportunidade." };
}
