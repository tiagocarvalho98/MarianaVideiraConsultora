"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseSessionProfile } from "@/lib/auth/server-auth";
import { getCrmRepository } from "@/lib/crm";
import type { LeadTemperature, TaskPriority } from "@/types/crm";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const entry = value(formData, key);
  return entry.length > 0 ? entry : null;
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
