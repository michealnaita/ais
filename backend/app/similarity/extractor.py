
from docx import Document


DEFAULT_MIN_WORDS = 30


def extract_paragraphs(file_path):
    
    if not str(file_path).lower().endswith(".docx"):
        raise ValueError("Only .docx files are supported: " + str(file_path))

    document = Document(file_path)
    paragraphs = []
    for para in document.paragraphs:
        text = para.text.strip()
        if text:  
            paragraphs.append(text)
    return paragraphs


def merge_short_paragraphs(paragraphs, min_words):
   
    chunks = []
    buffer = ""  

    for para in paragraphs:
        buffer = (buffer + " " + para).strip() if buffer else para
        if len(buffer.split()) >= min_words:
            chunks.append(buffer)
            buffer = ""

    
    if buffer:
        if chunks:
            chunks[-1] = chunks[-1] + " " + buffer
        else:
            chunks.append(buffer)

    return chunks


def extract_chunks(file_path, min_words=DEFAULT_MIN_WORDS):
   
    paragraphs = extract_paragraphs(file_path)
    texts = merge_short_paragraphs(paragraphs, min_words)
    return [{"chunk_index": i, "text": t} for i, t in enumerate(texts)]
