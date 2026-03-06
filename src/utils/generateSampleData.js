import { DB } from "../data/constants";
import { dbToTypes, MYPRIMETYPE_ALLOWED_VALUES } from "../data/datatypes";

const SAMPLE_STRINGS = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "North",
  "South",
  "East",
  "West",
  "Sample",
  "Test",
  "Demo",
  "Example",
  "Default",
  "Value",
  "Item",
  "Record",
  "Entry",
  "Data",
  "Info",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateValueForField(field, tableIndex, rowIndex, database, generatedIdsByTable) {
  const meta = dbToTypes[database]?.[field.type] ?? dbToTypes[DB.GENERIC]?.[field.type];

  if (field.increment) {
    return rowIndex + 1;
  }

  if (field.default !== "" && field.default != null) {
    const d = String(field.default).toUpperCase();
    if (d === "NULL" && !field.notNull) return null;
    if (d === "CURRENT_TIMESTAMP" || d === "NOW()") return new Date().toISOString().slice(0, 19).replace("T", " ");
    if (meta && !meta.hasQuotes && /^-?\d+$/.test(field.default)) return parseInt(field.default, 10);
    if (meta && !meta.hasQuotes && /^-?\d*\.?\d+$/.test(field.default)) return parseFloat(field.default);
  }

  if (field.type === "ENUM" || field.type === "SET") {
    const values = field.values && field.values.length > 0 ? field.values : ["A", "B", "C"];
    return field.type === "SET"
      ? [randomChoice(values)]
      : randomChoice(values);
  }

  if (field.type === "MYPRIMETYPE") {
    return randomChoice(MYPRIMETYPE_ALLOWED_VALUES);
  }

  if (meta) {
    const intTypes = ["INT", "INTEGER", "SMALLINT", "BIGINT", "TINYINT", "MEDIUMINT"];
    if (intTypes.includes(field.type)) {
      return randomInt(1, 99999);
    }
    const decimalTypes = ["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "REAL", "NUMBER"];
    if (decimalTypes.includes(field.type)) {
      return Math.round((Math.random() * 10000) * 100) / 100;
    }
    if (field.type === "BOOLEAN") {
      return randomChoice([true, false]);
    }
    if (field.type === "UUID") {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    const stringTypes = ["CHAR", "VARCHAR", "VARCHAR2", "TEXT", "NVARCHAR", "NVARCHAR2"];
    if (stringTypes.includes(field.type)) {
      const len = field.size ? Math.min(parseInt(field.size, 10) || 50, 200) : 50;
      const word = randomChoice(SAMPLE_STRINGS);
      const suffix = randomInt(1, 9999);
      const s = `${word}_${suffix}`;
      return s.length > len ? s.slice(0, len) : s;
    }
    if (field.type === "DATE") {
      const year = randomInt(2020, 2025);
      const month = String(randomInt(1, 12)).padStart(2, "0");
      const day = String(randomInt(1, 28)).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (field.type === "TIME") {
      return `${String(randomInt(0, 23)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}:${String(randomInt(0, 59)).padStart(2, "0")}`;
    }
    if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
      const d = new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000));
      return d.toISOString().slice(0, 19).replace("T", " ");
    }
    if (field.type === "JSON") {
      return { key: randomChoice(SAMPLE_STRINGS), value: randomInt(1, 100) };
    }
  }

  return `sample_${tableIndex}_${rowIndex}_${field.name}`;
}

