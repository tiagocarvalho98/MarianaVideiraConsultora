export const crmSectionAccents = {
  acquisition: {
    panel: "border-[#d6ae78]/30 bg-[#d6ae78]/[0.055]",
    bar: "bg-[#d6ae78]",
    text: "text-[#f0d2a6]",
  },
  operation: {
    panel: "border-[#6f91a8]/35 bg-[#6f91a8]/[0.07]",
    bar: "bg-[#8eb1c4]",
    text: "text-[#bcd4df]",
  },
  attention: {
    panel: "border-[#7a1b22]/45 bg-[#7a1b22]/[0.11]",
    bar: "bg-[#9b2831]",
    text: "text-[#f0b3b8]",
  },
  progress: {
    panel: "border-[#7c8f68]/40 bg-[#7c8f68]/[0.08]",
    bar: "bg-[#9dad85]",
    text: "text-[#d5dfc7]",
  },
};

const pipelineStageAccentMap: Record<string, { panel: string; bar: string; text: string }> = {
  nova_lead: crmSectionAccents.acquisition,
  por_contactar: crmSectionAccents.attention,
  contactado: crmSectionAccents.operation,
  qualificado: crmSectionAccents.progress,
  financiamento: {
    panel: "border-[#9b7fc4]/35 bg-[#9b7fc4]/[0.075]",
    bar: "bg-[#b49bd4]",
    text: "text-[#d8c8ec]",
  },
  procura_ativa: {
    panel: "border-[#4d9a8e]/35 bg-[#4d9a8e]/[0.075]",
    bar: "bg-[#74c4b6]",
    text: "text-[#bde4dd]",
  },
  visitas: {
    panel: "border-[#d6ae78]/38 bg-[#d6ae78]/[0.085]",
    bar: "bg-[#e2bf8a]",
    text: "text-[#efd3a8]",
  },
  interessado: {
    panel: "border-[#b45d2a]/40 bg-[#b45d2a]/[0.095]",
    bar: "bg-[#cf7a3e]",
    text: "text-[#f0c29f]",
  },
  avaliacao_reuniao: {
    panel: "border-[#6f91a8]/38 bg-[#6f91a8]/[0.075]",
    bar: "bg-[#8eb1c4]",
    text: "text-[#bcd4df]",
  },
  angariacao_em_negociacao: {
    panel: "border-[#b45d2a]/40 bg-[#b45d2a]/[0.09]",
    bar: "bg-[#cf7a3e]",
    text: "text-[#f0c29f]",
  },
  angariado: {
    panel: "border-[#7c8f68]/42 bg-[#7c8f68]/[0.085]",
    bar: "bg-[#9dad85]",
    text: "text-[#d5dfc7]",
  },
  em_comercializacao: {
    panel: "border-[#4d9a8e]/35 bg-[#4d9a8e]/[0.075]",
    bar: "bg-[#74c4b6]",
    text: "text-[#bde4dd]",
  },
  proposta: {
    panel: "border-[#d6ae78]/42 bg-[#d6ae78]/[0.09]",
    bar: "bg-[#e2bf8a]",
    text: "text-[#efd3a8]",
  },
  cpcv: {
    panel: "border-[#9b7fc4]/38 bg-[#9b7fc4]/[0.085]",
    bar: "bg-[#b49bd4]",
    text: "text-[#d8c8ec]",
  },
  escritura: {
    panel: "border-[#7c8f68]/45 bg-[#7c8f68]/[0.095]",
    bar: "bg-[#b5c498]",
    text: "text-[#e1ebd4]",
  },
  perdido: crmSectionAccents.attention,
};

export function pipelineStageAccent(stageId: string) {
  return pipelineStageAccentMap[stageId] ?? crmSectionAccents.operation;
}
