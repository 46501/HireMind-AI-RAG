import sqlite3
import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), 'documents.db')

class JobStore:
    @staticmethod
    def _get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initialize the SQLite database schema for job applications."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS jobs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        company TEXT NOT NULL,
                        role TEXT NOT NULL,
                        status TEXT NOT NULL,
                        salary TEXT,
                        notes TEXT,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                """)
                conn.commit()
                logger.info("Initialized Job Store database.")
        except Exception as e:
            logger.error(f"Failed to initialize Job database: {e}")

    @staticmethod
    def add_job(company: str, role: str, status: str, salary: str = "", notes: str = "") -> Optional[Dict[str, Any]]:
        """Add a new job application."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                now = datetime.now().isoformat()
                
                cursor.execute("""
                    INSERT INTO jobs (company, role, status, salary, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (company, role, status, salary, notes, now, now))
                conn.commit()
                
                return JobStore.get_job(cursor.lastrowid)
        except Exception as e:
            logger.error(f"Error adding job: {e}")
            return None

    @staticmethod
    def get_job(job_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve a specific job."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error fetching job: {e}")
            return None

    @staticmethod
    def get_all_jobs() -> List[Dict[str, Any]]:
        """Retrieve all job applications."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM jobs ORDER BY updated_at DESC")
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Error fetching all jobs: {e}")
            return []

    @staticmethod
    def update_job_status(job_id: int, new_status: str) -> bool:
        """Update the status of a job."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                now = datetime.now().isoformat()
                cursor.execute("""
                    UPDATE jobs 
                    SET status = ?, updated_at = ?
                    WHERE id = ?
                """, (new_status, now, job_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error updating job status: {e}")
            return False

    @staticmethod
    def delete_job(job_id: int) -> bool:
        """Delete a job."""
        try:
            with JobStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting job: {e}")
            return False
