from google import genai
from google.genai import types
from app.config import settings
from app.services.embeddings import embed_query
from app.services.vector_store import query_similar_chunks
from typing import Iterator

client = genai.Client(api_key=settings.gemini_api_key)

SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions based only on the provided context. "
    "If the answer is not in the context, say \"I don't have enough information to answer that.\" "
    "Always be concise and accurate."
)


def build_context(chunks: list[dict]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk["metadata"]["filename"]
        parts.append(f"[Source {i} - {source}]\n{chunk['text']}")
    return "\n\n".join(parts)


def rag_stream(question: str, doc_id: str | None, history: list) -> Iterator[str]:
    query_embedding = embed_query(question)
    chunks = query_similar_chunks(query_embedding, doc_id=doc_id, top_k=settings.top_k_results)

    if not chunks:
        yield "No relevant documents found. Please upload a document first."
        return

    context = build_context(chunks)
    sources = list({c["metadata"]["filename"] for c in chunks})

    # Build conversation history for Gemini
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.text)]))

    # Append current question with context
    contents.append(types.Content(
        role="user",
        parts=[types.Part(text=f"Context:\n{context}\n\nQuestion: {question}")]
    ))

    stream = client.models.generate_content_stream(
        model="gemini-1.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    )

    for chunk in stream:
        if chunk.text:
            yield chunk.text

    yield f"\n\n**Sources:** {', '.join(sources)}"
