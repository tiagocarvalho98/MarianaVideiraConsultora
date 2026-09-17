import type {
  BuyerLeadInput,
  LeadIntakeResult,
  SellerLeadInput,
} from "./intake";
import type { ManualOpportunityInput, ManualOpportunityResult } from "./manual-opportunity";

import type {
  Activity,
  Contact,
  DashboardMetrics,
  FormSubmission,
  LeadSource,
  LeadTemperature,
  OpportunityType,
  OpportunityWithRelations,
  Profile,
  Task,
  TaskPriority,
  TodayQueueGroup,
  TodayPriorityGroup,
} from "@/types/crm";

export type CrmDataset = {
  profiles: Profile[];
  contacts: Contact[];
  leadSources: LeadSource[];
  opportunities: OpportunityWithRelations[];
  activities: Activity[];
  tasks: Task[];
  formSubmissions: FormSubmission[];
};

export type OpportunityFilters = {
  type?: OpportunityType;
  query?: string;
  status?: OpportunityWithRelations["status"];
  assignedTo?: string | null;
  temperature?: LeadTemperature;
  sourceId?: string;
};

export type TaskFilters = {
  opportunityId?: string;
  assignedTo?: string | null;
  completed?: boolean;
};

export type CreateTaskInput = {
  opportunityId: string;
  assignedTo: string | null;
  title: string;
  dueAt: string;
  priority?: TaskPriority;
};

export type AddActivityInput = {
  opportunityId: string;
  userId?: string | null;
  type: Activity["type"];
  title: string;
  body?: string | null;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

export type CrmRepository = {
  getCurrentUser(): Promise<Profile | null>;
  getCurrentProfile(): Promise<Profile | null>;
  getProfiles(): Promise<Profile[]>;
  listProfiles(): Promise<Profile[]>;
  getContacts(): Promise<Contact[]>;
  listContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | null>;
  getOpportunities(filters?: OpportunityFilters): Promise<OpportunityWithRelations[]>;
  listOpportunities(filters?: OpportunityFilters): Promise<OpportunityWithRelations[]>;
  getOpportunity(id: string): Promise<OpportunityWithRelations | null>;
  getTodayQueue(): Promise<TodayQueueGroup[]>;
  getTodayPriorityGroups(): Promise<TodayPriorityGroup[]>;
  submitSellerLead(input: SellerLeadInput): Promise<LeadIntakeResult>;
  submitBuyerLead(input: BuyerLeadInput): Promise<LeadIntakeResult>;
  createManualOpportunity(input: ManualOpportunityInput): Promise<ManualOpportunityResult>;
  getActivities(opportunityId: string): Promise<Activity[]>;
  getTasks(filters?: TaskFilters): Promise<Task[]>;
  getLeadSources(): Promise<LeadSource[]>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  updateOpportunityStage(
    opportunityId: string,
    newStage: string,
    userId?: string | null,
  ): Promise<OpportunityWithRelations>;
  assignOpportunity(
    opportunityId: string,
    profileId: string | null,
  ): Promise<OpportunityWithRelations>;
  setOpportunityTemperature(
    opportunityId: string,
    temperature: LeadTemperature,
  ): Promise<OpportunityWithRelations>;
  createTask(input: CreateTaskInput): Promise<Task>;
  completeTask(taskId: string, userId?: string | null): Promise<Task>;
  addActivity(input: AddActivityInput): Promise<Activity>;
  markOpportunityLost(
    opportunityId: string,
    reason: string,
    notes?: string | null,
    userId?: string | null,
  ): Promise<OpportunityWithRelations>;
  getDataset(): Promise<CrmDataset>;
};

export function sortByDateAsc<T>(
  records: T[],
  getDate: (record: T) => string | null,
) {
  return [...records].sort((a, b) => {
    const aDate = getDate(a);
    const bDate = getDate(b);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
}
