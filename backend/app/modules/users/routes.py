from fastapi import APIRouter

router = APIRouter()

@router.get("/users")
async def get_users():
    return {"message": "Users"}

# get user [low priority]
# get all users
# create user
# update user [low priority]
# delete user [low priority]