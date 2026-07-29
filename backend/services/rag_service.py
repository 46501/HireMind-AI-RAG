import uuid
import logging
import os
from typing import Any
from services.llm_service import LLMService
from db.chroma_client import ChromaDBService
from db.document_store import DocumentStore
from utils.chunking import ChunkingService
from utils.document_parser import DocumentParser

KNOWLEDGE_BASE_COLLECTION = "knowledge_base"
RESUME_COLLECTION = "resume_data"

logger = logging.getLogger(__name__)

class RAGService:
    @staticmethod
    def is_document_uploaded(filename: str) -> bool:
        """Check if a document is already uploaded in DB."""
        return DocumentStore.get_document_by_filename(filename) is not None

    @staticmethod
    def process_and_store_document(file_bytes: bytes, filename: str, category: str = "general", file_path: str = "", file_size: int = 0):
        """Process document and store its chunks in ChromaDB, and metadata in SQLite."""
        logger.info(f"Processing document: {filename}")
        
        # Add to Document Store (status: processing)
        doc_id = str(uuid.uuid4())
        DocumentStore.add_document(doc_id, filename, file_path, file_size, category, status="processing")
        
        try:
            # 1. Parse document
            text = DocumentParser.parse_file(file_bytes, filename)
            if not text:
                logger.error(f"Extracted text is empty for {filename}")
                raise ValueError("Extracted text is empty. File may be corrupted or contains no readable text.")
            
            # 2. Chunk text
            chunks = ChunkingService.chunk_text(text)
            
            if not chunks:
                logger.error(f"No valid text chunks could be created for {filename}")
                raise ValueError("No valid text chunks could be created from the document.")
                
            logger.info(f"Generated {len(chunks)} chunks for {filename}. Generating embeddings...")
            
            # 3. Generate embeddings
            embeddings = LLMService.get_embeddings(chunks)
            
            # 4. Prepare metadata and ids
            ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
            metadatas = [{"filename": filename, "category": category, "chunk_index": i} for i in range(len(chunks))]
            
            # 5. Store in ChromaDB
            ChromaDBService.add_documents(
                collection_name=KNOWLEDGE_BASE_COLLECTION,
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=chunks
            )
            
            logger.info(f"Successfully stored {len(chunks)} chunks for {filename} in ChromaDB.")
            
            # Update Document Store (status: indexed)
            DocumentStore.update_document(filename, chunks=len(chunks), status="indexed")
            
            return len(chunks)
        except Exception as e:
            logger.error(f"Error processing document {filename}: {e}")
            # Update Document Store (status: error)
            DocumentStore.update_document(filename, chunks=0, status="error")
            raise

    @staticmethod
    def query_knowledge_base(query: str, n_results: int = 3):
        """Query the knowledge base and return augmented answer."""
        # 1. Generate query embedding
        query_embedding = LLMService.get_query_embedding(query)
        
        # 2. Search ChromaDB
        results = ChromaDBService.search_documents(
            collection_name=KNOWLEDGE_BASE_COLLECTION,
            query_embedding=query_embedding,
            n_results=n_results
        )
        
        if not results.get('documents') or not results['documents'][0]:
            return {
                "answer": "The answer was not found in the uploaded documents.",
                "sources": []
            }
            
        # 3. Construct prompt with context
        context_chunks = results['documents'][0]
        sources = results['metadatas'][0]
        
        context_text = "\n\n".join([f"--- Source: {sources[i]['filename']} ---\n{chunk}" for i, chunk in enumerate(context_chunks)])
        
        prompt = f"""
You are an expert Career Coach and AI Assistant. 
Answer the user's question based strictly on the provided context from their knowledge base.
If the information is not present in the context, say "The answer was not found in the uploaded documents." Do not hallucinate outside the context.

Context:
{context_text}

User Question: {query}
"""
        
        # 4. Generate answer using Gemini
        answer = LLMService.generate_content(prompt)
        
        return {
            "answer": answer,
            "sources": sources
        }

    @staticmethod
    def get_uploaded_documents():
        """Get a list of uploaded documents from DocumentStore."""
        return DocumentStore.get_all_documents()

    @staticmethod
    def delete_document(filename: str):
        """Delete a document and its chunks by filename."""
        doc = DocumentStore.get_document_by_filename(filename)
        
        # 1. Delete from ChromaDB
        ChromaDBService.delete_documents_by_filename(KNOWLEDGE_BASE_COLLECTION, filename)
        
        # 2. Delete from Document Store
        DocumentStore.delete_document(filename)
        
        # 3. Delete physical file
        if doc and doc.get("path") and os.path.exists(doc["path"]):
            try:
                os.remove(doc["path"])
                logger.info(f"Deleted file from disk: {doc['path']}")
            except Exception as e:
                logger.error(f"Error deleting file {doc['path']}: {e}")
                
        return True
