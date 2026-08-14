import { describe, expect, it } from "vitest";
import { calculationFor, rateResponseSchema, rateSchema } from "./schemas";

const regular = { rateType: "REGULAR" as const, calculationType: "BASE_RATE" as const, value: "42.50", description: "Base" };

describe("rate schemas", () => {
  it("accepts a valid historical rate table", () => {
    expect(rateSchema.parse({ projectPositionId: "9", effectiveFrom: "2026-08-01", effectiveTo: "", items: [regular] })).toMatchObject({ projectPositionId: 9 });
  });

  it.each([
    [{ ...regular, value: "0" }, "Value must be greater than zero."],
    [{ rateType: "SATURDAY", calculationType: "MULTIPLIER", value: "0.99" }, "Multiplier cannot be lower than 1.0."],
    [{ rateType: "KILOMETRE", calculationType: "FIXED_AMOUNT", value: "1" }, "Calculation type does not match the selected rate type."],
  ])("rejects invalid item invariants", (item, message) => {
    const result = rateSchema.safeParse({ projectPositionId: 9, effectiveFrom: "2026-08-01", items: [regular, item] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message === message)).toBe(true);
  });

  it("requires REGULAR, unique types, and a valid date range", () => {
    const missing = rateSchema.safeParse({ projectPositionId: 9, effectiveFrom: "2026-08-02", effectiveTo: "2026-08-01", items: [{ rateType: "LAFHA", calculationType: "FIXED_AMOUNT", value: "10" }] });
    expect(missing.success).toBe(false);
    if (!missing.success) expect(missing.error.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining(["Effective to cannot be before effective from.", "A REGULAR base rate is required."]));

    const duplicate = rateSchema.safeParse({ projectPositionId: 9, effectiveFrom: "2026-08-01", items: [regular, regular] });
    expect(duplicate.success).toBe(false);
    if (!duplicate.success) expect(duplicate.error.issues.some((issue) => issue.message === "Rate types cannot be duplicated.")).toBe(true);
  });

  it("maps every backend rate type to its required calculation type", () => {
    expect(calculationFor("REGULAR")).toBe("BASE_RATE");
    expect(calculationFor("KILOMETRE")).toBe("FIXED_RATE");
    expect(calculationFor("LAFHA")).toBe("FIXED_AMOUNT");
    expect(calculationFor("PUBLIC_HOLIDAY")).toBe("MULTIPLIER");
  });

  it("normalizes numeric response values to strings and rejects incomplete responses", () => {
    const response = { id: 1, projectPositionId: 9, positionName: "Carpenter", projectId: 3, projectName: "Site", companyId: 7, companyName: "Acme", effectiveFrom: "2026-08-01", effectiveTo: null, active: true, items: [{ id: 2, rateType: "REGULAR", calculationType: "BASE_RATE", value: 42.5, description: null, active: true, createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" }], createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" };
    expect(rateResponseSchema.parse(response).items[0].value).toBe("42.5");
    expect(rateResponseSchema.safeParse({ ...response, companyId: undefined }).success).toBe(false);
  });

  it.each(["99999999", "99999999.9999", "0.0001"])("accepts backend decimal boundary %s", (value) => {
    expect(rateSchema.safeParse({ projectPositionId: 9, effectiveFrom: "2026-08-01", items: [{ ...regular, value }] }).success).toBe(true);
  });

  it.each(["100000000", "1.00001", "01.50", "1e2", ".5", "-1"])("rejects non-canonical or out-of-range decimal %s", (value) => {
    const result = rateSchema.safeParse({ projectPositionId: 9, effectiveFrom: "2026-08-01", items: [{ ...regular, value }] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message === "Use a decimal with up to 8 whole digits and 4 decimal places.")).toBe(true);
  });
});
