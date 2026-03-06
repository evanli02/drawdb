# Code Rabbit fixes for this PR

Use this to address the Docstring Coverage and Title check feedback.

---

## 1. PR title (Title check)

**Change the PR title on GitHub to:**

```
Add MYPRIMETYPE datatype and generate sample data feature
```

Or, if you want to mention the diagram:

```
Add MYPRIMETYPE datatype, sample data generation, and codebase diagram
```

---

## 2. Docstring coverage (80% threshold)

Add JSDoc docstrings to the following. The project uses JSDoc style (see e.g. `src/utils/calcPath.js`).

### A. `src/data/datatypes.js`

**Find:** `export function getTypeMeta(database, type) {`  
**Add above it:**

```js
/**
 * Returns type metadata for a field type, falling back to GENERIC if the type
 * is not defined for the current database (e.g. MYPRIMETYPE only in GENERIC).
 *
 * @param {string} database - Current diagram database (e.g. DB.GENERIC, DB.MYSQL).
 * @param {string} type - Field type name (e.g. "INT", "MYPRIMETYPE").
 * @returns {object | null} Type metadata object or null if unknown.
 */
```

---

### B. `src/utils/generateSampleData.js`

**Find:** `export function generateSampleData(tables, relationships, database, options = {}) {`  
**Add above it:**

```js
/**
 * Generates sample rows for all tables in the diagram with type-aware values
 * and FK-aware ordering (parent tables before children, FK columns filled with
 * valid parent IDs).
 *
 * @param {Array<{ id: string, name: string, fields: Array }>} tables - Diagram tables.
 * @param {Array} relationships - Diagram relationships (for FK and ordering).
 * @param {string} database - Diagram database (e.g. DB.GENERIC).
 * @param {{ rowsPerTable?: number, format?: 'json'|'csv'|'sql' }} [options] - Options.
 * @param {number} [options.rowsPerTable=5] - Number of rows to generate per table.
 * @param {string} [options.format='json'] - Output format: 'json', 'csv', or 'sql'.
 * @returns {{ data: string, extension: string }} Serialized data and file extension.
 */
```

**Find:** `function getMyPrimeTypeCheck(quotedColumnName)` in **`src/utils/exportSQL/generic.js`** (if it exists there)  
If that helper is in `generic.js`, add above it:

```js
/**
 * Returns a CHECK constraint string restricting the column to MYPRIMETYPE allowed primes.
 *
 * @param {string} quotedColumnName - Column name with dialect-specific quoting (e.g. "col" or `col`).
 * @returns {string} CHECK(...) clause string.
 */
```

---

### C. `src/components/EditorHeader/Modal/GenerateSampleData.jsx`

**Find:** `export default function GenerateSampleData({ setExportData, setModal, title }) {`  
**Add above it:**

```js
/**
 * Modal content for generating sample data from diagram tables. Lets the user
 * choose rows per table and format (JSON/CSV/SQL), then generates data and
 * opens the export preview modal for download.
 *
 * @param {Object} props
 * @param {Function} props.setExportData - Setter for export payload (data, extension, filename).
 * @param {Function} props.setModal - Setter to switch to MODAL.CODE after generating.
 * @param {string} [props.title] - Diagram title used for the default filename.
 */
```

---

### D. Optional: helpers in `generateSampleData.js`

If Code Rabbit still reports low coverage, add short docstrings above internal helpers:

**Above `function generateValueForField(...)`:**

```js
/**
 * Generates a single sample value for a field based on its type and metadata.
 *
 * @param {Object} field - Field definition (name, type, default, values, etc.).
 * @param {number} tableIndex - Index of the table (for stable placeholders).
 * @param {number} rowIndex - Row index (for increment and placeholders).
 * @param {string} database - Diagram database.
 * @param {Map} generatedIdsByTable - Map of table id -> array of generated PK values.
 * @returns {string|number|boolean|null|object} Generated value.
 */
```

**Above `function topologicalSort(tables, relationships)`:**

```js
/**
 * Returns table indices in an order that respects FKs (referenced tables before referencers).
 *
 * @param {Array} tables - Diagram tables.
 * @param {Array} relationships - Diagram relationships.
 * @returns {number[]} Indices of tables in dependency order.
 */
```

---

## Summary

| Item              | Action |
|-------------------|--------|
| Title check       | Set PR title to **Add MYPRIMETYPE datatype and generate sample data feature** (or the longer variant). |
| Docstring coverage| Add the JSDoc blocks above to `getTypeMeta`, `generateSampleData`, `GenerateSampleData`, and optionally the internal helpers in `generateSampleData.js`. |

After adding docstrings, re-run the Code Rabbit check (or push a new commit) to confirm coverage meets the 80% threshold.
