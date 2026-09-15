import type { BuyerFormData, SellerFormData } from "@/lib/public/form-validation";
import type {
  Contact,
  FormSubmission,
  LeadTemperature,
  Opportunity,
  OpportunityType,
} from "@/types/crm";

export type LeadTrackingInput = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  userAgent?: string;
};

export type SellerLeadInput = SellerFormData & LeadTrackingInput;
export type BuyerLeadInput = BuyerFormData & LeadTrackingInput;

export type LeadContactDraft = Pick<
  Contact,
  "firstName" | "lastName" | "phone" | "phoneNormalized" | "email" | "emailNormalized"
>;

export type LeadOpportunityDraft = Pick<
  Opportunity,
  | "type"
  | "status"
  | "stage"
  | "temperature"
  | "createdBy"
  | "assignedTo"
  | "sourceId"
  | "location"
  | "budgetMin"
  | "budgetMax"
  | "propertyType"
  | "timeframe"
  | "financingStatus"
  | "currentPropertyToSell"
  | "propertyAlreadyListed"
  | "nextActionAt"
  | "firstContactAt"
  | "lostReason"
  | "lostNotes"
>;

export type LeadFormSubmissionDraft = Pick<
  FormSubmission,
  | "formType"
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "utmContent"
  | "utmTerm"
  | "gclid"
  | "fbclid"
  | "referrer"
  | "landingPage"
  | "userAgent"
  | "privacyConsent"
  | "marketingConsent"
  | "rawPayload"
>;

export type MappedLeadIntake = {
  contact: LeadContactDraft;
  opportunity: LeadOpportunityDraft;
  formSubmission: LeadFormSubmissionDraft;
  message: string | null;
};

export type LeadIntakeResult = {
  contact: Contact;
  opportunity: Opportunity;
  formSubmission: FormSubmission;
};

type SharedLeadFields = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  privacyConsent: true;
} & LeadTrackingInput;

const emptyToNull = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeForCompare = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export function normalizePhone(value: string) {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";
  if (trimmed.startsWith("00")) return `+${digits.slice(2)}`;
  if (hasLeadingPlus) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("9")) return `+351${digits}`;

  return digits;
}

export function normalizeEmail(value: string | undefined | null) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function splitName(name: string) {
  const parts = name.trim().replace(/\s+/g, " ").split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || null;

  return { firstName, lastName };
}

function parseBooleanChoice(value: string) {
  const normalized = normalizeForCompare(value);

  if (["sim", "yes", "true"].includes(normalized)) return true;
  if (["nao", "não", "no", "false"].includes(normalized)) return false;

  return null;
}

function parseBudgetRange(value: string) {
  const values = Array.from(value.matchAll(/\d[\d\s.]*/g))
    .map((match) => Number(match[0].replace(/\D/g, "")))
    .filter((amount) => Number.isFinite(amount) && amount > 0);

  return {
    budgetMin: values[0] ?? null,
    budgetMax: values[1] ?? values[0] ?? null,
  };
}

function mapContact(input: SharedLeadFields): LeadContactDraft {
  const { firstName, lastName } = splitName(input.name);
  const email = emptyToNull(input.email);

  return {
    firstName,
    lastName,
    phone: input.phone.trim(),
    phoneNormalized: normalizePhone(input.phone),
    email,
    emailNormalized: normalizeEmail(email),
  };
}

function mapTracking(input: LeadTrackingInput) {
  return {
    utmSource: emptyToNull(input.utmSource),
    utmMedium: emptyToNull(input.utmMedium),
    utmCampaign: emptyToNull(input.utmCampaign),
    utmContent: emptyToNull(input.utmContent),
    utmTerm: emptyToNull(input.utmTerm),
    gclid: emptyToNull(input.gclid),
    fbclid: emptyToNull(input.fbclid),
    referrer: emptyToNull(input.referrer),
    landingPage: emptyToNull(input.landingPage),
    userAgent: emptyToNull(input.userAgent),
  };
}

function baseOpportunity(type: OpportunityType): Pick<
  LeadOpportunityDraft,
  | "type"
  | "status"
  | "stage"
  | "temperature"
  | "createdBy"
  | "assignedTo"
  | "sourceId"
  | "nextActionAt"
  | "firstContactAt"
  | "lostReason"
  | "lostNotes"
> {
  return {
    type,
    status: "new",
    stage: "nova_lead",
    temperature: "morna" satisfies LeadTemperature,
    createdBy: null,
    assignedTo: null,
    sourceId: null,
    nextActionAt: null,
    firstContactAt: null,
    lostReason: null,
    lostNotes: null,
  };
}

function mapFormSubmission(
  formType: OpportunityType,
  input: SharedLeadFields,
  rawPayload: Record<string, unknown>,
): LeadFormSubmissionDraft {
  return {
    formType,
    ...mapTracking(input),
    privacyConsent: input.privacyConsent,
    marketingConsent: false,
    rawPayload,
  };
}

export function mapSellerLeadFormToIntake(input: SellerLeadInput): MappedLeadIntake {
  return {
    contact: mapContact(input),
    opportunity: {
      ...baseOpportunity("seller"),
      location: input.propertyLocation.trim(),
      budgetMin: null,
      budgetMax: null,
      propertyType: input.propertyType.trim(),
      timeframe: input.sellingTimeframe.trim(),
      financingStatus: null,
      currentPropertyToSell: null,
      propertyAlreadyListed: parseBooleanChoice(input.alreadyListed),
    },
    formSubmission: mapFormSubmission("seller", input, { ...input, formType: "seller" }),
    message: emptyToNull(input.message),
  };
}

export function mapBuyerLeadFormToIntake(input: BuyerLeadInput): MappedLeadIntake {
  const { budgetMin, budgetMax } = parseBudgetRange(input.budget);

  return {
    contact: mapContact(input),
    opportunity: {
      ...baseOpportunity("buyer"),
      location: input.desiredZones.trim(),
      budgetMin,
      budgetMax,
      propertyType: input.typology.trim(),
      timeframe: input.buyingTimeframe.trim(),
      financingStatus: input.financingStatus.trim(),
      currentPropertyToSell: parseBooleanChoice(input.hasPropertyToSell),
      propertyAlreadyListed: null,
    },
    formSubmission: mapFormSubmission("buyer", input, { ...input, formType: "buyer" }),
    message: emptyToNull(input.message),
  };
}
