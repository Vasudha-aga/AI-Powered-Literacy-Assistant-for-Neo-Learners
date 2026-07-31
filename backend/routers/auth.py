from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from auth.deps import get_current_user
from auth.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from database.database import get_db
from schemas.user import UserCreate, UserUpdate, UserInDB, Token
from prisma.models import User
from prisma.errors import UniqueViolationError

router = APIRouter()

@router.post("/register", response_model=UserInDB)
async def register(user_in: UserCreate):
    db = get_db()
    try:
        user_obj = await db.user.create(
            data={
                "email": user_in.email,
                "password_hash": get_password_hash(user_in.password),
                "name": user_in.name,
                "age": user_in.age,
                "gender": user_in.gender,
                "education": user_in.education,
                "occupation": user_in.occupation,
                "preferred_language": user_in.preferred_language,
                "district": user_in.district,
                "state": user_in.state
            }
        )
        return user_obj
    except UniqueViolationError:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.user.find_unique(where={"email": form_data.username})
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserInDB)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserInDB)
async def update_profile(user_in: UserUpdate, current_user: User = Depends(get_current_user)):
    db = get_db()
    update_data = user_in.dict(exclude_unset=True)
    if update_data:
        current_user = await db.user.update(
            where={"id": current_user.id},
            data=update_data
        )
    return current_user
