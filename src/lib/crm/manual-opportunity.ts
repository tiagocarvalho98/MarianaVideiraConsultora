import { z } from "zod";
import { normalizeEmail, normalizePhone } from "./intake";
import type {
  Contact,
  LeadTemperature,
  Opportunity,
  OpportunityType,
  Task,
} from "@/types/crm";

const optionalTrimmedString = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .pipe(z.string().max(maxLength))
    .transform((value) => (value ? value : null));

const requiredTrimmedString = (maxLength: number, message: string) =>
  z.string().trim().min(1, message).max(maxLength);

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || typeof value === "undefined" || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .pipe(z.number().min(0).nullable());

const optionalBoolean = z
  .union([z.literal("true"), z.literal("false"), z.boolean(), z.null(), z.undefined(), z.literal("")])
  .transform((value) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return null;
  });

export const manualTaskTypeSchema = z.enum(["call", "meeting", "follow_up", "other"]);

export type ManualTaskType = z.infer<typeof manualTaskTypeSchema>;

export const manualTaskTypes: Array<{ id: ManualTaskType; label: string }> = [
  { id: "call", label: "Telefonema" },
  { id: "meeting", label: "Reuniao" },
  { id: "follow_up", label: "Follow-up" },
  { id: "other", label: "Outro" },
];

export const manualOpportunitySchema = z
  .object({
    contactId: optionalTrimmedString(80),
    contact: z.object({
      name: optionalTrimmedString(160),
      phone: optionalTrimmedString(40),
      email: optionalTrimmedString(180),
    }),
    opportunity: z.object({
      type: z.enum(["buyer", "seller"]),
      sourceId: requiredTrimmedString(80, "A origem e obrigatoria."),
      temperature: z.enum(["fria", "morna", "quente"]).default("morna"),
      assignedTo: optionalTrimmedString(80),
      location: optionalTrimmedString(240),
      propertyType: optionalTrimmedString(120),
      sellerSituation: optionalTrimmedString(180),
      timeframe: optionalTrimmedString(120),
      financingStatus: optionalTrimmedString(120),
      currentPropertyToSell: optionalBoolean,
      propertyAlreadyListed: optionalBoolean,
      budgetMin: optionalNumber,
      budgetMax: optionalNumber,
    }),
    nextTask: z
      .object({
        type: manualTaskTypeSchema,
        dueAt: requiredTrimmedString(80, "A data da proxima acao e obrigatoria."),
        title: requiredTrimmedString(160, "A descricao da proxima acao e obrigatoria."),
      })
      .nullable(),
    note: optionalTrimmedString(1500),
  })
  .superRefine((value, context) => {
    if (!value.contactId) {
      if (!value.contact.name) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contact", "name"],
          message: "O nome e obrigatorio.",
        });
      }

      if (!value.contact.phone) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contact", "phone"],
          message: "O telefone e obrigatorio.",
        });
      }
    }

    if (
      value.opportunity.type === "buyer" &&
      value.opportunity.budgetMin !== null &&
      value.opportunity.budgetMax !== null &&
      value.opportunity.budgetMin > value.opportunity.budgetMax
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["opportunity", "budgetMax"],
        message: "O orcamento maximo deve ser igual ou superior ao minimo.",
      });
    }

    if (value.nextTask) {
      const dueAt = new Date(value.nextTask.dueAt);

      if (Number.isNaN(dueAt.getTime())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nextTask", "dueAt"],
          message: "A data da proxima acao e invalida.",
        });
      }
    }
  });

export type ManualOpportunityInput = z.infer<typeof manualOpportunitySchema>;

export type ManualOpportunityResult = {
  contact: Contact;
  opportunity: Opportunity;
  task: Task | null;
};

export type ManualOpportunityContactPreview = Pick<
  Contact,
  "id" | "firstName" | "lastName" | "phone" | "phoneNormalized" | "email" | "emailNormalized"
>;

export function splitManualContactName(name: string) {
  const parts = name.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || null,
  };
}

export function findExistingManualContact(
  contacts: ManualOpportunityContactPreview[],
  values: { phone?: string | null; email?: string | null },
) {
  const phoneNormalized = normalizePhone(values.phone ?? "");
  const emailNormalized = normalizeEmail(values.email);

  const phoneMatch = phoneNormalized
    ? contacts.find((contact) => contact.phoneNormalized === phoneNormalized)
    : null;

  if (phoneMatch) return phoneMatch;

  if (!emailNormalized) return null;

  return contacts.find((contact) => contact.emailNormalized === emailNormalized) ?? null;
}

export function taskTypeLabel(type: ManualTaskType) {
  return manualTaskTypes.find((item) => item.id === type)?.label ?? "Outro";
}

export function formatManualTaskTitle(type: ManualTaskType, title: string) {
  return `${taskTypeLabel(type)}: ${title.trim()}`;
}

export function mapManualOpportunityForRpc(input: ManualOpportunityInput) {
  const { firstName, lastName } = splitManualContactName(input.contact.name ?? "");
  const nextTask = input.nextTask
    ? {
        type: input.nextTask.type,
        dueAt: new Date(input.nextTask.dueAt).toISOString(),
        title: formatManualTaskTitle(input.nextTask.type, input.nextTask.title),
      }
    : null;

  return {
    contactId: input.contactId,
    contact: {
      firstName,
      lastName,
      phone: input.contact.phone,
      email: input.contact.email,
    },
    opportunity: {
      type: input.opportunity.type satisfies OpportunityType,
      sourceId: input.opportunity.sourceId,
      temperature: input.opportunity.temperature satisfies LeadTemperature,
      assignedTo: input.opportunity.assignedTo,
      location: input.opportunity.location,
      propertyType: input.opportunity.propertyType,
      sellerSituation: input.opportunity.sellerSituation,
      timeframe: input.opportunity.timeframe,
      financingStatus: input.opportunity.financingStatus,
      currentPropertyToSell: input.opportunity.currentPropertyToSell,
      propertyAlreadyListed: input.opportunity.propertyAlreadyListed,
      budgetMin: input.opportunity.budgetMin,
      budgetMax: input.opportunity.budgetMax,
    },
    nextTask,
    note: input.note,
  };
}
