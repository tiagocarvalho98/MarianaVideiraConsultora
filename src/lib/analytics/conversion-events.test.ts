import { describe, expect, it } from "vitest";
import { createConversionEvent } from "./conversion-events";

describe("conversion events", () => {
  it("creates typed conversion events without PII", () => {
    const event = createConversionEvent("seller_lead_submitted", {
      path: "/vender",
    });

    expect(event.name).toBe("seller_lead_submitted");
    expect(event.metadata).toEqual({ path: "/vender" });
    expect(event).not.toHaveProperty("email");
    expect(event).not.toHaveProperty("phone");
  });
});
