import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from services.rag_service import RAGService
from services.resume_service import ResumeService
from utils.document_parser import DocumentParser

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

class RoadmapRequest(BaseModel):
    skills: str
    target_role: str

class InterviewRequest(BaseModel):
    company: str
    role: str
    difficulty: str

@router.post("/upload/knowledge")
async def upload_knowledge(file: UploadFile = File(...), category: str = Form("general")):
    """Upload a file to the knowledge base (RAG)."""
    try:
        logger.info(f"Received upload request for {file.filename}")
        
        # Check duplicate
        if RAGService.is_document_uploaded(file.filename):
            logger.warning(f"File {file.filename} is already uploaded.")
            raise ValueError(f"File {file.filename} is already uploaded.")
            
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save to disk
        file_path = os.path.join(upload_dir, file.filename)
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
            
        logger.info(f"File saved to disk at {file_path}")

        # Process and store
        chunks_stored = RAGService.process_and_store_document(
            contents, 
            file.filename, 
            category, 
            file_path=file_path, 
            file_size=file.size if file.size else len(contents)
        )
        return {"message": "Document processed successfully", "chunks": chunks_stored, "filename": file.filename}
    except ValueError as ve:
        logger.error(f"Validation error during upload: {ve}")
        # Return 409 Conflict if duplicate, 400 Bad Request otherwise
        status_code = status.HTTP_409_CONFLICT if "already uploaded" in str(ve) else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=str(ve))
    except Exception as e:
        logger.error(f"Internal server error during upload: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal error occurred: {str(e)}")

@router.post("/chat")
async def chat_with_knowledge(request: ChatRequest):
    """Chat with the AI using RAG context."""
    try:
        result = RAGService.query_knowledge_base(request.query)
        return result
    except ValueError as ve:
        logger.error(f"Validation error in chat_with_knowledge: {ve}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Error in chat_with_knowledge: {e}")
        return {"error": "An unexpected error occurred while processing your request."}

@router.post("/analyze/resume")
async def analyze_resume(resume: UploadFile = File(...), jd: Optional[UploadFile] = File(None)):
    """Analyze resume for ATS score, optionally against a JD."""
    try:
        resume_bytes = await resume.read()
        resume_text = DocumentParser.parse_file(resume_bytes, resume.filename)
        
        if not resume_text:
            return {"error": "Could not extract readable text from the resume. Please try a different PDF or DOCX file."}
        
        jd_text = None
        if jd:
            jd_bytes = await jd.read()
            jd_text = DocumentParser.parse_file(jd_bytes, jd.filename)
            
        analysis = ResumeService.analyze_resume(resume_text, jd_text)
        
        if "error" in analysis:
            return analysis
            
        return analysis
    except ValueError as ve:
        logger.error(f"Validation error in analyze_resume: {ve}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Error in analyze_resume: {e}")
        return {"error": str(e)}

@router.post("/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    """Generate career roadmap based on skills."""
    try:
        roadmap = ResumeService.generate_roadmap(request.skills, request.target_role)
        
        if "error" in roadmap:
            return roadmap
            
        return roadmap
    except ValueError as ve:
        logger.error(f"Validation error in generate_roadmap: {ve}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Error in generate_roadmap: {e}")
        return {"error": "An unexpected error occurred while generating the roadmap."}

@router.get("/status")
async def get_system_status():
    """Get system and API status."""
    try:
        docs = RAGService.get_uploaded_documents()
        return {
            "status": "Online",
            "gemini_api": "Connected",
            "chroma_db": "Connected",
            "knowledge_base_count": len(docs)
        }
    except Exception as e:
        return {"status": "Error", "detail": str(e)}

@router.get("/knowledge")
async def get_knowledge_base():
    """Get all uploaded documents."""
    try:
        return RAGService.get_uploaded_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/knowledge/{filename}")
async def delete_knowledge_document(filename: str):
    """Delete a document by filename."""
    try:
        RAGService.delete_document(filename)
        return {"message": f"Deleted {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview")
async def generate_interview(request: InterviewRequest):
    """Generate interview prep questions."""
    try:
        result = ResumeService.generate_interview_questions(request.company, request.role, request.difficulty)
        
        if "error" in result:
            return result
            
        return result
    except ValueError as ve:
        logger.error(f"Validation error in generate_interview: {ve}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Error in generate_interview: {e}")
        return {"error": "An unexpected error occurred while generating interview questions."}
