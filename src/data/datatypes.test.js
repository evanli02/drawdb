import { describe, it, expect } from "vitest";
import { DB } from "./constants";
import { getTypeMeta, MYPRIMETYPE_ALLOWED_VALUES } from "./datatypes";

describe("getTypeMeta", () => {
  it("returns type metadata for GENERIC when type exists", () => {
    const meta = getTypeMeta(DB.GENERIC, "INT");
    expect(meta).not.toBeNull();
    expect(meta.type).toBe("INT");
    expect(meta.canIncrement).toBe(true);
  });

  it("returns type metadata for MYPRIMETYPE when database is GENERIC", () => {
    const meta = getTypeMeta(DB.GENERIC, "MYPRIMETYPE");
    expect(meta).not.toBeNull();
    expect(meta.type).toBe("MYPRIMETYPE");
    expect(meta.canIncrement).toBe(false);
    expect(meta.hasCheck).toBe(true);
  });

  it("falls back to GENERIC for MYPRIMETYPE when database is MySQL", () => {
    const meta = getTypeMeta(DB.MYSQL, "MYPRIMETYPE");
    expect(meta).not.toBeNull();
    expect(meta.type).toBe("MYPRIMETYPE");
  });

  it("returns falsy for unknown type (Proxy returns false)", () => {
    const meta = getTypeMeta(DB.GENERIC, "UNKNOWN_TYPE_XYZ");
    expect(meta).toBeFalsy();
  });
});

describe("MYPRIMETYPE checkDefault", () => {
  it("accepts valid prime defaults", () => {
    const meta = getTypeMeta(DB.GENERIC, "MYPRIMETYPE");
    expect(meta.checkDefault({ default: "2" })).toBe(true);
    expect(meta.checkDefault({ default: "11" })).toBe(true);
    expect(meta.checkDefault({ default: "199" })).toBe(true);
  });

  it("rejects non-primes", () => {
    const meta = getTypeMeta(DB.GENERIC, "MYPRIMETYPE");
    expect(meta.checkDefault({ default: "1" })).toBe(false);
    expect(meta.checkDefault({ default: "4" })).toBe(false);
    expect(meta.checkDefault({ default: "9" })).toBe(false);
  });

  it("rejects empty or invalid default", () => {
    const meta = getTypeMeta(DB.GENERIC, "MYPRIMETYPE");
    expect(meta.checkDefault({ default: "" })).toBe(false);
    expect(meta.checkDefault({ default: "abc" })).toBe(false);
  });
});

describe("MYPRIMETYPE_ALLOWED_VALUES", () => {
  it("includes expected primes and is non-empty", () => {
    expect(MYPRIMETYPE_ALLOWED_VALUES).toContain(2);
    expect(MYPRIMETYPE_ALLOWED_VALUES).toContain(3);
    expect(MYPRIMETYPE_ALLOWED_VALUES).toContain(11);
    expect(MYPRIMETYPE_ALLOWED_VALUES.length).toBeGreaterThan(0);
  });

  it("does not include 1 or 9", () => {
    expect(MYPRIMETYPE_ALLOWED_VALUES).not.toContain(1);
    expect(MYPRIMETYPE_ALLOWED_VALUES).not.toContain(9);
  });
});
