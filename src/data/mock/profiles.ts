import type { Profile } from "@/types/crm";
import { daysAgo } from "./date";

export const mockProfiles: Profile[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    fullName: "Mariana [Apelido]",
    role: "consultor",
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    fullName: "Tiago",
    role: "admin",
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
];
