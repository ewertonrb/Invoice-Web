import { describe, expect, it } from "vitest";
import { companyResponseSchema, companySchema } from "./schemas";

const validInput = {
  name: "  Acme Labour  ",
  abn: " 12 345 678 901 ",
  email: " accounts@acme.test ",
  phone: " ",
  address: undefined,
  active: false,
  contractorInvoiceGstEnabled: true,
};

describe("companySchema", () => {
  it("normalises supplied text while preserving optional and boolean fields", () => {
    expect(companySchema.parse(validInput)).toEqual({
      name: "Acme Labour",
      abn: "12 345 678 901",
      email: "accounts@acme.test",
      phone: "",
      address: undefined,
      active: false,
      contractorInvoiceGstEnabled: true,
    });
  });

  it.each([
    ["name", { ...validInput, name: "" }],
    ["abn", { ...validInput, abn: "" }],
    ["email", { ...validInput, email: "not-an-email" }],
  ])("rejects an invalid %s", (_field, input) => {
    expect(companySchema.safeParse(input).success).toBe(false);
  });

  it("enforces the backend maximum lengths", () => {
    expect(companySchema.safeParse({ ...validInput, name: "n".repeat(151) }).success).toBe(false);
    expect(companySchema.safeParse({ ...validInput, abn: "1".repeat(21) }).success).toBe(false);
    expect(companySchema.safeParse({ ...validInput, phone: "1".repeat(31) }).success).toBe(false);
    expect(companySchema.safeParse({ ...validInput, address: "a".repeat(256) }).success).toBe(false);
  });
});

describe("companyResponseSchema", () => {
  it("follows the nominal response contract for active and GST", () => {
    const response = {
      id: 42,
      name: "Acme Labour",
      abn: "12 345 678 901",
      email: "accounts@acme.test",
      phone: null,
      address: null,
      active: true,
      contractorInvoiceGstEnabled: false,
      createdAt: "2026-08-06T09:00:00",
      updatedAt: "2026-08-06T10:00:00",
    };

    expect(companyResponseSchema.parse(response)).toMatchObject({
      active: true,
      contractorInvoiceGstEnabled: false,
    });
  });
});
