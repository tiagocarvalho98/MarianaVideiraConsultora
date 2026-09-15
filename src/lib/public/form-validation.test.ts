import { describe, expect, it } from "vitest";
import { brand, publicNavItems } from "@/config/brand";
import { buyerFormSchema, sellerFormSchema } from "./form-validation";

describe("public form validation", () => {
  it("validates required seller fields", () => {
    const result = sellerFormSchema.safeParse({
      name: "Ana Ribeiro",
      phone: "+351 912 345 101",
      email: "",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "Quero perceber valor e estrategia",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      message: "",
      privacyConsent: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects seller submissions without privacy consent", () => {
    const result = sellerFormSchema.safeParse({
      name: "Ana Ribeiro",
      phone: "+351 912 345 101",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "Quero perceber valor e estrategia",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      privacyConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown seller fields at the server boundary", () => {
    const result = sellerFormSchema.safeParse({
      name: "Ana Ribeiro",
      phone: "+351 912 345 101",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "Quero perceber valor e estrategia",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      privacyConsent: true,
      unexpectedAdminField: "admin",
    });

    expect(result.success).toBe(false);
  });

  it("validates required buyer fields", () => {
    const result = buyerFormSchema.safeParse({
      name: "Miguel Santos",
      phone: "+351 913 220 104",
      email: "",
      desiredZones: "Montijo, Alcochete",
      typology: "T3",
      budget: "250.000 EUR a 350.000 EUR",
      financingStatus: "Pre-aprovado",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects buyer payloads with oversized message content", () => {
    const result = buyerFormSchema.safeParse({
      name: "Miguel Santos",
      phone: "+351 913 220 104",
      email: "",
      desiredZones: "Montijo, Alcochete",
      typology: "T3",
      budget: "250.000 EUR a 350.000 EUR",
      financingStatus: "Pre-aprovado",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "x".repeat(2001),
      privacyConsent: true,
    });

    expect(result.success).toBe(false);
  });

  it("does not accept implicit marketing consent in buyer payloads", () => {
    const result = buyerFormSchema.safeParse({
      name: "Miguel Santos",
      phone: "+351 913 220 104",
      email: "",
      desiredZones: "Montijo, Alcochete",
      typology: "T3",
      budget: "250.000 EUR a 350.000 EUR",
      financingStatus: "Pre-aprovado",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
      marketingConsent: true,
    });

    expect(result.success).toBe(false);
  });

  it("keeps brand config centralized with placeholder contacts", () => {
    expect(brand.fullName).toBe("Mariana Videira");
    expect(brand.tagline).toBe("Confie o que mais valoriza a quem sabe cuidar.");
    expect(brand.phone).toContain("por confirmar");
    expect(brand.email).toContain("por confirmar");
  });

  it("defines the public navigation links", () => {
    expect(publicNavItems.map((item) => item.href)).toEqual([
      "/",
      "/vender",
      "/comprar",
      "/sobre",
      "/contacto",
    ]);
  });
});
