import os
import io
import docx
from PyPDF2 import PdfReader

class DocumentParser:
    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> str:
        """Parse file content based on extension."""
        if not file_bytes:
            raise ValueError("File is empty.")
            
        ext = os.path.splitext(filename)[1].lower()
        
        try:
            if ext == '.pdf':
                text = DocumentParser._parse_pdf(file_bytes)
            elif ext == '.docx':
                text = DocumentParser._parse_docx(file_bytes)
            elif ext == '.txt':
                text = DocumentParser._parse_txt(file_bytes)
            else:
                raise ValueError(f"Unsupported file format: {ext}")
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to parse document. It might be corrupted. Details: {str(e)}")

    @staticmethod
    def _parse_pdf(file_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    @staticmethod
    def _parse_docx(file_bytes: bytes) -> str:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text

    @staticmethod
    def _parse_txt(file_bytes: bytes) -> str:
        return file_bytes.decode("utf-8", errors="ignore")
