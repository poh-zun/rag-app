import { useState, useEffect } from "react";
import { fetchDocuments } from "./api/documents";
import DocumentUpload from "./components/DocumentUpload";
import DocumentList from "./components/DocumentList";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(console.error);
  }, []);

  function handleUploaded(doc) {
    setDocuments((prev) => [...prev, doc]);
  }

  function handleDeleted(id) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h1 style={styles.title}>RAG App</h1>
        <DocumentUpload onUploaded={handleUploaded} />
        <hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />
        <h2 style={styles.sectionTitle}>Documents</h2>
        <DocumentList
          documents={documents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDeleted={handleDeleted}
        />
      </aside>

      <main style={styles.main}>
        <ChatWindow selectedDocumentId={selectedId} />
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", height: "100vh" },
  sidebar: {
    width: 280,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  title: { fontSize: 20, fontWeight: 700 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" },
  main: { flex: 1, padding: 24, display: "flex", flexDirection: "column" },
};
