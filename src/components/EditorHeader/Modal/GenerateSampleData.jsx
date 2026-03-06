import { useState } from "react";
import { Button, InputNumber, Select } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useDiagram } from "../../../hooks";
import { generateSampleData } from "../../../utils/generateSampleData";
import { MODAL } from "../../../data/constants";

const FORMAT_OPTIONS = [
  { label: "JSON", value: "json" },
  { label: "CSV", value: "csv" },
  { label: "SQL", value: "sql" },
];

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
export default function GenerateSampleData({ setExportData, setModal, title }) {
  const { t } = useTranslation();
  const { tables, relationships, database } = useDiagram();
  const [rowsPerTable, setRowsPerTable] = useState(5);
  const [format, setFormat] = useState("json");

  const handleGenerate = () => {
    const { data, extension } = generateSampleData(
      tables,
      relationships,
      database,
      { rowsPerTable, format },
    );
    setExportData((prev) => ({
      ...prev,
      data,
      extension,
      filename: `${title || "diagram"}_sample_data`,
    }));
    setModal(MODAL.CODE);
  };

  const hasTables = tables && tables.length > 0;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div>
        <label className="font-semibold block mb-1">{t("sample_data_rows_per_table")}</label>
        <InputNumber
          min={1}
          max={1000}
          value={rowsPerTable}
          onChange={setRowsPerTable}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label className="font-semibold block mb-1">{t("sample_data_format")}</label>
        <Select
          optionList={FORMAT_OPTIONS}
          value={format}
          onChange={setFormat}
          style={{ width: "100%" }}
        />
      </div>
      {!hasTables && (
        <p className="text-amber-600 text-sm">{t("sample_data_no_tables")}</p>
      )}
      <Button
        theme="solid"
        type="primary"
        onClick={handleGenerate}
        disabled={!hasTables}
      >
        {t("sample_data_generate")}
      </Button>
    </div>
  );
}