function topologicalSort(tables, relationships) {
  const idToIndex = new Map(tables.map((t, i) => [t.id, i]));
  const inDegree = tables.map(() => 0);
  const outEdges = tables.map(() => []);

  for (const rel of relationships) {
    const startIdx = idToIndex.get(rel.startTableId);
    const endIdx = idToIndex.get(rel.endTableId);
    if (startIdx == null || endIdx == null) continue;
    outEdges[endIdx].push(startIdx);
    inDegree[startIdx]++;
  }

  const queue = inDegree.map((d, i) => i).filter((i) => inDegree[i] === 0);
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of outEdges[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  for (let i = 0; i < inDegree.length; i++) {
    if (inDegree[i] !== 0) order.push(i);
  }
  return order;
}

function buildFkMap(tables, relationships) {
  const fkMap = new Map();
  for (const rel of relationships) {
    const endTable = tables.find((t) => t.id === rel.endTableId);
    const startTable = tables.find((t) => t.id === rel.startTableId);
    if (!endTable || !startTable) continue;
    const endField = endTable.fields.find((f) => f.id === rel.endFieldId);
    const startField = startTable.fields.find((f) => f.id === rel.startFieldId);
    if (!endField || !startField) continue;
    const key = `${startTable.id}:${startField.name}`;
    if (!fkMap.has(key)) fkMap.set(key, []);
    fkMap.get(key).push({ tableId: endTable.id, fieldName: endField.name });
  }
  return fkMap;
}

export function generateSampleData(tables, relationships, database, options = {}) {
  const { rowsPerTable = 5, format = "json" } = options;
  const order = topologicalSort(tables, relationships);
  const generatedIdsByTable = new Map();

  const tableRows = [];
  for (const tableIdx of order) {
    const table = tables[tableIdx];
    const rows = [];
    for (let r = 0; r < rowsPerTable; r++) {
      const row = {};
      for (const field of table.fields) {
        let val = generateValueForField(field, tableIdx, r, database, generatedIdsByTable);
        if (Array.isArray(val) && field.type === "SET") {
          val = val.join(",");
        }
        row[field.name] = val;
      }
      rows.push(row);
    }
    const pkField = table.fields.find((f) => f.primary);
    if (pkField) {
      generatedIdsByTable.set(table.id, rows.map((row) => row[pkField.name]));
    }
    tableRows.push({ tableName: table.name, rows });
  }

  for (const rel of relationships) {
    const startTable = tables.find((t) => t.id === rel.startTableId);
    const endTable = tables.find((t) => t.id === rel.endTableId);
    const startField = startTable?.fields.find((f) => f.id === rel.startFieldId);
    const endField = endTable?.fields.find((f) => f.id === rel.endFieldId);
    if (!startTable || !endTable || !startField || !endField) continue;
    const parentIds = generatedIdsByTable.get(endTable.id);
    const childRows = tableRows.find((tr) => tr.tableName === startTable.name)?.rows;
    if (!parentIds?.length || !childRows?.length) continue;
    const fkFieldName = startField.name;
    childRows.forEach((row, i) => {
      row[fkFieldName] = parentIds[i % parentIds.length];
    });
  }

  if (format === "json") {
    const obj = {};
    tableRows.forEach(({ tableName, rows }) => {
      obj[tableName] = rows;
    });
    return { data: JSON.stringify(obj, null, 2), extension: "json" };
  }

  if (format === "csv") {
    const parts = tableRows.map(({ tableName, rows }) => {
      if (rows.length === 0) return `# ${tableName}\n(no rows)`;
      const headers = Object.keys(rows[0]);
      const escape = (v) => {
        const s = v == null ? "" : String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))];
      return `# ${tableName}\n${lines.join("\n")}`;
    });
    return { data: parts.join("\n\n"), extension: "csv" };
  }

  if (format === "sql") {
    const quote = (v) => {
      if (v == null) return "NULL";
      if (typeof v === "number" && !Number.isNaN(v)) return String(v);
      if (typeof v === "boolean") return v ? "1" : "0";
      if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    };
    const statements = [];
    for (const { tableName, rows } of tableRows) {
      if (rows.length === 0) continue;
      const cols = Object.keys(rows[0]);
      for (const row of rows) {
        const values = cols.map((c) => quote(row[c]));
        statements.push(`INSERT INTO "${tableName}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`);
      }
    }
    return { data: statements.join("\n"), extension: "sql" };
  }

  return { data: "", extension: "txt" };
}
