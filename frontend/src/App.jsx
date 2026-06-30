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
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col gap-4 p-5 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">RAG App</h1>
        </div>

        <DocumentUpload onUploaded={handleUploaded} />

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Documents
          </p>
          <DocumentList
            documents={documents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDeleted={handleDeleted}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow selectedDocumentId={selectedId} />
      </main>
    </div>
  );
}
