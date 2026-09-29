export const dashboardMetricCards = [
  {
    key: "newLeads",
    label: "Leads novas",
    hint: "Entradas ainda no inicio do acompanhamento.",
    accent: "acquisition",
  },
  {
    key: "openOpportunities",
    label: "Abertas",
    hint: "Oportunidades comerciais ainda em curso.",
    accent: "operation",
  },
  {
    key: "leadsThisWeek",
    label: "Leads esta semana",
    hint: "Volume recente de captacao.",
    accent: "acquisition",
  },
  {
    key: "sellers",
    label: "Vendedores",
    hint: "Oportunidades de proprietarios ativas.",
    accent: "operation",
  },
  {
    key: "buyers",
    label: "Compradores",
    hint: "Procura ativa e qualificacao.",
    accent: "progress",
  },
  {
    key: "qualified",
    label: "Qualificadas",
    hint: "Com potencial validado e follow-up esperado.",
    accent: "progress",
  },
  {
    key: "lost",
    label: "Perdidas",
    hint: "Fechadas como perdidas com motivo estruturado.",
    accent: "attention",
  },
  {
    key: "overdueFollowUps",
    label: "Follow-ups vencidos",
    hint: "Acoes que ja passaram da data.",
    accent: "attention",
  },
  {
    key: "todayActions",
    label: "Acoes hoje",
    hint: "Tarefas e proximos contactos do dia.",
    accent: "operation",
  },
] as const;
