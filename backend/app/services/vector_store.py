import chromadb
from app.config import settings

_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
_collection = _client.get_or_create_collection(name="documents")


def add_document_chunks(doc_id: str, filename: str, chunks: list[str], embeddings: list[list[float]]):
    _collection.add(
        ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
        embeddings=embeddings,
        documents=chunks,
        metadatas=[{"doc_id": doc_id, "filename": filename, "chunk_index": i} for i in range(len(chunks))],
    )


def query_similar_chunks(query_embedding: list[float], doc_id: str | None = None, top_k: int = 4) -> list[dict]:
    where = {"doc_id": doc_id} if doc_id else None
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"],
    )
    chunks = []
    for text, meta, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append({"text": text, "metadata": meta, "score": 1 - distance})
    return chunks


def delete_document(doc_id: str):
    results = _collection.get(where={"doc_id": doc_id})
    if results["ids"]:
        _collection.delete(ids=results["ids"])


def list_documents() -> list[dict]:
    results = _collection.get(include=["metadatas"])
    seen = {}
    for meta in results["metadatas"]:
        doc_id = meta["doc_id"]
        if doc_id not in seen:
            seen[doc_id] = {"id": doc_id, "filename": meta["filename"], "chunk_count": 0}
        seen[doc_id]["chunk_count"] += 1
    return list(seen.values())
