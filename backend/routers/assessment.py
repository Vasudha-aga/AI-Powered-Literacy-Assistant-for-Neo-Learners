import json
from fastapi import APIRouter, Depends, HTTPException
from auth.deps import get_current_user
from database.database import get_db
from schemas.curriculum import AssessmentCreate, AssessmentInDB
from services.llm import evaluate_writing
from prisma.models import User, Assessment

router = APIRouter()

@router.post("/", response_model=AssessmentInDB)
async def submit_assessment(prompt_text: str, user_response: str, current_user: User = Depends(get_current_user)):
    db = get_db()
    
    # 1. Evaluate writing using Gemini LLM
    try:
        evaluation = await evaluate_writing(prompt_text, user_response)
        raw_feedback = evaluation.get("raw", "{}")
        # In production, parse the JSON from raw_feedback robustly. 
        # For this prototype, we'll store the raw text string.
        writing_score = 5.0 # Mocked parse for now
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Evaluation failed: {str(e)}")

    # 2. Save Assessment to DB
    assessment = await db.assessment.create(
        data={
            "user_id": current_user.id,
            "writing_score": writing_score,
            "feedback": raw_feedback
        }
    )
    
    return assessment

@router.get("/{id}", response_model=AssessmentInDB)
async def get_assessment(id: int, current_user: User = Depends(get_current_user)):
    db = get_db()
    assessment = await db.assessment.find_unique(where={"id": id})
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
