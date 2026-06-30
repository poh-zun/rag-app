import re
from app.config import settings


def extract_text_from_file(filepath: str, filename: str) -> str:
    """Extract raw text from supported file types."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "txt":
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()

    if ext == "pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(filepath)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            raise ValueError("pypdf not installed. Run: pip install pypdf")

    raise ValueError(f"Unsupported file type: .{ext}")


def split_into_chunks(text: str) -> list[str]:
    """Split text into overlapping chunks by word count."""
    words = text.split()
    size = settings.chunk_size
    overlap = settings.chunk_overlap
    chunks = []
    start = 0

    while start < len(words):
        end = start + size
        chunk = " ".join(words[start:end])
        chunks.append(chunk.strip())
        start += size - overlap

    return [c for c in chunks if c]
