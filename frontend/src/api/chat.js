const BASE = "http://localhost:8000";

/**
 * Sends a question and streams the response via Server-Sent Events.
 * onToken is called for each text chunk; onDone is called when finished.
 */
export function streamChat({ question, documentId, onToken, onDone, onError }) {
  fetch(`${BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, document_id: documentId || null }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        onError(err.detail || "Chat request failed");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") { onDone(); return; }
          onToken(data);
        }
      }
      onDone();
    })
    .catch((err) => onError(err.message));
}
