import { useMemo, useState } from "react";
import YAML from "js-yaml";
import { useQueryClient } from "@tanstack/react-query";
import { useAttractions } from "../hooks/useAttractions";
import { upsertAttractions } from "../api/attractions";
import type { Attraction } from "../types/attraction";
import styles from "./AdminPage.module.css";
import { useRecordVisit } from "../hooks/useRecordVisit";

type Format = "yaml" | "json";

const formatters = {
  yaml: {
    serialize: (data: Attraction[]) => YAML.dump(data, { lineWidth: -1 }),
    parse: (value: string) => YAML.load(value) as Attraction[],
    label: "YAML",
  },
  json: {
    serialize: (data: Attraction[]) => JSON.stringify(data, null, 2),
    parse: (value: string) => JSON.parse(value) as Attraction[],
    label: "JSON",
  },
} satisfies Record<Format, { serialize: (data: Attraction[]) => string; parse: (text: string) => Attraction[]; label: string }>;

function AdminPage(): JSX.Element {
  useRecordVisit("admin");
  const queryClient = useQueryClient();
  const { data: attractions, isLoading, isError, refetch } = useAttractions();
  const [format, setFormat] = useState<Format>("yaml");
  const [editorValue, setEditorValue] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useMemo(() => {
    if (attractions) {
      setEditorValue(formatters[format].serialize(attractions));
    }
  }, [attractions, format]);

  const handleFormatChange = (next: Format) => {
    if (!attractions) return;
    setFormat(next);
    setEditorValue(formatters[next].serialize(attractions));
  };

  const handleReset = async () => {
    setStatusMessage(null);
    const result = await refetch();
    if (result.data) {
      setEditorValue(formatters[format].serialize(result.data));
      setStatusMessage("Reloaded attractions from the server.");
    }
  };

  const handleSave = async () => {
    if (!editorValue.trim()) return;
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const parsed = formatters[format].parse(editorValue);
      if (!Array.isArray(parsed)) {
        throw new Error("Parsed data is not an array.");
      }
      await upsertAttractions(parsed);
      await queryClient.invalidateQueries({ queryKey: ["attractions"] });
      setStatusMessage(`Saved ${parsed.length} attractions.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? `Save failed: ${error.message}` : "Save failed due to unexpected error.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!editorValue) return;
    const blob = new Blob([editorValue], {
      type: format === "yaml" ? "text/yaml" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attractions.${format === "yaml" ? "yaml" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <p>Loading attractions...</p>;
  }

  if (isError || !attractions) {
    return <p>Failed to load attractions. Please ensure the API is reachable.</p>;
  }

  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <div>
          <h1>Attraction Studio</h1>
          <p>Curate Echoes of Eternity experiences, markers, and AR assets in real time.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleReset} className={styles.secondaryButton}>
            Reload
          </button>
          <button type="button" onClick={handleDownload} className={styles.secondaryButton}>
            Download
          </button>
          <button type="button" onClick={handleSave} className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.preview}>
          <h2>Preview</h2>
          <ul>
            {attractions.map((attraction) => (
              <li key={attraction.id}>
                <strong>{attraction.name}</strong>
                <span>{attraction.type}</span>
                <p>{attraction.description}</p>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.editor}>
          <div className={styles.editorToolbar}>
            <span>Format</span>
            <div className={styles.segmented}>
              {(Object.keys(formatters) as Format[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.segment} ${key === format ? styles.segmentActive : ""}`}
                  onClick={() => handleFormatChange(key)}
                >
                  {formatters[key].label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className={styles.textarea}
            value={editorValue}
            spellCheck={false}
            onChange={(event) => setEditorValue(event.target.value)}
          />
          {statusMessage && <p className={styles.status}>{statusMessage}</p>}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;

