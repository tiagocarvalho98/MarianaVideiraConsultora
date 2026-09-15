import { describe, expect, it } from "vitest";
import { hashPublicIntakeKey } from "./rate-limit-key";

describe("public intake rate limit", () => {
  it("hashes the fingerprint without exposing phone or IP", () => {
    const hash = hashPublicIntakeKey({
      formType: "seller",
      ipAddress: "203.0.113.10",
      phone: "912 345 101",
    });

    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("203.0.113.10");
    expect(hash).not.toContain("912");
  });

  it("normalizes equivalent phone inputs to the same key", () => {
    const first = hashPublicIntakeKey({
      formType: "buyer",
      ipAddress: "203.0.113.10",
      phone: "912 345 101",
    });
    const second = hashPublicIntakeKey({
      formType: "buyer",
      ipAddress: "203.0.113.10",
      phone: "+351 912 345 101",
    });

    expect(first).toBe(second);
  });
});
