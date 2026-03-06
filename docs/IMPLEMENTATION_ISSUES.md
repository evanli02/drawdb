# Implementation issues and fixes

*(All issues below have been fixed.)*

## 1. MYPRIMETYPE only exists for GENERIC database

**Problem:** `MYPRIMETYPE` is defined only in `defaultTypesBase`, which backs `dbToTypes[DB.GENERIC]`. For MySQL, Postgres, etc., `dbToTypes[database]["MYPRIMETYPE"]` is missing; the Proxy returns `false` for unknown keys. Accessing any property on `false` (e.g. `false.noDefault`, `false.checkDefault`) causes a **TypeError**.

**When it breaks:**
- User has diagram set to **Generic**, adds a column of type **MYPRIMETYPE**, then switches the diagram database to e.g. **MySQL** (or loads a diagram that has MYPRIMETYPE but a non-GENERIC database).
- Any UI or validation that does `dbToTypes[database][field.type].…` for that field will crash.

**Affected code:**
- **FieldDetails.jsx** – `dbToTypes[database][data.type].noDefault`, `.isSized`, `.hasPrecision`, `.hasCheck`, `.canIncrement`, `.signed`
- **Table.jsx** – `dbToTypes[database][e.type].color`, `.isSized`, `.hasPrecision`
- **issues.js** – `dbToTypes[database][field.type].checkDefault`

**Fix (done):** Added `getTypeMeta(database, type)` in `datatypes.js` that falls back to `DB.GENERIC`. FieldDetails, Table.jsx, issues.js, and TableField.jsx now use `getTypeMeta()` instead of `dbToTypes[database][field.type]`.

---

## 2. Generate sample data – CSV with object values

**Problem:** For columns of type **JSON**, the generator returns an object. In CSV export, values are passed through `escape(v)` which uses `String(v)`. For objects this becomes `"[object Object]"`, which is useless.

**Fix (done):** CSV escape now detects objects and uses `JSON.stringify(v)` with proper quote escaping, and always wraps object values in double quotes.

---

## 3. Generate sample data – Unused `buildFkMap`

**Problem:** `buildFkMap` in `generateSampleData.js` is never used. It’s dead code.

**Fix (done):** Removed the unused `buildFkMap` function.

---

## 4. Generate sample data – Missing guard for `table.fields`

**Problem:** The code assumes `table.fields` exists. If a table has no `fields` (e.g. bad data or future schema), iterating over it can throw or behave oddly.

**Fix (done):** Generator uses `const fields = table.fields ?? []` and iterates over `fields` so missing `fields` is safe.

---

## Summary

| # | Area              | Issue                                      | Severity | Fix                          |
|---|-------------------|--------------------------------------------|----------|------------------------------|
| 1 | MYPRIMETYPE       | Crash when type used with non-GENERIC DB   | High     | Fallback to GENERIC metadata |
| 2 | Sample data CSV   | JSON columns become "[object Object]"     | Medium   | Serialize objects in CSV     |
| 3 | Sample data       | Dead code `buildFkMap`                     | Low      | Remove function              |
| 4 | Sample data       | No guard for missing `table.fields`       | Low      | Use `table.fields ?? []`     |
