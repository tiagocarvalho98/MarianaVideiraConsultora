import type { CrmNoteCategory } from "@/types/crm";

export const noteCategories: Array<{
  id: CrmNoteCategory;
  label: string;
  description: string;
  className: string;
}> = [
  {
    id: "urgent",
    label: "Urgente",
    description: "Exige acao imediata.",
    className: "border-[#7a1b22]/50 bg-[#f8d8dc] text-[#401015]",
  },
  {
    id: "hot",
    label: "Quente",
    description: "Contexto comercial forte.",
    className: "border-[#b45d2a]/50 bg-[#ffe0b8] text-[#4a260e]",
  },
  {
    id: "warm",
    label: "Morno",
    description: "Importante, sem urgencia.",
    className: "border-[#d3ad6f]/50 bg-[#fff0bd] text-[#463508]",
  },
  {
    id: "cold",
    label: "Frio",
    description: "Referencia ou memoria futura.",
    className: "border-[#6e8e9f]/50 bg-[#dcecf0] text-[#102d38]",
  },
];

export function noteCategoryMeta(category: CrmNoteCategory) {
  return noteCategories.find((item) => item.id === category) ?? noteCategories[2];
}
