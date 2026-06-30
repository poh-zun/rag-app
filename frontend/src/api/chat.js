const BASE = "http://localhost:8000";

export function streamChat({ question, documentId, history, onToken, onDone, onError }) {
  fetch(`${BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      document_id: documentId || null,
      history: history || [],
    }),
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
        buffer = lines.pop();

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
