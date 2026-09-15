import type { Contact } from "@/types/crm";
import { daysAgo, hoursAgo, minutesAgo } from "./date";

const names = [
  ["Ana", "Ribeiro"],
  ["Miguel", "Santos"],
  ["Carla", "Mendes"],
  ["Joao", "Ferreira"],
  ["Patricia", "Costa"],
  ["Ricardo", "Almeida"],
  ["Sofia", "Martins"],
  ["Helena", "Rocha"],
  ["Rui", "Nunes"],
  ["Marta", "Silva"],
  ["Tiago", "Pereira"],
  ["Ines", "Barbosa"],
  ["Paulo", "Correia"],
  ["Filipa", "Moreira"],
  ["Daniel", "Neves"],
  ["Beatriz", "Lopes"],
  ["Luis", "Cardoso"],
  ["Teresa", "Gomes"],
  ["Andre", "Teixeira"],
  ["Claudia", "Faria"],
  ["Nuno", "Monteiro"],
  ["Raquel", "Dias"],
  ["Vitor", "Machado"],
  ["Sara", "Antunes"],
  ["Bruno", "Esteves"],
  ["Liliana", "Marques"],
  ["Pedro", "Ramos"],
  ["Catarina", "Leal"],
  ["Hugo", "Batista"],
  ["Diana", "Azevedo"],
] as const;

function contactDate(index: number) {
  if (index === 0) return minutesAgo(15);
  if (index === 1) return hoursAgo(3);
  return daysAgo((index % 18) + 1);
}

export const mockContacts: Contact[] = names.map(([firstName, lastName], index) => {
  const suffix = String(index + 101).padStart(3, "0");
  const createdAt = contactDate(index);
  const email = index === 2 || index === 11 ? null : `${firstName}.${lastName}@example.test`.toLowerCase();

  return {
    id: `20000000-0000-4000-8000-000000000${String(index + 1).padStart(3, "0")}`,
    firstName,
    lastName,
    phone: `+351 91${index % 8} 345 ${suffix}`,
    phoneNormalized: `+35191${index % 8}345${suffix}`,
    email,
    emailNormalized: email,
    createdAt,
    updatedAt: createdAt,
  };
});
