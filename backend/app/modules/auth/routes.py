from fastapi import APIRouter

router = APIRouter()

@router.post("/auth/login")
async def login_user():
    return {"message": "Users"}

# login user
# logout user