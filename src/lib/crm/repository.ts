import type {
  BuyerLeadInput,
  LeadIntakeResult,
  SellerLeadInput,
} from "./intake";
import type { ManualOpportunityInput, ManualOpportunityResult } from "./manual-opportunity";

import type {
  Activity,
  Contact,
  CrmNote,
  CrmNoteCategory,
  DashboardMetrics,
  FormSubmission,
  LeadSource,
  LeadTemperature,
  OpportunityType,
  OpportunityWithRelations,
  Profile,
  Task,
  TaskPriority,
  NoteTeam,
  NoteTeamMember,
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

export type UpdateContactInput = {
  contactId: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
};

export type UpdateTaskInput = {
  taskId: string;
  assignedTo: string | null;
  title: string;
  dueAt: string;
  priority?: TaskPriority;
  userId?: string | null;
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

export type CrmNoteFilters = {
  opportunityId?: string;
  contactId?: string;
  ownerId?: string;
  teamId?: string;
  category?: CrmNoteCategory;
  includeArchived?: boolean;
};

export type CreateCrmNoteInput = {
  ownerId: string;
  opportunityId?: string | null;
  contactId?: string | null;
  title?: string | null;
  body: string;
  category: CrmNoteCategory;
  teamIds?: string[];
};

export type UpdateCrmNoteInput = {
  noteId: string;
  title?: string | null;
  body: string;
  category: CrmNoteCategory;
  archivedAt?: string | null;
  teamIds?: string[];
};

export type CreateNoteTeamInput = {
  name: string;
  createdBy: string;
  memberIds: string[];
};

export type CrmRepository = {
  getCurrentUser(): Promise<Profile | null>;
  getCurrentProfile(): Promise<Profile | null>;
  getProfiles(): Promise<Profile[]>;
  listProfiles(): Promise<Profile[]>;
  getContacts(): Promise<Contact[]>;
  listContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | null>;
  updateContact(input: UpdateContactInput): Promise<Contact>;
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
  updateTask(input: UpdateTaskInput): Promise<Task>;
  completeTask(taskId: string, userId?: string | null): Promise<Task>;
  addActivity(input: AddActivityInput): Promise<Activity>;
  getCrmNotes(filters?: CrmNoteFilters): Promise<CrmNote[]>;
  createCrmNote(input: CreateCrmNoteInput): Promise<CrmNote>;
  updateCrmNote(input: UpdateCrmNoteInput): Promise<CrmNote>;
  getNoteTeams(): Promise<NoteTeam[]>;
  getNoteTeamMembers(): Promise<NoteTeamMember[]>;
  createNoteTeam(input: CreateNoteTeamInput): Promise<NoteTeam>;
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
