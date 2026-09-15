import type { LeadTemperature, Opportunity } from "@/types/crm";
import {
  daysAgo,
  daysFromNow,
  hoursAgo,
  laterToday,
  minutesAgo,
  tomorrowAt,
  yesterdayAt,
} from "./date";

const marianaId = "10000000-0000-4000-8000-000000000001";
const tiagoId = "10000000-0000-4000-8000-000000000002";
const zones = ["Montijo", "Alcochete", "Setubal", "Palmela", "Barreiro", "Moita"];
const propertyTypes = ["T1", "T2", "T3", "Moradia", "Apartamento T3", "Terreno"];

type OpportunitySpec = {
  contactId?: string;
  type: "buyer" | "seller";
  status?: Opportunity["status"];
  stage: string;
  temperature: LeadTemperature;
  assignedTo?: string | null;
  sourceId: string;
  createdAt: string;
  firstContactAt?: string | null;
  lastActivityAt: string | null;
  nextActionAt?: string | null;
  lostReason?: string | null;
  lostNotes?: string | null;
};

const specs: OpportunitySpec[] = [
  { type: "seller", status: "new", stage: "nova_lead", temperature: "quente", assignedTo: null, sourceId: "30000000-0000-4000-8000-000000000001", createdAt: minutesAgo(15), firstContactAt: null, lastActivityAt: minutesAgo(15), nextActionAt: null },
  { type: "buyer", status: "new", stage: "nova_lead", temperature: "morna", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: hoursAgo(5), firstContactAt: null, lastActivityAt: hoursAgo(5), nextActionAt: null },
  { type: "buyer", stage: "por_contactar", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000005", createdAt: hoursAgo(3), firstContactAt: null, lastActivityAt: hoursAgo(3), nextActionAt: laterToday(60) },
  { type: "buyer", stage: "qualificado", temperature: "morna", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(4), firstContactAt: daysAgo(3), lastActivityAt: yesterdayAt(11, 20), nextActionAt: yesterdayAt(16, 0) },
  { type: "seller", stage: "avaliacao_reuniao", temperature: "quente", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000004", createdAt: daysAgo(6), firstContactAt: daysAgo(5), lastActivityAt: yesterdayAt(17, 10), nextActionAt: laterToday(120) },
  { type: "seller", stage: "qualificado", temperature: "morna", assignedTo: null, sourceId: "30000000-0000-4000-8000-000000000001", createdAt: daysAgo(10), firstContactAt: daysAgo(9), lastActivityAt: daysAgo(8), nextActionAt: null },
  { type: "buyer", stage: "procura_ativa", temperature: "quente", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(13), firstContactAt: daysAgo(12), lastActivityAt: daysAgo(2), nextActionAt: tomorrowAt(10, 30) },
  { type: "buyer", stage: "visitas", temperature: "quente", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: daysAgo(11), firstContactAt: daysAgo(10), lastActivityAt: daysAgo(1), nextActionAt: daysFromNow(3) },
  { type: "buyer", stage: "proposta", temperature: "quente", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000004", createdAt: daysAgo(21), firstContactAt: daysAgo(20), lastActivityAt: hoursAgo(20), nextActionAt: tomorrowAt(9, 30) },
  { type: "buyer", stage: "cpcv", temperature: "quente", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000006", createdAt: daysAgo(24), firstContactAt: daysAgo(23), lastActivityAt: daysAgo(2), nextActionAt: daysFromNow(5) },
  { type: "seller", stage: "angariacao_em_negociacao", temperature: "morna", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000001", createdAt: daysAgo(8), firstContactAt: daysAgo(7), lastActivityAt: daysAgo(2), nextActionAt: laterToday(90) },
  { type: "seller", stage: "angariado", temperature: "quente", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000005", createdAt: daysAgo(17), firstContactAt: daysAgo(16), lastActivityAt: daysAgo(9), nextActionAt: daysFromNow(2) },
  { type: "seller", stage: "em_comercializacao", temperature: "morna", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(18), firstContactAt: daysAgo(17), lastActivityAt: daysAgo(11), nextActionAt: null },
  { type: "seller", stage: "proposta", temperature: "quente", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: daysAgo(22), firstContactAt: daysAgo(21), lastActivityAt: hoursAgo(8), nextActionAt: laterToday(150) },
  { type: "seller", stage: "cpcv", temperature: "quente", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000004", createdAt: daysAgo(28), firstContactAt: daysAgo(27), lastActivityAt: daysAgo(3), nextActionAt: daysFromNow(6) },
  { type: "buyer", status: "won", stage: "escritura", temperature: "quente", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(35), firstContactAt: daysAgo(34), lastActivityAt: daysAgo(1), nextActionAt: null },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000006", createdAt: daysAgo(19), firstContactAt: daysAgo(18), lastActivityAt: daysAgo(5), lostReason: "comissao", lostNotes: "Cliente preferiu proposta com comissao inferior." },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000005", createdAt: daysAgo(16), firstContactAt: daysAgo(15), lastActivityAt: daysAgo(6), lostReason: "orcamento_incompativel", lostNotes: "Orcamento abaixo dos valores atuais da zona." },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000001", createdAt: daysAgo(14), firstContactAt: daysAgo(13), lastActivityAt: daysAgo(7), lostReason: "deixou_de_procurar" },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(15), firstContactAt: daysAgo(14), lastActivityAt: daysAgo(8), lostReason: "financiamento" },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: daysAgo(12), firstContactAt: daysAgo(11), lastActivityAt: daysAgo(9), lostReason: "comprou_com_outro_consultor" },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000004", createdAt: daysAgo(18), firstContactAt: daysAgo(17), lastActivityAt: daysAgo(10), lostReason: "sem_resposta" },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000005", createdAt: daysAgo(20), firstContactAt: daysAgo(19), lastActivityAt: daysAgo(11), lostReason: "prazo_futuro" },
  { type: "buyer", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000006", createdAt: daysAgo(21), firstContactAt: daysAgo(20), lastActivityAt: daysAgo(12), lostReason: "outro" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000001", createdAt: daysAgo(13), firstContactAt: daysAgo(12), lastActivityAt: daysAgo(8), lostReason: "escolheu_outro_consultor" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000002", createdAt: daysAgo(14), firstContactAt: daysAgo(13), lastActivityAt: daysAgo(9), lostReason: "preco" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: daysAgo(15), firstContactAt: daysAgo(14), lastActivityAt: daysAgo(10), lostReason: "desistiu_de_vender" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000004", createdAt: daysAgo(16), firstContactAt: daysAgo(15), lastActivityAt: daysAgo(11), lostReason: "vendeu_diretamente" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: marianaId, sourceId: "30000000-0000-4000-8000-000000000005", createdAt: daysAgo(17), firstContactAt: daysAgo(16), lastActivityAt: daysAgo(12), lostReason: "sem_resposta" },
  { type: "seller", status: "lost", stage: "perdido", temperature: "fria", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000006", createdAt: daysAgo(18), firstContactAt: daysAgo(17), lastActivityAt: daysAgo(13), lostReason: "outro" },
  { contactId: "20000000-0000-4000-8000-000000000001", type: "buyer", stage: "procura_ativa", temperature: "morna", assignedTo: tiagoId, sourceId: "30000000-0000-4000-8000-000000000003", createdAt: daysAgo(2), firstContactAt: daysAgo(1), lastActivityAt: hoursAgo(8), nextActionAt: tomorrowAt(11, 0) },
];

export const mockOpportunities: Opportunity[] = specs.map((spec, index) => {
  const isBuyer = spec.type === "buyer";

  return {
    id: `40000000-0000-4000-8000-000000000${String(index + 1).padStart(3, "0")}`,
    contactId:
      spec.contactId ??
      `20000000-0000-4000-8000-000000000${String(index + 1).padStart(3, "0")}`,
    type: spec.type,
    status: spec.status ?? "open",
    stage: spec.stage,
    temperature: spec.temperature,
    createdBy: index % 3 === 0 ? spec.assignedTo ?? null : null,
    assignedTo: spec.assignedTo ?? null,
    sourceId: spec.sourceId,
    location: zones[index % zones.length],
    budgetMin: isBuyer ? 170000 + index * 7000 : null,
    budgetMax: isBuyer ? 230000 + index * 9000 : null,
    propertyType: propertyTypes[index % propertyTypes.length],
    timeframe: index % 4 === 0 ? "Imediato" : index % 4 === 1 ? "1 a 3 meses" : index % 4 === 2 ? "3 a 6 meses" : "6 a 12 meses",
    financingStatus: isBuyer ? (index % 3 === 0 ? "aprovado" : index % 3 === 1 ? "pre_aprovado" : "ainda_nao_tratado") : null,
    currentPropertyToSell: isBuyer ? index % 5 === 0 : null,
    propertyAlreadyListed: isBuyer ? null : index % 2 === 0,
    nextActionAt: spec.nextActionAt ?? null,
    firstContactAt: spec.firstContactAt ?? null,
    lastActivityAt: spec.lastActivityAt,
    lostReason: spec.lostReason ?? null,
    lostNotes: spec.lostNotes ?? null,
    createdAt: spec.createdAt,
    updatedAt: spec.lastActivityAt ?? spec.createdAt,
  };
});
