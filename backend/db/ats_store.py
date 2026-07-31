import sqlite3
import os
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), 'documents.db')

class AtsStore:
    @staticmethod
    def _get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initialize the SQLite database schema for ATS analyses."""
        try:
            with AtsStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ats_analyses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        filename TEXT NOT NULL,
                        overall_score INTEGER NOT NULL,
                        analysis_data TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    )
                """)
                conn.commit()
                logger.info("Initialized ATS Store database.")
        except Exception as e:
            logger.error(f"Failed to initialize ATS database: {e}")

    @staticmethod
    def save_analysis(filename: str, overall_score: int, analysis_data: dict) -> bool:
        """Save a new ATS analysis to the store."""
        try:
            with AtsStore._get_connection() as conn:
                cursor = conn.cursor()
                created_at = datetime.now().isoformat()
                analysis_json = json.dumps(analysis_data)
                
                cursor.execute("""
                    INSERT INTO ats_analyses (filename, overall_score, analysis_data, created_at)
                    VALUES (?, ?, ?, ?)
                """, (filename, overall_score, analysis_json, created_at))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving ATS analysis: {e}")
            return False

    @staticmethod
    def get_latest_analysis() -> Optional[Dict[str, Any]]:
        """Retrieve the most recent ATS analysis."""
        try:
            with AtsStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM ats_analyses ORDER BY created_at DESC LIMIT 1")
                row = cursor.fetchone()
                
                if row:
                    data = dict(row)
                    try:
                        data['analysis_data'] = json.loads(data['analysis_data'])
                    except Exception as e:
                        logger.error(f"Error parsing analysis JSON: {e}")
                        data['analysis_data'] = {}
                    return data
                return None
        except Exception as e:
            logger.error(f"Error fetching latest ATS analysis: {e}")
            return None
