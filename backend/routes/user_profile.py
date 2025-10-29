# routes/user_profile.py
from fastapi import APIRouter, Header, HTTPException
from controller.user_profile_controller import get_user_profile_and_scenarios

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile", summary="Fetch user profile & saved scenarios using JWT")
def get_user_profile(Authorization: str = Header(...)):
    """
    Expects a JWT token in the Authorization header:
        Authorization: Bearer <token>
    Decodes it to extract the mobile number, fetches user data from cred.ly,
    and retrieves all what-if scenarios from the scenarios collection.
    """
    # Ensure correct header format
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = Authorization.split(" ")[1]
    return get_user_profile_and_scenarios(token)
