import type { CrmNoteCategory } from "@/types/crm";

export const noteCategories: Array<{
  id: CrmNoteCategory;
  label: string;
  description: string;
  className: string;
  columnClassName: string;
  dotClassName: string;
}> = [
  {
    id: "urgent",
    label: "Urgente",
    description: "Exige acao imediata.",
    className: "border-[#7a1b22]/50 bg-[#f8d8dc] text-[#401015]",
    columnClassName: "border-[#7a1b22]/45 bg-[#7a1b22]/[0.10]",
    dotClassName: "bg-[#c54650]",
  },
  {
    id: "hot",
    label: "Quente",
    description: "Contexto comercial forte.",
    className: "border-[#b45d2a]/50 bg-[#ffe0b8] text-[#4a260e]",
    columnClassName: "border-[#b45d2a]/45 bg-[#b45d2a]/[0.095]",
    dotClassName: "bg-[#df8547]",
  },
  {
    id: "warm",
    label: "Morno",
    description: "Importante, sem urgencia.",
    className: "border-[#d3ad6f]/50 bg-[#fff0bd] text-[#463508]",
    columnClassName: "border-[#d6ae78]/45 bg-[#d6ae78]/[0.085]",
    dotClassName: "bg-[#e2bf8a]",
  },
  {
    id: "cold",
    label: "Frio",
    description: "Referencia ou memoria futura.",
    className: "border-[#6e8e9f]/50 bg-[#dcecf0] text-[#102d38]",
    columnClassName: "border-[#6f91a8]/45 bg-[#6f91a8]/[0.085]",
    dotClassName: "bg-[#8eb1c4]",
  },
];

export function noteCategoryMeta(category: CrmNoteCategory) {
  return noteCategories.find((item) => item.id === category) ?? noteCategories[2];
}
