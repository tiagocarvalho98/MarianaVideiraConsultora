import type { PipelineStage } from "@/types/crm";

export const buyerPipelineStages: PipelineStage[] = [
  { id: "nova_lead", label: "Nova lead" },
  { id: "por_contactar", label: "Por contactar" },
  { id: "contactado", label: "Contactado" },
  { id: "qualificado", label: "Qualificado" },
  { id: "financiamento", label: "Financiamento" },
  { id: "procura_ativa", label: "Procura ativa" },
  { id: "visitas", label: "Visitas" },
  { id: "interessado", label: "Interessado" },
  { id: "proposta", label: "Proposta" },
  { id: "cpcv", label: "CPCV" },
  { id: "escritura", label: "Escritura" },
  { id: "perdido", label: "Perdido" },
];

export const sellerPipelineStages: PipelineStage[] = [
  { id: "nova_lead", label: "Nova lead" },
  { id: "por_contactar", label: "Por contactar" },
  { id: "contactado", label: "Contactado" },
  { id: "qualificado", label: "Qualificado" },
  { id: "avaliacao_reuniao", label: "Avaliacao / reuniao" },
  { id: "angariacao_em_negociacao", label: "Angariacao em negociacao" },
  { id: "angariado", label: "Angariado" },
  { id: "em_comercializacao", label: "Em comercializacao" },
  { id: "proposta", label: "Proposta" },
  { id: "cpcv", label: "CPCV" },
  { id: "escritura", label: "Escritura" },
  { id: "perdido", label: "Perdido" },
];
