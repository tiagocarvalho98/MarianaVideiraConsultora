import { describe, expect, it } from "vitest";
import {
  mapBuyerLeadFormToIntake,
  mapSellerLeadFormToIntake,
  normalizeEmail,
  normalizePhone,
} from "./intake";

const sellerLead = {
  name: "Ana Ribeiro",
  phone: "+351 912 345 101",
  email: "ANA@EXAMPLE.TEST ",
  propertyLocation: "Montijo",
  propertyType: "Apartamento",
  currentSituation: "Quero perceber valor",
  sellingTimeframe: "1 a 3 meses",
  alreadyListed: "Nao",
  message: "Gostava de vender com acompanhamento.",
  privacyConsent: true,
  utmSource: "meta",
  utmCampaign: "avaliacao",
  landingPage: "/vender",
  userAgent: "MockBrowser/1.0",
} as const;

const buyerLead = {
  name: "Miguel Santos",
  phone: "913 220 104",
  email: "",
  desiredZones: "Montijo, Alcochete",
  typology: "T3",
  budget: "250.000 EUR a 350.000 EUR",
  financingStatus: "Pre-aprovado",
  buyingTimeframe: "3 a 6 meses",
  hasPropertyToSell: "Sim",
  message: "",
  privacyConsent: true,
  gclid: "mock-gclid",
  referrer: "https://google.com/",
  landingPage: "/comprar",
} as const;

describe("public lead intake mapping", () => {
  it("normalizes phone values", () => {
    expect(normalizePhone("+351 912 345 101")).toBe("+351912345101");
    expect(normalizePhone("00351 912 345 101")).toBe("+351912345101");
    expect(normalizePhone("912 345 101")).toBe("+351912345101");
  });

  it("normalizes email values", () => {
    expect(normalizeEmail(" ANA@Example.Test ")).toBe("ana@example.test");
    expect(normalizeEmail(" ")).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
  });

  it("maps SellerLeadForm data to intake/domain and preserves raw_payload", () => {
    const mapped = mapSellerLeadFormToIntake(sellerLead);

    expect(mapped.contact.firstName).toBe("Ana");
    expect(mapped.contact.lastName).toBe("Ribeiro");
    expect(mapped.contact.emailNormalized).toBe("ana@example.test");
    expect(mapped.opportunity.type).toBe("seller");
    expect(mapped.opportunity.status).toBe("new");
    expect(mapped.opportunity.stage).toBe("nova_lead");
    expect(mapped.opportunity.temperature).toBe("morna");
    expect(mapped.opportunity.createdBy).toBeNull();
    expect(mapped.opportunity.assignedTo).toBeNull();
    expect(mapped.opportunity.propertyAlreadyListed).toBe(false);
    expect(mapped.formSubmission.userAgent).toBe("MockBrowser/1.0");
    expect(mapped.formSubmission.rawPayload).toMatchObject({
      formType: "seller",
      currentSituation: "Quero perceber valor",
      message: "Gostava de vender com acompanhamento.",
    });
  });

  it("maps BuyerLeadForm data to intake/domain and preserves raw_payload", () => {
    const mapped = mapBuyerLeadFormToIntake(buyerLead);

    expect(mapped.contact.phoneNormalized).toBe("+351913220104");
    expect(mapped.contact.email).toBeNull();
    expect(mapped.opportunity.type).toBe("buyer");
    expect(mapped.opportunity.location).toBe("Montijo, Alcochete");
    expect(mapped.opportunity.propertyType).toBeNull();
    expect(mapped.opportunity.typology).toBe("T3");
    expect(mapped.opportunity.budgetMin).toBe(250000);
    expect(mapped.opportunity.budgetMax).toBe(350000);
    expect(mapped.opportunity.currentPropertyToSell).toBe(true);
    expect(mapped.opportunity.firstContactAt).toBeNull();
    expect(mapped.opportunity.nextActionAt).toBeNull();
    expect(mapped.formSubmission.rawPayload).toMatchObject({
      formType: "buyer",
      desiredZones: "Montijo, Alcochete",
      budget: "250.000 EUR a 350.000 EUR",
    });
  });
});
