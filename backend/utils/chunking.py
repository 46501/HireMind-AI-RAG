import re

class ChunkingService:
    @staticmethod
    def chunk_text(text: str, max_chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        """
        Intelligent chunking strategy:
        Splits by paragraphs and headings to preserve context.
        Aggregates them into chunks of max_chunk_size.
        Adds overlap between chunks.
        """
        # Split by double newline (paragraphs/headings)
        paragraphs = re.split(r'\n\s*\n', text)
        
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
                
            # If a single paragraph is too large, we fall back to sentence splitting
            if len(paragraph) > max_chunk_size:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) < max_chunk_size:
                        current_chunk += sentence + " "
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + " "
            else:
                if len(current_chunk) + len(paragraph) < max_chunk_size:
                    current_chunk += paragraph + "\n\n"
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = paragraph + "\n\n"
                    
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        # Add overlap
        overlapped_chunks = []
        for i in range(len(chunks)):
            if i == 0:
                overlapped_chunks.append(chunks[i])
            else:
                # Take the last 'overlap' characters from the previous chunk
                prev_overlap = chunks[i-1][-overlap:] if len(chunks[i-1]) > overlap else chunks[i-1]
                overlapped_chunks.append(prev_overlap + " " + chunks[i])
                
        return overlapped_chunks
