"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";
import { manualOpportunitySchema } from "@/lib/crm/manual-opportunity";
import type { LeadTemperature, TaskPriority } from "@/types/crm";

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
