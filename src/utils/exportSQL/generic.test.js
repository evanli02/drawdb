import { describe, it, expect } from "vitest";
import { DB } from "../../data/constants";
import { getTypeString, getSQLiteType } from "./generic";

describe("getTypeString MYPRIMETYPE", () => {
  it("returns INT for MYPRIMETYPE when exporting to MySQL", () => {
    const field = { type: "MYPRIMETYPE", name: "prime_col" };
    const result = getTypeString(field, DB.GENERIC, DB.MYSQL);
    expect(result).toBe("INT");
  });

  it("returns INT for MYPRIMETYPE when exporting to PostgreSQL", () => {
    const field = { type: "MYPRIMETYPE", name: "prime_col" };
    const result = getTypeString(field, DB.GENERIC, DB.POSTGRES);
    expect(result).toBe("INT");
  });
});

describe("getSQLiteType MYPRIMETYPE", () => {
  it("returns INTEGER for MYPRIMETYPE", () => {
    const field = { type: "MYPRIMETYPE", name: "prime_col" };
    const result = getSQLiteType(field);
    expect(result).toBe("INTEGER");
  });
});
