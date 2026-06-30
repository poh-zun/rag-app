from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest
from app.services.rag import rag_stream

router = APIRouter(prefix="/chat", tags=["chat"])


def event_stream(question: str, doc_id: str | None):
    for token in rag_stream(question, doc_id):
        # Server-Sent Events format
        yield f"data: {token}\n\n"
    yield "data: [DONE]\n\n"


@router.post("/")
def chat(request: ChatRequest):
    return StreamingResponse(
        event_stream(request.question, request.document_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
