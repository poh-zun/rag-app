import { useState } from "react";
import { uploadDocument } from "../api/documents";

export default function DocumentUpload({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const doc = await uploadDocument(file);
      onUploaded(doc);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        {uploading ? "Uploading..." : "Upload PDF or TXT"}
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    display: "inline-block",
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    textAlign: "center",
  },
  error: { color: "#dc2626", fontSize: 13 },
};
