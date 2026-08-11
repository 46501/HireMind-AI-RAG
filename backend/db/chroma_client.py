import chromadb
from chromadb.config import Settings as ChromaSettings
from core.config import settings

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)

class ChromaDBService:
    _collections = {}

    @staticmethod
    def get_or_create_collection(collection_name: str):
        """Retrieve an existing collection or create a new one."""
        if collection_name not in ChromaDBService._collections:
            # Using cosine distance for embeddings similarity
            ChromaDBService._collections[collection_name] = chroma_client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return ChromaDBService._collections[collection_name]

    @staticmethod
    def add_documents(collection_name: str, ids: list[str], embeddings: list[list[float]], metadatas: list[dict], documents: list[str]):
        """Add chunks, their embeddings and metadata to a specific collection."""
        collection = ChromaDBService.get_or_create_collection(collection_name)
        
        # ChromaDB requires batches for huge inserts, but for small files we can insert directly.
        collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )
        return True

    @staticmethod
    def search_documents(collection_name: str, query_embedding: list[float], n_results: int = 5, where: dict = None):
        """Search the collection for similar documents using the query embedding."""
        collection = ChromaDBService.get_or_create_collection(collection_name)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where, # Optional filter metadata
            include=['documents', 'metadatas', 'distances']
        )
        return results

    @staticmethod
    def check_document_exists(collection_name: str, filename: str) -> bool:
        """Check if a document exists by filename."""
        collection = ChromaDBService.get_or_create_collection(collection_name)
        results = collection.get(where={"filename": filename}, limit=1, include=["metadatas"])
        return len(results.get("ids", [])) > 0
    @staticmethod
    def get_all_documents(collection_name: str):
        """Retrieve all documents' metadata from a collection."""
        collection = ChromaDBService.get_or_create_collection(collection_name)
        return collection.get(include=['metadatas'])

    @staticmethod
    def delete_documents_by_filename(collection_name: str, filename: str):
        """Delete all chunks associated with a specific file."""
        collection = ChromaDBService.get_or_create_collection(collection_name)
        collection.delete(where={"filename": filename})
        return True
