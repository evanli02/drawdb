import { describe, it, expect } from "vitest";
import { DB } from "../data/constants";
import { MYPRIMETYPE_ALLOWED_VALUES } from "../data/datatypes";
import { generateSampleData } from "./generateSampleData";

const nanoid = () => "id-" + Math.random().toString(36).slice(2, 9);

describe("generateSampleData", () => {
  it("returns empty structure for no tables", () => {
    const { data, extension } = generateSampleData([], [], DB.GENERIC, {
      rowsPerTable: 5,
      format: "json",
    });
    expect(extension).toBe("json");
    const parsed = JSON.parse(data);
    expect(Object.keys(parsed)).toHaveLength(0);
  });

  it("generates JSON with one table and requested row count", () => {
    const tables = [
      {
        id: "t1",
        name: "Users",
        fields: [
          { id: "f1", name: "id", type: "INT", primary: true, increment: true },
          { id: "f2", name: "name", type: "VARCHAR" },
        ],
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      [],
      DB.GENERIC,
      { rowsPerTable: 3, format: "json" },
    );
    expect(extension).toBe("json");
    const parsed = JSON.parse(data);
    expect(parsed.Users).toHaveLength(3);
    expect(parsed.Users[0]).toHaveProperty("id", 1);
    expect(parsed.Users[0]).toHaveProperty("name");
    expect(parsed.Users[1].id).toBe(2);
    expect(parsed.Users[2].id).toBe(3);
  });

  it("generates CSV with header and data rows", () => {
    const tables = [
      {
        id: "t1",
        name: "Products",
        fields: [
          { id: "f1", name: "id", type: "INT", primary: true, increment: true },
          { id: "f2", name: "label", type: "VARCHAR" },
        ],
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      [],
      DB.GENERIC,
      { rowsPerTable: 2, format: "csv" },
    );
    expect(extension).toBe("csv");
    expect(data).toContain("# Products");
    expect(data).toContain("id,label");
    expect(data.split("\n").filter((l) => l.startsWith("id,")).length).toBe(1);
    expect(data.split("\n").length).toBeGreaterThan(2);
  });

  it("generates SQL INSERT statements", () => {
    const tables = [
      {
        id: "t1",
        name: "Orders",
        fields: [
          { id: "f1", name: "id", type: "INT", primary: true, increment: true },
          { id: "f2", name: "total", type: "DECIMAL" },
        ],
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      [],
      DB.GENERIC,
      { rowsPerTable: 2, format: "sql" },
    );
    expect(extension).toBe("sql");
    expect(data).toContain('INSERT INTO "Orders"');
    expect(data).toContain("VALUES (1,");
    expect(data).toContain("VALUES (2,");
  });

  it("fills FK columns with valid parent IDs when relationship exists", () => {
    const parentId = nanoid();
    const childId = nanoid();
    const startFieldId = nanoid();
    const endFieldId = nanoid();
    const tables = [
      {
        id: parentId,
        name: "Parent",
        fields: [
          {
            id: endFieldId,
            name: "id",
            type: "INT",
            primary: true,
            increment: true,
          },
        ],
      },
      {
        id: childId,
        name: "Child",
        fields: [
          {
            id: startFieldId,
            name: "parent_id",
            type: "INT",
          },
        ],
      },
    ];
    const relationships = [
      {
        startTableId: childId,
        startFieldId,
        endTableId: parentId,
        endFieldId,
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      relationships,
      DB.GENERIC,
      { rowsPerTable: 3, format: "json" },
    );
    const parsed = JSON.parse(data);
    const parentIds = parsed.Parent.map((r) => r.id);
    const childParentIds = parsed.Child.map((r) => r.parent_id);
    childParentIds.forEach((fk) => {
      expect(parentIds).toContain(fk);
    });
  });

  it("generates MYPRIMETYPE values from allowed primes only", () => {
    const tables = [
      {
        id: "t1",
        name: "Primes",
        fields: [
          { id: "f1", name: "id", type: "INT", primary: true, increment: true },
          { id: "f2", name: "value", type: "MYPRIMETYPE" },
        ],
      },
    ];
    const { data } = generateSampleData(tables, [], DB.GENERIC, {
      rowsPerTable: 20,
      format: "json",
    });
    const parsed = JSON.parse(data);
    const values = parsed.Primes.map((r) => r.value);
    values.forEach((v) => {
      expect(MYPRIMETYPE_ALLOWED_VALUES).toContain(v);
    });
  });

  it("handles table with no fields (empty rows)", () => {
    const tables = [
      {
        id: "t1",
        name: "Empty",
        fields: [],
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      [],
      DB.GENERIC,
      { rowsPerTable: 2, format: "json" },
    );
    const parsed = JSON.parse(data);
    expect(parsed.Empty).toHaveLength(2);
    expect(parsed.Empty[0]).toEqual({});
  });

  it("handles table with undefined fields (uses empty array)", () => {
    const tables = [
      {
        id: "t1",
        name: "NoFields",
        fields: undefined,
      },
    ];
    const { data } = generateSampleData(tables, [], DB.GENERIC, {
      rowsPerTable: 1,
      format: "json",
    });
    const parsed = JSON.parse(data);
    expect(parsed.NoFields).toHaveLength(1);
    expect(parsed.NoFields[0]).toEqual({});
  });

  it("CSV escapes object values as JSON (no [object Object])", () => {
    const tables = [
      {
        id: "t1",
        name: "WithJson",
        fields: [
          { id: "f1", name: "id", type: "INT", primary: true, increment: true },
          { id: "f2", name: "payload", type: "JSON" },
        ],
      },
    ];
    const { data, extension } = generateSampleData(
      tables,
      [],
      DB.GENERIC,
      { rowsPerTable: 1, format: "csv" },
    );
    expect(extension).toBe("csv");
    expect(data).not.toContain("[object Object]");
    expect(data).toContain("payload");
  });
});
