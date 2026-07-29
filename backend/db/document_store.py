import sqlite3
import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), 'documents.db')

class DocumentStore:
    @staticmethod
    def _get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initialize the SQLite database schema."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS documents (
                        id TEXT PRIMARY KEY,
                        filename TEXT UNIQUE NOT NULL,
                        path TEXT NOT NULL,
                        upload_date TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        category TEXT NOT NULL,
                        chunks INTEGER DEFAULT 0,
                        status TEXT NOT NULL
                    )
                """)
                conn.commit()
                logger.info("Initialized Document Store database.")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

    @staticmethod
    def add_document(doc_id: str, filename: str, path: str, file_size: int, category: str, status: str = "processing"):
        """Add a new document record."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                upload_date = datetime.now().isoformat()
                cursor.execute("""
                    INSERT INTO documents (id, filename, path, upload_date, file_size, category, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (doc_id, filename, path, upload_date, file_size, category, status))
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            logger.warning(f"Document {filename} already exists in DB.")
            return False
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return False

    @staticmethod
    def update_document(filename: str, chunks: int, status: str):
        """Update chunks and status of a document."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE documents
                    SET chunks = ?, status = ?
                    WHERE filename = ?
                """, (chunks, status, filename))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error updating document: {e}")
            return False

    @staticmethod
    def get_all_documents() -> List[Dict[str, Any]]:
        """Retrieve all documents."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM documents ORDER BY upload_date DESC")
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Error fetching documents: {e}")
            return []

    @staticmethod
    def get_document_by_filename(filename: str) -> Optional[Dict[str, Any]]:
        """Retrieve a document by filename."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM documents WHERE filename = ?", (filename,))
                row = cursor.fetchone()
                if row:
                    return dict(row)
                return None
        except Exception as e:
            logger.error(f"Error fetching document {filename}: {e}")
            return None

    @staticmethod
    def delete_document(filename: str) -> bool:
        """Delete a document record."""
        try:
            with DocumentStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM documents WHERE filename = ?", (filename,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
