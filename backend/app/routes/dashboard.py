from typing import Annotated

from fastapi import APIRouter, Depends

from app import schemas
from app.repository import DashboardRepository
from app.services.auth import get_current_user
from app.worker import status as worker_status

router = APIRouter()

DashboardResponse = (
    schemas.StudentDashboardResponse
    | schemas.InstructorDashboardResponse
    | schemas.AdminDashboardResponse
)


def student_dashboard(repo: DashboardRepository, user_id: str):
    return schemas.StudentDashboardResponse(
        upcoming_assignments=repo.get_unsubmitted_assignments(user_id),
        submission_history=repo.get_recent_user_submissions(user_id),
        submission_count=repo.count_user_submissions(user_id),
        assignment_count=repo.count_user_enrollments(user_id),
    )


def instructor_dashboard(repo: DashboardRepository, user_id: str):
    return schemas.InstructorDashboardResponse(
        flagged_submission_count=repo.count_flagged_submissions(user_id),
        submission_count=repo.count_instructor_submissions(user_id),
        assignment_count=repo.count_instructor_assignments(user_id),
        recent_submissions=repo.get_recent_instructor_submissions(user_id),
    )


def running_or_stopped(is_running: bool) -> str:
    return "running" if is_running else "stopped"


def admin_dashboard(repo: DashboardRepository):
    roles = repo.count_users_by_role()
    documents_count, used_space = repo.get_documents_totals()
    return schemas.AdminDashboardResponse(
        users=schemas.UsersBreakdown(
            count=sum(roles.values()),
            students=roles.get(schemas.UserRole.STUDENT, 0),
            instructors=roles.get(schemas.UserRole.INSTRUCTOR, 0),
            admins=roles.get(schemas.UserRole.ADMIN, 0),
        ),
        documents=schemas.DocumentsBreakdown(count=documents_count, size=used_space),
        system_health=schemas.SystemHealthResponse(
            database_status=running_or_stopped(repo.is_database_connected()),
            worker_status=worker_status.get_worker_status(),
            # This request is being served, so the API server is up
            server_status="running",
        ),
        failed_job_count=repo.count_failed_documents(),
        recent_activity=repo.get_recent_logs(),
    )


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    repo: Annotated[DashboardRepository, Depends(DashboardRepository)],
    current_user: Annotated[schemas.AuthJWTPayload, Depends(get_current_user)],
):
    if current_user.role == schemas.UserRole.ADMIN:
        return admin_dashboard(repo)
    if current_user.role == schemas.UserRole.INSTRUCTOR:
        return instructor_dashboard(repo, current_user.id)
    return student_dashboard(repo, current_user.id)
