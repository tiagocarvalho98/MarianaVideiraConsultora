import type { LostReason } from "@/types/crm";

export const buyerLostReasons: LostReason[] = [
  { id: "deixou_de_procurar", label: "Deixou de procurar" },
  { id: "financiamento", label: "Financiamento" },
  { id: "comprou_com_outro_consultor", label: "Comprou com outro consultor" },
  { id: "orcamento_incompativel", label: "Orcamento incompativel" },
  { id: "sem_resposta", label: "Sem resposta" },
  { id: "prazo_futuro", label: "Prazo futuro" },
  { id: "outro", label: "Outro" },
];

export const sellerLostReasons: LostReason[] = [
  { id: "escolheu_outro_consultor", label: "Escolheu outro consultor" },
  { id: "comissao", label: "Comissao" },
  { id: "preco", label: "Preco" },
  { id: "desistiu_de_vender", label: "Desistiu de vender" },
  { id: "vendeu_diretamente", label: "Vendeu diretamente" },
  { id: "sem_resposta", label: "Sem resposta" },
  { id: "outro", label: "Outro" },
];
