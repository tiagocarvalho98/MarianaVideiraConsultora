import type { OpportunityType } from "@/types/crm";

export function formatContactName(firstName: string, lastName: string | null) {
  return `${firstName} ${lastName ?? ""}`.trim();
}

export function formatOpportunityType(type: OpportunityType) {
  return type === "buyer" ? "Comprador" : "Vendedor";
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) {
    const minutes = Math.max(1, Math.round(absMs / minute));
    return diffMs < 0 ? `ha ${minutes} min` : `em ${minutes} min`;
  }

  if (absMs < day) {
    const hours = Math.max(1, Math.round(absMs / hour));
    return diffMs < 0 ? `ha ${hours} h` : `em ${hours} h`;
  }

  const days = Math.max(1, Math.round(absMs / day));
  return diffMs < 0 ? `ha ${days} dias` : `em ${days} dias`;
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStage(stage: string) {
  return stage
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatStatus(status: string) {
  const labels: Record<string, string> = {
    new: "Nova",
    open: "Aberta",
    won: "Ganha",
    lost: "Perdida",
    archived: "Arquivada",
  };

  return labels[status] ?? formatStage(status);
}
