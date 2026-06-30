import { deleteDocument } from "../api/documents";

export default function DocumentList({ documents, selectedId, onSelect, onDeleted }) {
  async function handleDelete(e, id) {
    e.stopPropagation();
    await deleteDocument(id);
    onDeleted(id);
  }

  if (!documents.length) {
    return <p style={{ color: "#888", fontSize: 13 }}>No documents yet. Upload one to start.</p>;
  }

  return (
    <ul style={styles.list}>
      {documents.map((doc) => (
        <li
          key={doc.id}
          onClick={() => onSelect(doc.id === selectedId ? null : doc.id)}
          style={{ ...styles.item, background: doc.id === selectedId ? "#dbeafe" : "#fff" }}
        >
          <div>
            <p style={styles.filename}>{doc.filename}</p>
            <p style={styles.meta}>{doc.chunk_count} chunks</p>
          </div>
          <button onClick={(e) => handleDelete(e, doc.id)} style={styles.deleteBtn}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

const styles = {
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  filename: { fontWeight: 500, fontSize: 14 },
  meta: { fontSize: 12, color: "#6b7280" },
  deleteBtn: { background: "#fee2e2", color: "#dc2626", fontSize: 12, padding: "4px 10px" },
};
