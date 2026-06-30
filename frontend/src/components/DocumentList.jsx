import { deleteDocument } from "../api/documents";

export default function DocumentList({ documents, selectedId, onSelect, onDeleted }) {
  async function handleDelete(e, id) {
    e.stopPropagation();
    await deleteDocument(id);
    onDeleted(id);
  }

  if (!documents.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No documents yet. Upload one to start.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          onClick={() => onSelect(doc.id === selectedId ? null : doc.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
            ${doc.id === selectedId
              ? "bg-blue-50 border-blue-200"
              : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
            <p className="text-xs text-gray-400">{doc.chunk_count} chunks</p>
          </div>
          <button
            onClick={(e) => handleDelete(e, doc.id)}
            className="ml-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors shrink-0"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
