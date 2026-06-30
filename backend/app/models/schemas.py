from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    document_id: str | None = None  # None = search all docs


class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunk_count: int
