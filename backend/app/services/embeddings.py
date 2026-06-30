from google import genai
from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

EMBEDDING_MODEL = "gemini-embedding-001"


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [embed_query(t) for t in texts]


def embed_query(query: str) -> list[float]:
    result = client.models.embed_content(model=EMBEDDING_MODEL, contents=query)
    return result.embeddings[0].values
