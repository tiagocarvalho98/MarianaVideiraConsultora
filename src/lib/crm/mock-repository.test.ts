import { describe, expect, it } from "vitest";
import { buyerLostReasons, sellerLostReasons } from "@/data/lost-reasons";
import { buildContactSummaries, searchContactSummaries } from "./contact-search";
import { createMockCrmRepository } from "./mock-repository";

describe("mock CRM repository", () => {
  const manualBase = {
    contactId: null,
    contact: {
      name: "Manual Silva",
      phone: "912 222 333",
      email: "manual@example.test",
    },
    opportunity: {
      type: "seller" as const,
      sourceId: "30000000-0000-4000-8000-000000000004",
      temperature: "morna" as const,
      assignedTo: null,
      location: "Montijo",
      propertyType: "Apartamento",
      sellerSituation: "Estou a preparar a venda",
      timeframe: "1 a 3 meses",
      financingStatus: null,
      currentPropertyToSell: null,
      propertyAlreadyListed: false,
      budgetMin: null,
      budgetMax: null,
    },
    nextTask: null,
    note: null,
  };

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

  it("creates a manual seller opportunity with created_by and assigned_to as current user", async () => {
    const repository = createMockCrmRepository();
    const result = await repository.createManualOpportunity({
      ...manualBase,
      note: "Chegou por chamada direta.",
    });

    expect(result.opportunity.type).toBe("seller");
    expect(result.opportunity.status).toBe("new");
    expect(result.opportunity.stage).toBe("nova_lead");
    expect(result.opportunity.createdBy).toBe("10000000-0000-4000-8000-000000000001");
    expect(result.opportunity.assignedTo).toBe("10000000-0000-4000-8000-000000000001");

    const activities = await repository.getActivities(result.opportunity.id);
    expect(activities.some((activity) => activity.title === "Oportunidade criada manualmente")).toBe(true);
    expect(activities.some((activity) => activity.title === "Nota inicial")).toBe(true);
  });

  it("creates a manual buyer opportunity", async () => {
    const repository = createMockCrmRepository();
    const result = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Comprador Manual", phone: "913 222 333", email: "" },
      opportunity: {
        ...manualBase.opportunity,
        type: "buyer",
        location: "Alcochete",
        propertyType: "T3",
        budgetMin: 250000,
        budgetMax: 350000,
        financingStatus: "Pre-aprovado",
        currentPropertyToSell: false,
        propertyAlreadyListed: null,
      },
    });

    expect(result.opportunity.type).toBe("buyer");
    expect(result.opportunity.budgetMin).toBe(250000);
    expect(result.opportunity.budgetMax).toBe(350000);
  });

  it("deduplicates manual creation by phone first", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.createManualOpportunity(manualBase);
    const second = await repository.createManualOpportunity({
      ...manualBase,
      contact: {
        name: "Outro Nome",
        phone: "+351 912 222 333",
        email: "outro@example.test",
      },
    });

    expect(second.contact.id).toBe(first.contact.id);
    expect(second.opportunity.id).not.toBe(first.opportunity.id);
  });

  it("deduplicates manual creation by email fallback", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Email Manual Um", phone: "914 222 333", email: "MANUAL-FALLBACK@example.test" },
    });
    const second = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Email Manual Dois", phone: "915 222 333", email: "manual-fallback@example.test" },
    });

    expect(second.contact.id).toBe(first.contact.id);
  });

  it("never deduplicates manual creation by name", async () => {
    const repository = createMockCrmRepository();
    const first = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Mesmo Manual", phone: "916 222 333", email: "" },
    });
    const second = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Mesmo Manual", phone: "917 222 333", email: "" },
    });

    expect(second.contact.id).not.toBe(first.contact.id);
  });

  it("allows an existing contact to receive a new manual opportunity", async () => {
    const repository = createMockCrmRepository();
    const contact = (await repository.getContacts())[0];
    const before = (await repository.getOpportunities()).filter(
      (opportunity) => opportunity.contactId === contact.id,
    ).length;
    const result = await repository.createManualOpportunity({
      ...manualBase,
      contactId: contact.id,
      contact: { name: null, phone: null, email: null },
    });
    const after = (await repository.getOpportunities()).filter(
      (opportunity) => opportunity.contactId === contact.id,
    ).length;

    expect(result.contact.id).toBe(contact.id);
    expect(after).toBe(before + 1);
  });

  it("creates task and recalculates next_action_at for manual opportunities", async () => {
    const repository = createMockCrmRepository();
    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const result = await repository.createManualOpportunity({
      ...manualBase,
      contact: { name: "Task Manual", phone: "918 222 333", email: "" },
      nextTask: {
        type: "call",
        dueAt,
        title: "Ligar para qualificar",
      },
    });

    expect(result.task).not.toBeNull();
    expect((await repository.getOpportunity(result.opportunity.id))?.nextActionAt).toBe(dueAt);
  });

  it("rejects manual buyer budget when minimum exceeds maximum", async () => {
    const repository = createMockCrmRepository();

    await expect(
      repository.createManualOpportunity({
        ...manualBase,
        opportunity: {
          ...manualBase.opportunity,
          type: "buyer",
          budgetMin: 400000,
          budgetMax: 300000,
        },
      }),
    ).rejects.toThrow("orcamento maximo");
  });

  it("rejects manual creation for unauthenticated or inactive users", async () => {
    await expect(
      createMockCrmRepository(undefined, { currentProfileId: null }).createManualOpportunity(manualBase),
    ).rejects.toThrow("Not allowed");

    await expect(
      createMockCrmRepository(undefined, { currentProfileIsActive: false }).createManualOpportunity(manualBase),
    ).rejects.toThrow("Not allowed");
  });

  it("rejects invalid manual payloads", async () => {
    const repository = createMockCrmRepository();

    await expect(
      repository.createManualOpportunity({
        ...manualBase,
        contact: { name: "", phone: "", email: "" },
      }),
    ).rejects.toThrow("nome");
  });
});
