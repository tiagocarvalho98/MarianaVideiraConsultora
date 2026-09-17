import type { LeadSource } from "@/types/crm";
import { daysAgo } from "./date";

export const mockLeadSources: LeadSource[] = [
  { id: "30000000-0000-4000-8000-000000000001", name: "Meta Ads", category: "paid_social", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000002", name: "Google Ads", category: "paid_search", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000003", name: "Instagram", category: "social", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000004", name: "Referencia", category: "referral", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000005", name: "Organico", category: "organic", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000006", name: "Contacto direto", category: "direct", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000007", name: "Posicionamento", category: "offline", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000008", name: "Placa de rua", category: "offline", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000009", name: "Escala", category: "offline", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000010", name: "CIPS", category: "networking", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000011", name: "Open-House", category: "event", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000012", name: "FISGOS", category: "networking", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000013", name: "Idealista", category: "portal", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000014", name: "FSBO", category: "offline", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000015", name: "Imovirtual", category: "portal", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000016", name: "CasaYes", category: "portal", createdAt: daysAgo(30) },
  { id: "30000000-0000-4000-8000-000000000017", name: "OLX", category: "portal", createdAt: daysAgo(30) },
];
