import { describe, expect, it } from "vitest";
import { buyerLostReasons, sellerLostReasons } from "@/data/lost-reasons";
import { buildContactSummaries, searchContactSummaries } from "./contact-search";
import { createMockCrmRepository } from "./mock-repository";

describe("mock CRM repository", () => {
  it("classifies the Today queue in priority order without duplicated opportunities", async () => {
    const repository = createMockCrmRepository();
    const groups = await repository.getTodayQueue();

    expect(groups.map((group) => group.id)).toEqual([
      "newUncontacted",
      "overdue",
      "todayActions",
      "todayMeetings",
      "missingNextAction",
      "unassigned",
      "stale",
    ]);

    expect(groups.find((group) => group.id === "newUncontacted")?.opportunities.length).toBeGreaterThan(0);
    expect(groups.find((group) => group.id === "overdue")?.opportunities.length).toBeGreaterThan(0);
    expect(groups.find((group) => group.id === "todayActions")?.opportunities.length).toBeGreaterThan(0);
    expect(groups.find((group) => group.id === "todayMeetings")?.opportunities.length).toBeGreaterThan(0);
    expect(groups.find((group) => group.id === "missingNextAction")?.opportunities.length).toBeGreaterThan(0);
    expect(groups.find((group) => group.id === "stale")?.opportunities.length).toBeGreaterThan(0);

    const shownOpportunityIds = groups.flatMap((group) =>
      group.opportunities.map((opportunity) => opportunity.id),
    );

    expect(new Set(shownOpportunityIds).size).toBe(shownOpportunityIds.length);
  });

  it("filters buyer and seller opportunities", async () => {
    const repository = createMockCrmRepository();
    const buyers = await repository.getOpportunities({ type: "buyer" });
    const sellers = await repository.getOpportunities({ type: "seller" });

    expect(buyers.length).toBeGreaterThan(0);
    expect(sellers.length).toBeGreaterThan(0);
    expect(buyers.every((opportunity) => opportunity.type === "buyer")).toBe(true);
    expect(sellers.every((opportunity) => opportunity.type === "seller")).toBe(true);
  });

  it("filters pipeline opportunities by assignee, temperature and source", async () => {
    const repository = createMockCrmRepository();
    const opportunities = await repository.getOpportunities({
      type: "buyer",
      assignedTo: "10000000-0000-4000-8000-000000000002",
      temperature: "quente",
      sourceId: "30000000-0000-4000-8000-000000000004",
    });

    expect(opportunities.length).toBeGreaterThan(0);
    expect(
      opportunities.every(
        (opportunity) =>
          opportunity.type === "buyer" &&
          opportunity.assignedTo === "10000000-0000-4000-8000-000000000002" &&
          opportunity.temperature === "quente" &&
          opportunity.sourceId === "30000000-0000-4000-8000-000000000004",
      ),
    ).toBe(true);
  });

  it("keeps all approved lost reasons represented in mock data", async () => {
    const repository = createMockCrmRepository();
    const opportunities = await repository.getOpportunities();
    const buyerReasons = new Set(
      opportunities
        .filter((opportunity) => opportunity.type === "buyer" && opportunity.status === "lost")
        .map((opportunity) => opportunity.lostReason),
    );
    const sellerReasons = new Set(
      opportunities
        .filter((opportunity) => opportunity.type === "seller" && opportunity.status === "lost")
        .map((opportunity) => opportunity.lostReason),
    );

    expect(buyerLostReasons.every((reason) => buyerReasons.has(reason.id))).toBe(true);
    expect(sellerLostReasons.every((reason) => sellerReasons.has(reason.id))).toBe(true);
  });

  it("records stage changes as activities with from/to metadata", async () => {
    const repository = createMockCrmRepository();
    const opportunityId = "40000000-0000-4000-8000-000000000003";

    await repository.updateOpportunityStage(opportunityId, "contactado");

    const activities = await repository.getActivities(opportunityId);
    const stageChange = activities.find(
      (activity) =>
        activity.type === "stage_changed" &&
        activity.metadata.from === "por_contactar" &&
        activity.metadata.to === "contactado",
    );

    expect(stageChange).toBeDefined();
  });

  it("does not allow generic stage transition to perdido", async () => {
    const repository = createMockCrmRepository();

    await expect(
      repository.updateOpportunityStage("40000000-0000-4000-8000-000000000003", "perdido"),
    ).rejects.toThrow("Use markOpportunityLost");
  });

  it("sets status won when stage moves to escritura and keeps won out of Today Queue", async () => {
    const repository = createMockCrmRepository();
    const updated = await repository.updateOpportunityStage(
      "40000000-0000-4000-8000-000000000001",
      "escritura",
    );

    expect(updated.status).toBe("won");

    const todayOpportunityIds = (await repository.getTodayQueue()).flatMap((group) =>
      group.opportunities.map((opportunity) => opportunity.id),
    );

    expect(todayOpportunityIds).not.toContain(updated.id);
  });

  it("marks an opportunity lost with validated structured reasons", async () => {
    const repository = createMockCrmRepository();
    const opportunityId = "40000000-0000-4000-8000-000000000003";

    await expect(
      repository.markOpportunityLost(opportunityId, "comissao"),
    ).rejects.toThrow("Invalid buyer lost reason");

    const updated = await repository.markOpportunityLost(
      opportunityId,
      "sem_resposta",
      "Nao respondeu aos ultimos contactos.",
    );

    expect(updated.status).toBe("lost");
    expect(updated.stage).toBe("perdido");
    expect(updated.lostReason).toBe("sem_resposta");
    expect(updated.nextActionAt).toBeNull();
  });

  it("creates and completes tasks in memory while recalculating next_action_at", async () => {
    const repository = createMockCrmRepository();
    const opportunityId = "40000000-0000-4000-8000-000000000001";
    const laterDueAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const earlierDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const task = await repository.createTask({
      opportunityId,
      assignedTo: "10000000-0000-4000-8000-000000000001",
      title: "Enviar resumo",
      dueAt: laterDueAt,
      priority: "normal",
    });
    const earlierTask = await repository.createTask({
      opportunityId,
      assignedTo: "10000000-0000-4000-8000-000000000001",
      title: "Ligar para nova lead",
      dueAt: earlierDueAt,
      priority: "urgent",
    });

    expect(task.completedAt).toBeNull();
    expect((await repository.getOpportunity(opportunityId))?.nextActionAt).toBe(earlierDueAt);

    const completed = await repository.completeTask(earlierTask.id);

    expect(completed.completedAt).not.toBeNull();
    expect((await repository.getOpportunity(opportunityId))?.nextActionAt).toBe(laterDueAt);

    await repository.completeTask(task.id);

    expect((await repository.getOpportunity(opportunityId))?.nextActionAt).toBeNull();
  });

  it("creates seller intake as Contact, Opportunity, FormSubmission and Activities", async () => {
    const repository = createMockCrmRepository();
    const result = await repository.submitSellerLead({
      name: "Laura Matos",
      phone: "912 000 999",
      email: "laura@example.test",
      propertyLocation: "Montijo",
      propertyType: "Apartamento T2",
      currentSituation: "Quero avaliar antes de decidir",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      message: "Prefiro contacto de manha.",
      privacyConsent: true,
      utmSource: "meta",
      fbclid: "mock-fbclid",
      landingPage: "/vender",
      userAgent: "MockBrowser/1.0",
    });

    expect(result.contact.phoneNormalized).toBe("+351912000999");
    expect(result.opportunity.contactId).toBe(result.contact.id);
    expect(result.opportunity.type).toBe("seller");
    expect(result.opportunity.status).toBe("new");
    expect(result.opportunity.stage).toBe("nova_lead");
    expect(result.opportunity.temperature).toBe("morna");
    expect(result.opportunity.createdBy).toBeNull();
    expect(result.opportunity.assignedTo).toBeNull();
    expect(result.opportunity.firstContactAt).toBeNull();
    expect(result.opportunity.nextActionAt).toBeNull();
    expect(result.formSubmission.rawPayload).toMatchObject({ formType: "seller" });

    const activities = await repository.getActivities(result.opportunity.id);
    expect(activities.some((activity) => activity.type === "form_submission")).toBe(true);
    expect(activities.some((activity) => activity.type === "note")).toBe(true);
  });

  it("creates buyer intake and places the new uncontacted lead in Today Queue", async () => {
    const repository = createMockCrmRepository();
    const result = await repository.submitBuyerLead({
      name: "Pedro Lima",
      phone: "913 000 999",
      email: "",
      desiredZones: "Alcochete",
      typology: "T3",
      budget: "250.000 EUR a 350.000 EUR",
      financingStatus: "Pre-aprovado",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
      gclid: "mock-gclid",
      landingPage: "/comprar",
    });

    const newUncontacted = (await repository.getTodayQueue()).find(
      (group) => group.id === "newUncontacted",
    );

    expect(result.opportunity.type).toBe("buyer");
    expect(result.opportunity.assignedTo).toBeNull();
    expect(result.opportunity.createdBy).toBeNull();
    expect(newUncontacted?.opportunities.some((item) => item.id === result.opportunity.id)).toBe(true);
  });

  it("deduplicates public intake by normalized phone first", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.submitSellerLead({
      name: "Duplicado Um",
      phone: "+351 910 000 001",
      email: "primeiro@example.test",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "A avaliar",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      message: "",
      privacyConsent: true,
    });
    const second = await repository.submitBuyerLead({
      name: "Duplicado Dois",
      phone: "910000001",
      email: "segundo@example.test",
      desiredZones: "Montijo",
      typology: "T2",
      budget: "200.000 EUR a 250.000 EUR",
      financingStatus: "A tratar",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
    });

    expect(second.contact.id).toBe(first.contact.id);
  });

  it("deduplicates public intake by normalized email fallback", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.submitSellerLead({
      name: "Email Um",
      phone: "910 000 002",
      email: "MESMO@example.test",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "A avaliar",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      message: "",
      privacyConsent: true,
    });
    const second = await repository.submitBuyerLead({
      name: "Email Dois",
      phone: "910 000 003",
      email: "mesmo@example.test",
      desiredZones: "Montijo",
      typology: "T2",
      budget: "200.000 EUR a 250.000 EUR",
      financingStatus: "A tratar",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
    });

    expect(second.contact.id).toBe(first.contact.id);
  });

  it("never deduplicates public intake by name", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.submitSellerLead({
      name: "Mesmo Nome",
      phone: "910 000 004",
      email: "",
      propertyLocation: "Montijo",
      propertyType: "Apartamento",
      currentSituation: "A avaliar",
      sellingTimeframe: "1 a 3 meses",
      alreadyListed: "Nao",
      message: "",
      privacyConsent: true,
    });
    const second = await repository.submitBuyerLead({
      name: "Mesmo Nome",
      phone: "910 000 005",
      email: "",
      desiredZones: "Montijo",
      typology: "T2",
      budget: "200.000 EUR a 250.000 EUR",
      financingStatus: "A tratar",
      buyingTimeframe: "3 a 6 meses",
      hasPropertyToSell: "Nao",
      message: "",
      privacyConsent: true,
    });

    expect(second.contact.id).not.toBe(first.contact.id);
  });

  it("supports contact search and contacts with multiple opportunities", async () => {
    const repository = createMockCrmRepository();
    const dataset = await repository.getDataset();
    const contacts = buildContactSummaries(dataset.contacts, dataset.opportunities);
    const ana = contacts.find((contact) => contact.firstName === "Ana");

    expect(ana?.opportunities.length).toBeGreaterThan(1);
    expect(searchContactSummaries(contacts, "ana").some((contact) => contact.id === ana?.id)).toBe(true);
  });
});
