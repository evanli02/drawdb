# Pull Request

**Suggested title (for Code Rabbit / clarity):**  
`Add MYPRIMETYPE datatype and generate sample data feature`

---

## Summary

This PR adds a new custom datatype (**MYPRIMETYPE**), a **Generate sample data** feature for tables, a **codebase architecture diagram**, and fixes for edge cases in both implementations.

---

## 1. MYPRIMETYPE datatype

### What it is
- New datatype **MYPRIMETYPE** that restricts values to a fixed set of prime numbers: **2, 3, 5, 7, 11, 13, …** (up to 199).
- Available when the diagram database is set to **Generic**.

### Changes
- **`src/data/datatypes.js`**
  - Added `MYPRIMETYPE` to `defaultTypesBase` with `checkDefault` validating against the prime set, `hasCheck: true`, `canIncrement: false`, `hasQuotes: false`.
  - Exported **`MYPRIMETYPE_ALLOWED_VALUES`** (array of primes) for use elsewhere.
- **`src/utils/exportSQL/generic.js`**
  - **`getTypeString`**: For any target DBMS, MYPRIMETYPE is emitted as **INT**.
  - **`getMyPrimeTypeCheck(quotedColumnName)`**: Builds `CHECK(column IN (2, 3, 5, …))` for all dialects.
  - **`getJsonType`**: MYPRIMETYPE represented as integer enum in JSON schema.
  - **SQL export**: MySQL, PostgreSQL, SQLite, MariaDB, MSSQL, and Oracle get the correct CHECK with the right column quoting.
  - **`getSQLiteType`**: MYPRIMETYPE mapped to **INTEGER**.
- **`src/components/EditorSidePanel/TablesTab/FieldDetails.jsx`**
  - For fields of type MYPRIMETYPE, default value is a **Select** dropdown of allowed primes (no free-text).
- **`src/components/EditorSidePanel/TablesTab/TableField.jsx`**
  - When switching a field’s type to MYPRIMETYPE, default is set to **"2"**.

---

## 2. Generate sample data

### What it does
- Lets users generate sample rows for all tables from the current diagram.
- Supports **JSON**, **CSV**, and **SQL** (INSERT statements) with configurable **rows per table** (1–1000).
- Value generation is **type-aware** (INT, VARCHAR, ENUM, DATE, JSON, MYPRIMETYPE, etc.) and **FK-aware** (parent tables first, then FK columns filled with valid parent IDs).

### Changes
- **`src/utils/generateSampleData.js`** (new)
  - **`generateSampleData(tables, relationships, database, options)`** with `rowsPerTable` and `format` ('json' | 'csv' | 'sql').
  - Topological sort so referenced tables are generated before tables with FKs.
  - Per-type value generation (integers, decimals, strings, UUIDs, dates, ENUM/SET, MYPRIMETYPE, JSON, etc.).
- **`src/components/EditorHeader/Modal/GenerateSampleData.jsx`** (new)
  - Modal with rows-per-table input, format selector, and **Generate** button; on Generate, opens the existing export preview (code modal) for download.
- **`src/data/constants.js`**
  - Added **`MODAL.SAMPLE_DATA = 12`**.
- **`src/utils/modalData.js`**
  - Title, width, and okText for `MODAL.SAMPLE_DATA`.
- **`src/components/EditorHeader/Modal/Modal.jsx`**
  - Renders **GenerateSampleData** for `MODAL.SAMPLE_DATA`; OK button hidden (Generate is the only action).
- **`src/components/EditorHeader/ControlPanel.jsx`**
  - New File menu item: **Generate sample data** → opens sample-data modal.
- **`src/i18n/locales/en.js`**
  - New keys: `generate_sample_data`, `sample_data_rows_per_table`, `sample_data_format`, `sample_data_no_tables`, `sample_data_generate`.

---

## 3. Codebase diagram

- **`docs/CODEBASE_DIAGRAM.md`** (new)
  - Mermaid diagrams for: entry & routing, Editor context stack, Workspace composition, data/API/utils layers, hooks ↔ contexts, and a directory tree summary.

---

## 4. Implementation fixes

### Safe type metadata (MYPRIMETYPE + non-GENERIC DB)
- **Problem:** MYPRIMETYPE exists only for GENERIC. If a diagram had MYPRIMETYPE and the DB was later switched to MySQL/Postgres (or similar), `dbToTypes[database][field.type]` is missing and property access (e.g. `.noDefault`, `.checkDefault`) threw.
- **Fix:** Added **`getTypeMeta(database, type)`** in **`src/data/datatypes.js`** (fallback to `DB.GENERIC`). Replaced direct `dbToTypes[database][…]` usage with `getTypeMeta` in:
  - **FieldDetails.jsx** (noDefault, isSized, hasPrecision, hasCheck, canIncrement, signed)
  - **Table.jsx** (color, isSized, hasPrecision; fallback color when meta is null)
  - **issues.js** (checkDefault)
  - **TableField.jsx** (onChange type handler: canIncrement, isSized, hasPrecision, hasDefault, hasCheck, defaultSize)

### Sample data
- **CSV + object values:** JSON columns were exported as `"[object Object]"`. CSV escape now uses `JSON.stringify` for objects and wraps in quoted, escaped strings.
- **Dead code:** Removed unused **`buildFkMap`** from `generateSampleData.js`.
- **Missing `table.fields`:** Generator now uses **`table.fields ?? []`** so tables without `fields` don’t cause errors.

### Documentation
- **`docs/IMPLEMENTATION_ISSUES.md`** (new) documents these issues and notes that they are fixed.

---

## Files changed (overview)

| Area            | Files |
|-----------------|--------|
| MYPRIMETYPE     | `data/datatypes.js`, `utils/exportSQL/generic.js`, `TablesTab/FieldDetails.jsx`, `TablesTab/TableField.jsx` |
| Sample data     | `utils/generateSampleData.js` (new), `Modal/GenerateSampleData.jsx` (new), `data/constants.js`, `utils/modalData.js`, `Modal/Modal.jsx`, `ControlPanel.jsx`, `i18n/locales/en.js` |
| Type metadata   | `data/datatypes.js` (`getTypeMeta`), `FieldDetails.jsx`, `TableField.jsx`, `EditorCanvas/Table.jsx`, `utils/issues.js` |
| Docs            | `docs/CODEBASE_DIAGRAM.md`, `docs/IMPLEMENTATION_ISSUES.md` |

---

## How to verify

1. **MYPRIMETYPE:** Set diagram DB to Generic → add table → set a column type to MYPRIMETYPE → choose default from dropdown → export SQL and confirm INT + CHECK.
2. **Sample data:** Add at least one table → File → Generate sample data → set rows and format → Generate → Export and inspect JSON/CSV/SQL.
3. **Edge case:** Create a diagram with Generic + MYPRIMETYPE column, then switch diagram DB to MySQL; field details and canvas should not throw (getTypeMeta fallback).

---

## Checklist

- [x] MYPRIMETYPE defined and validated; export and UI wired.
- [x] Sample data generator with JSON/CSV/SQL and FK-aware ordering.
- [x] Safe type metadata lookup to avoid crashes when type is not in current DB.
- [x] CSV and generator robustness fixes; dead code removed.
- [x] Docs added for architecture and implementation issues.
