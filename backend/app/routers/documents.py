import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.services.chunker import extract_text_from_file, split_into_chunks
from app.services.embeddings import embed_texts
from app.services.vector_store import add_document_chunks, delete_document, list_documents
from app.models.schemas import DocumentInfo

router = APIRouter(prefix="/documents", tags=["documents"])

os.makedirs(settings.upload_dir, exist_ok=True)


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    allowed = {"txt", "pdf"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Only {allowed} files are supported.")

    doc_id = str(uuid.uuid4())
    filepath = os.path.join(settings.upload_dir, f"{doc_id}.{ext}")

    with open(filepath, "wb") as f:
        f.write(await file.read())

    try:
        text = extract_text_from_file(filepath, file.filename)
        chunks = split_into_chunks(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        embeddings = embed_texts(chunks)
        add_document_chunks(doc_id, file.filename, chunks, embeddings)
    except Exception as e:
        os.remove(filepath)
        raise HTTPException(status_code=500, detail=str(e))

    return DocumentInfo(id=doc_id, filename=file.filename, chunk_count=len(chunks))


@router.get("/", response_model=list[DocumentInfo])
def get_documents():
    return list_documents()


@router.delete("/{doc_id}")
def remove_document(doc_id: str):
    delete_document(doc_id)
    return {"message": "Document deleted."}
