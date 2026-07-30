import sqlite3
import os
import logging
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), 'documents.db')

class ChatStore:
    @staticmethod
    def _get_connection():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init_db():
        """Initialize the SQLite database schema for chat messages."""
        try:
            with ChatStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS chat_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        sources TEXT,
                        timestamp TEXT NOT NULL
                    )
                """)
                conn.commit()
                logger.info("Initialized Chat Store database.")
        except Exception as e:
            logger.error(f"Failed to initialize chat database: {e}")

    @staticmethod
    def add_message(role: str, content: str, sources: Optional[List[Any]] = None) -> bool:
        """Add a new chat message to the store."""
        try:
            with ChatStore._get_connection() as conn:
                cursor = conn.cursor()
                timestamp = datetime.now().isoformat()
                sources_json = json.dumps(sources) if sources else None
                
                cursor.execute("""
                    INSERT INTO chat_messages (role, content, sources, timestamp)
                    VALUES (?, ?, ?, ?)
                """, (role, content, sources_json, timestamp))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error adding chat message: {e}")
            return False

    @staticmethod
    def get_all_messages() -> List[Dict[str, Any]]:
        """Retrieve all chat messages in chronological order."""
        try:
            with ChatStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM chat_messages ORDER BY timestamp ASC")
                rows = cursor.fetchall()
                messages = []
                for row in rows:
                    msg = dict(row)
                    if msg.get('sources'):
                        try:
                            msg['sources'] = json.loads(msg['sources'])
                        except:
                            msg['sources'] = []
                    else:
                        msg['sources'] = []
                    messages.append(msg)
                return messages
        except Exception as e:
            logger.error(f"Error fetching chat messages: {e}")
            return []

    @staticmethod
    def clear_messages() -> bool:
        """Clear the entire chat history."""
        try:
            with ChatStore._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM chat_messages")
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error clearing chat messages: {e}")
            return False
