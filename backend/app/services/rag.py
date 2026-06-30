from openai import OpenAI
from app.config import settings
from app.services.embeddings import embed_query
from app.services.vector_store import query_similar_chunks
from typing import Iterator

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based only on the provided context.
If the answer is not in the context, say "I don't have enough information to answer that."
Always be concise and accurate."""


def build_context(chunks: list[dict]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk["metadata"]["filename"]
        parts.append(f"[Source {i} - {source}]\n{chunk['text']}")
    return "\n\n".join(parts)


def rag_stream(question: str, doc_id: str | None = None) -> Iterator[str]:
    """Retrieve relevant chunks and stream the LLM answer."""
    query_embedding = embed_query(question)
    chunks = query_similar_chunks(query_embedding, doc_id=doc_id, top_k=settings.top_k_results)

    if not chunks:
        yield "No relevant documents found. Please upload a document first."
        return

    context = build_context(chunks)
    sources = list({c["metadata"]["filename"] for c in chunks})

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
    ]

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        stream=True,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

    # Send sources as a final SSE event
    yield f"\n\n**Sources:** {', '.join(sources)}"
