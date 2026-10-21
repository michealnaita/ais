from app import utils

DEFAULT_PASSWORD = "default-password"


def create_user_record(**overides):
    password = overides.pop("password", DEFAULT_PASSWORD)
    user = {
        "email": "user@test.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "student",
        "password_hash": utils.Password(password).get_hash(),
    }
    user.update(overides)

    return user


def create_assignment_record(**overrides):
    assignment = {
        "title": "Assignment 1",
        "description": "This is the first assignment.",
        "enrollment_code": "ABC123",
        "instructor_id": "user-id-placeholder",
    }
    assignment.update(overrides)

    return assignment


def create_document_record(user_id: str = "user-id-placeholder", **overrides):
    document = {
        "user_id": user_id,
        "original_file_name": "document.pdf",
        "file_name": "document.pdf",
        "similarity_score": None,
        "status": "queued",
        "size": 1024,
        "mime_type": "application/pdf",
    }
    document.update(overrides)

    return document


def create_document_chunk_record(document_id: str):
    chunk = {
        "document_id": document_id,
        "content": "This is a sample chunk of text from the document.",
        "index": 1,
    }

    return chunk


def create_similar_chunk_record(
    document_id: str, document_chunk_id: str, matched_chunk_id: str
):
    similar_chunk = {
        "document_id": document_id,
        "document_chunk_id": document_chunk_id,
        "matched_chunk_id": matched_chunk_id,
    }
    return similar_chunk
