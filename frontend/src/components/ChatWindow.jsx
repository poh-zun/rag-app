import { useState, useRef, useEffect } from "react";
import { streamChat } from "../api/chat";
import Markdown from "react-markdown";

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

    // Snapshot history before adding the new messages
    const history = messages.filter((m) => m.text.trim() !== "");

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
    setStreaming(true);

    streamChat({
      question,
      documentId: selectedDocumentId,
      history,
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
    <div className="flex flex-col h-full">
      {selectedDocumentId && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-600 font-medium">
            Searching in selected document only — click the document again to deselect.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Ask a question about your uploaded documents.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm prose prose-sm max-w-none"
              }`}>
              {msg.role === "user" ? msg.text : (
                <Markdown>{msg.text}</Markdown>
              )}
              {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3 items-end">
          <input
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:bg-gray-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {streaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
