from typing import List, Any, cast
from fastapi import APIRouter, Depends, HTTPException
from auth.deps import get_current_user
from database.database import get_db
from schemas.curriculum import CurriculumCreate, CurriculumUpdate, CurriculumInDB
from prisma.models import User

router = APIRouter()

@router.get("/", response_model=List[CurriculumInDB])
async def get_curriculums(current_user: User = Depends(get_current_user)):
    db = get_db()
    return await db.curriculum.find_many()

@router.post("/", response_model=CurriculumInDB)
async def create_curriculum(curriculum_in: CurriculumCreate, current_user: User = Depends(get_current_user)):
    db = get_db()
    curriculum = await db.curriculum.create(
        data=cast(Any, curriculum_in.dict())
    )
    return curriculum

@router.get("/{id}", response_model=CurriculumInDB)
async def get_curriculum(id: int, current_user: User = Depends(get_current_user)):
    db = get_db()
    curriculum = await db.curriculum.find_unique(where={"id": id})
    if not curriculum:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    return curriculum

@router.put("/{id}", response_model=CurriculumInDB)
async def update_curriculum(id: int, curriculum_in: CurriculumUpdate, current_user: User = Depends(get_current_user)):
    db = get_db()
    update_data = curriculum_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    curriculum = await db.curriculum.update(
        where={"id": id},
        data=cast(Any, update_data)
    )
    return curriculum

@router.delete("/{id}")
async def delete_curriculum(id: int, current_user: User = Depends(get_current_user)):
    db = get_db()
    await db.curriculum.delete(where={"id": id})
    return {"message": "Curriculum deleted successfully"}
