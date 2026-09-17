export type AppRole = "admin" | "consultor";
export type OpportunityType = "buyer" | "seller";
export type OpportunityStatus = "new" | "open" | "won" | "lost" | "archived";
export type LeadTemperature = "fria" | "morna" | "quente";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type ActivityType =
  | "form_submission"
  | "stage_changed"
  | "call"
  | "meeting"
  | "note"
  | "task_created"
  | "task_completed"
  | "lost";

export type Profile = {
  id: string;
  fullName: string;
  role: AppRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  phoneNormalized: string;
  email: string | null;
  emailNormalized: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  contactId: string;
  type: OpportunityType;
  status: OpportunityStatus;
  stage: string;
  temperature: LeadTemperature;
  createdBy: string | null;
  assignedTo: string | null;
  sourceId: string | null;
  location: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  propertyType: string | null;
  typology: string | null;
  timeframe: string | null;
  financingStatus: string | null;
  currentPropertyToSell: boolean | null;
  propertyAlreadyListed: boolean | null;
  nextActionAt: string | null;
  firstContactAt: string | null;
  lastActivityAt: string | null;
  lostReason: string | null;
  lostNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  opportunityId: string;
  userId: string | null;
  type: ActivityType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
};

export type Task = {
  id: string;
  opportunityId: string;
  assignedTo: string | null;
  title: string;
  dueAt: string;
  completedAt: string | null;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
};

export type PipelineStage = {
  id: string;
  label: string;
};

export type LostReason = {
  id: string;
  label: string;
};

export type LeadSource = {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
};

export type FormSubmission = {
  id: string;
  contactId: string | null;
  opportunityId: string | null;
  formType: OpportunityType;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  landingPage: string | null;
  userAgent: string | null;
  privacyConsent: boolean;
  marketingConsent: boolean;
  rawPayload: Record<string, unknown>;
  createdAt: string;
};

export type OpportunityWithRelations = Opportunity & {
  contact: Contact;
  assignedProfile: Profile | null;
  createdByProfile: Profile | null;
  source: LeadSource | null;
  nextTask: Task | null;
  activities: Activity[];
};

export type TodayQueueGroupId =
  | "newUncontacted"
  | "overdue"
  | "todayActions"
  | "todayMeetings"
  | "missingNextAction"
  | "unassigned"
  | "stale";

export type TodayPriorityGroup = {
  id:
    | TodayQueueGroupId
    | "new_uncontacted"
    | "overdue_followups"
    | "actions_today"
    | "meetings_today"
    | "qualified_without_next_action"
    | "without_owner"
    | "stale_opportunities";
  title: string;
  description: string;
  opportunities: OpportunityWithRelations[];
};

export type TodayQueueGroup = Omit<TodayPriorityGroup, "id"> & {
  id: TodayQueueGroupId;
};

export type DashboardMetrics = {
  newLeads: number;
  openOpportunities: number;
  leadsThisWeek: number;
  sellers: number;
  buyers: number;
  qualified: number;
  lost: number;
  overdueFollowUps: number;
  todayActions: number;
  bySource: Array<{ source: string; count: number }>;
  byStage: Array<{ stage: string; count: number }>;
};
