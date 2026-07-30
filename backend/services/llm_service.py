import google.generativeai as genai
from core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# Use a fast model for general text tasks and a standard model for embeddings
# Adjust model names as per current Gemini API availability (e.g., gemini-3.5-flash, text-embedding-004)
LLM_MODEL_NAME = "gemini-3.5-flash"
EMBEDDING_MODEL_NAME = "models/gemini-embedding-2"

class LLMService:
    @staticmethod
    def get_embeddings(texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a list of texts."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
        if not texts:
            return []
            
        result = genai.embed_content(
            model=EMBEDDING_MODEL_NAME,
            content=texts,
            task_type="retrieval_document"
        )
        return result['embedding']
        
    @staticmethod
    def get_query_embedding(query: str) -> list[float]:
        """Generate embedding for a user query."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL_NAME,
                content=query,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            if "429" in str(e):
                raise ValueError("API rate limit exceeded. Please try again in a minute.")
            raise

    @staticmethod
    def generate_content(prompt: str) -> str:
        """Generate content from Gemini model based on a prompt."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        model = genai.GenerativeModel(LLM_MODEL_NAME)
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            if "429" in str(e):
                raise ValueError("API rate limit exceeded. Please try again in a minute.")
            raise
