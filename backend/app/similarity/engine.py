

import os

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import chromadb
from sentence_transformers import SentenceTransformer

from app.config import Config

#MODEL_PATH = "./models/all-MiniLM-L6-v2"   
#DB_PATH = "./chroma_db"                    
#COLLECTION_NAME = "document_chunks"
#DEFAULT_THRESHOLD = 0.75                   
#LOW_MAX = 20.0                             
#MEDIUM_MAX = 50.0   
MODEL_PATH = str(Config.MODEL_DIR)
DB_PATH = str(Config.CHROMA_DIR)
COLLECTION_NAME = "document_chunks"
DEFAULT_THRESHOLD = 0.75
LOW_MAX = 20.0
MEDIUM_MAX = 50.0


_model = None  


def get_model(model_path=MODEL_PATH):
    
    global _model
    if _model is None:
        _model = SentenceTransformer(model_path)
    return _model


def get_collection(db_path=DB_PATH):
  
    client = chromadb.PersistentClient(path=db_path)
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def embed_texts(texts):
    
    vectors = get_model().encode(texts, normalize_embeddings=True)
    return vectors.tolist()


def add_document(document_id, chunks, db_path=DB_PATH):
   
    if not chunks:
        return
    collection = get_collection(db_path)
    collection.delete(where={"document_id": document_id})  

    texts = [c["text"] for c in chunks]
    collection.add(
        ids=[f"{document_id}__{c['chunk_index']}" for c in chunks],
        embeddings=embed_texts(texts),
        documents=texts,
        metadatas=[
            {"document_id": document_id, "chunk_index": c["chunk_index"]}
            for c in chunks
        ],
    )


def get_similarity_band(overall_score):
   
    if overall_score < LOW_MAX:
        return "Low"
    if overall_score < MEDIUM_MAX:
        return "Medium"
    return "High"


def check_document(document_id, chunks, threshold=DEFAULT_THRESHOLD, db_path=DB_PATH):
    
    empty_result = {"overall_score": 0.0, "similarity_band": "Low", "flagged_matches": []}
    if not chunks:
        return empty_result

    collection = get_collection(db_path)
    if collection.count() == 0:
        return empty_result  

    results = collection.query(
        query_embeddings=embed_texts([c["text"] for c in chunks]),
        n_results=1,
        where={"document_id": {"$ne": document_id}},  
        include=["documents", "metadatas", "distances"],
    )

    flagged = []
    for i, chunk in enumerate(chunks):
        if not results["ids"][i]:  
            continue
        similarity = 1.0 - results["distances"][i][0]
        if similarity >= threshold:
            match_meta = results["metadatas"][i][0]
            flagged.append({
                "chunk_index": chunk["chunk_index"],
                "chunk_text": chunk["text"],
                "matched_document_id": match_meta["document_id"],
                "matched_chunk_index": match_meta["chunk_index"],
                "matched_text": results["documents"][i][0],
                "similarity_score": round(similarity, 4),
            })

    overall = (len(flagged) / len(chunks)) * 100
    return {
        "overall_score": round(overall, 2),
        "similarity_band": get_similarity_band(overall),
        "flagged_matches": flagged,
    }
