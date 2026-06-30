import { useState, useRef, useEffect } from "react";
import { streamChat } from "../api/chat";

export default function ChatWindow({ selectedDocumentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || streaming) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);

    // Add an empty assistant message that we'll stream into
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
    setStreaming(true);

    streamChat({
      question,
      documentId: selectedDocumentId,
      onToken: (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: updated[updated.length - 1].text + token,
          };
          return updated;
        });
      },
      onDone: () => setStreaming(false),
      onError: (err) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", text: `Error: ${err}` };
          return updated;
        });
        setStreaming(false);
      },
    });
  }

  return (
    <div style={styles.container}>
      {selectedDocumentId && (
        <p style={styles.hint}>Searching in selected document only. Click the document again to deselect.</p>
      )}

      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.empty}>Ask a question about your uploaded documents.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.bubble, ...(msg.role === "user" ? styles.user : styles.assistant) }}>
            <p style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          disabled={streaming}
        />
        <button onClick={handleSend} disabled={streaming || !input.trim()} style={styles.sendBtn}>
          {streaming ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100%", gap: 12 },
  hint: { fontSize: 12, color: "#2563eb", background: "#dbeafe", padding: "6px 10px", borderRadius: 6 },
  messages: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: 4 },
  empty: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 40 },
  bubble: { maxWidth: "80%", padding: "10px 14px", borderRadius: 10 },
  user: { alignSelf: "flex-end", background: "#2563eb", color: "#fff" },
  assistant: { alignSelf: "flex-start", background: "#fff", border: "1px solid #e5e7eb" },
  inputRow: { display: "flex", gap: 8 },
  input: {
    flex: 1, padding: "10px 12px", borderRadius: 8,
    border: "1px solid #d1d5db", fontSize: 14, outline: "none",
  },
  sendBtn: { background: "#2563eb", color: "#fff", borderRadius: 8, padding: "10px 20px" },
};
