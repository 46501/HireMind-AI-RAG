import uuid
import logging
from typing import Any
from services.llm_service import LLMService
from db.chroma_client import ChromaDBService
from utils.chunking import ChunkingService
from utils.document_parser import DocumentParser

KNOWLEDGE_BASE_COLLECTION = "knowledge_base"
RESUME_COLLECTION = "resume_data"

logger = logging.getLogger(__name__)

class RAGService:
    @staticmethod
    def is_document_uploaded(filename: str) -> bool:
        """Check if a document is already uploaded."""
        return ChromaDBService.check_document_exists(KNOWLEDGE_BASE_COLLECTION, filename)

    @staticmethod
    def process_and_store_document(file_bytes: bytes, filename: str, category: str = "general"):
        """Process document and store its chunks in ChromaDB."""
        logger.info(f"Processing document: {filename}")
        
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
        ids = [str(uuid.uuid4()) for _ in chunks]
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
        return len(chunks)

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
        """Get a list of unique uploaded documents from ChromaDB."""
        results = ChromaDBService.get_all_documents(KNOWLEDGE_BASE_COLLECTION)
        metadatas = results.get('metadatas', [])
        
        unique_docs = {}
        for meta in metadatas:
            if not meta:
                continue
            filename = meta.get('filename')
            if filename and filename not in unique_docs:
                unique_docs[filename] = {
                    "filename": filename,
                    "category": meta.get('category', 'general'),
                    "chunks": 1
                }
            elif filename:
                unique_docs[filename]['chunks'] += 1
                
        return list(unique_docs.values())

    @staticmethod
    def delete_document(filename: str):
        """Delete a document and its chunks by filename."""
        return ChromaDBService.delete_documents_by_filename(KNOWLEDGE_BASE_COLLECTION, filename)
