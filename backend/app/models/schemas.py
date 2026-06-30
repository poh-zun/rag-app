from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    question: str
    document_id: str | None = None
    history: list[ChatMessage] = []


class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunk_count: int
