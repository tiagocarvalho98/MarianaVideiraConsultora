import { formatContactName } from "./format";
import type { Contact, OpportunityWithRelations } from "@/types/crm";

export type ContactWithOpportunitySummary = Contact & {
  opportunities: OpportunityWithRelations[];
  latestOpportunity: OpportunityWithRelations | null;
};

export function buildContactSummaries(
  contacts: Contact[],
  opportunities: OpportunityWithRelations[],
): ContactWithOpportunitySummary[] {
  return contacts.map((contact) => {
    const contactOpportunities = opportunities
      .filter((opportunity) => opportunity.contactId === contact.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      ...contact,
      opportunities: contactOpportunities,
      latestOpportunity: contactOpportunities[0] ?? null,
    };
  });
}

export function searchContactSummaries(
  contacts: ContactWithOpportunitySummary[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return contacts;
  }

  return contacts.filter((contact) =>
    [
      formatContactName(contact.firstName, contact.lastName),
      contact.phone,
      contact.email ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
