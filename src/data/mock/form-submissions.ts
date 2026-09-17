import type { FormSubmission } from "@/types/crm";
import { mockOpportunities } from "./opportunities";

const campaigns = [
  "Avaliacao Montijo Setembro",
  "Vender Casa Alcochete",
  "Comprar T3 Montijo",
  "Mudanca Margem Sul",
  "Proprietarios Palmela",
  "Pesquisa Local Setubal",
] as const;

const mediums = ["cpc", "paid_social", "organic", "referral", "direct"] as const;

export const mockFormSubmissions: FormSubmission[] = mockOpportunities.map(
  (opportunity, index) => ({
    id: `70000000-0000-4000-8000-000000000${String(index + 1).padStart(3, "0")}`,
    contactId: opportunity.contactId,
    opportunityId: opportunity.id,
    formType: opportunity.type,
    utmSource:
      index % 6 === 0
        ? "meta"
        : index % 6 === 1
          ? "google"
          : index % 6 === 2
            ? "instagram"
            : index % 6 === 3
              ? "referencia"
              : index % 6 === 4
                ? "organico"
                : "direto",
    utmMedium: mediums[index % mediums.length],
    utmCampaign: campaigns[index % campaigns.length],
    utmContent: index % 2 === 0 ? "hero_cta" : "form_section",
    utmTerm: opportunity.type === "buyer" ? "comprar casa montijo" : "vender casa montijo",
    gclid: index % 5 === 0 ? `mock-gclid-${index}` : null,
    fbclid: index % 4 === 0 ? `mock-fbclid-${index}` : null,
    referrer: index % 3 === 0 ? "https://instagram.com/" : "https://google.com/",
    landingPage: opportunity.type === "buyer" ? "/comprar" : "/vender",
    userAgent: "MockBrowser/1.0 Development",
    privacyConsent: true,
    marketingConsent: index % 3 === 0,
    rawPayload: {
      formType: opportunity.type,
      location: opportunity.location,
      propertyType: opportunity.propertyType,
      typology: opportunity.typology,
      timeframe: opportunity.timeframe,
    },
    createdAt: opportunity.createdAt,
  }),
);
