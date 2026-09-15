import type { LeadSource } from "@/types/crm";
import { daysAgo } from "./date";

export const mockLeadSources: LeadSource[] = [
  { id: "30000000-0000-4000-8000-000000000001", name: "Meta Ads", category: "paid_social", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000002", name: "Google Ads", category: "paid_search", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000003", name: "Instagram", category: "social", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000004", name: "Referencia", category: "referral", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000005", name: "Organico", category: "organic", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000006", name: "Contacto direto", category: "direct", createdAt: daysAgo(30) },
];
