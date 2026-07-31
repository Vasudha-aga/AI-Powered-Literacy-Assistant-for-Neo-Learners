import json
import re
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from auth.deps import get_current_user
from database.database import get_db
from schemas.curriculum import AssessmentInDB
from services.llm import evaluate_writing, generate_learning_path
from services.speech import evaluate_speech
from prisma.models import User, Assessment, LearningPath

router = APIRouter()

class QuizResultCreate(BaseModel):
    score: float
    literacy_level: str

def parse_json_from_llm(raw_text: str) -> dict:
    """Helper to extract JSON from LLM response which might have markdown formatting."""
    # Try to find a JSON block in the text
    match = re.search(r'```(?:json)?(.*?)```', raw_text, re.DOTALL)
    json_str = match.group(1).strip() if match else raw_text.strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {}

@router.post("/save_quiz", response_model=AssessmentInDB)
async def save_quiz_result(result: QuizResultCreate, current_user: User = Depends(get_current_user)):
    db = get_db()
    
    assessment = await db.assessment.create(
        data={
            "user_id": current_user.id,
            "overall_score": result.score,
            "literacy_level": result.literacy_level,
            "feedback": "Initial signup quiz"
        }
    )
    
    return assessment

@router.post("/complete")
async def submit_complete_assessment(
    reading_score: float = Form(...),
    writing_text: str = Form(...),
    voice_audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    db = get_db()
    
    writing_data = {}
    speaking_data = {}
    
    # 1. Evaluate Writing
    try:
        writing_eval = await evaluate_writing("Introduce yourself", writing_text)
        writing_data = parse_json_from_llm(writing_eval.get("raw", "{}"))
    except Exception as e:
        print(f"Writing evaluation failed: {e}")
        writing_data = {"score": 5.0, "overall_feedback": "Failed to evaluate."}

    # 2. Evaluate Speech
    if voice_audio:
        try:
            audio_bytes = await voice_audio.read()
            speech_eval = await evaluate_speech(audio_bytes, voice_audio.content_type or "audio/webm")
            speaking_data = parse_json_from_llm(speech_eval.get("raw", "{}"))
        except Exception as e:
            print(f"Speech evaluation failed: {e}")
            speaking_data = {"score": 5.0, "overall_feedback": "Failed to evaluate."}
    else:
        speaking_data = {"score": 0.0, "overall_feedback": "No audio provided."}

    # 3. Calculate Overall
    w_score = float(writing_data.get("score", 5.0))
    s_score = float(speaking_data.get("score", 5.0))
    overall_score = (reading_score + w_score + s_score) / 3.0
    
    overall_level = "Beginner"
    if overall_score >= 4 and overall_score <= 7:
        overall_level = "Intermediate"
    elif overall_score > 7:
        overall_level = "Advanced"

    # 4. Generate Learning Path
    assessment_data = {
        "reading_score": reading_score,
        "writing_score": w_score,
        "speaking_score": s_score,
        "overall_level": overall_level,
        "writing_feedback": writing_data.get("overall_feedback", ""),
        "speaking_feedback": speaking_data.get("overall_feedback", "")
    }
    
    path_data = {}
    try:
        path_eval = await generate_learning_path(assessment_data)
        path_data = parse_json_from_llm(path_eval.get("raw", "{}"))
    except Exception as e:
        print(f"Learning path generation failed: {e}")

    # 5. Save Assessment
    assessment = await db.assessment.create(
        data={
            "user_id": current_user.id,
            "reading_score": reading_score,
            "writing_score": w_score,
            "speaking_score": s_score,
            "overall_score": overall_score,
            "literacy_level": overall_level,
            "feedback": json.dumps({
                "writing": writing_data,
                "speaking": speaking_data
            })
        }
    )

    # 6. Upsert Learning Path
    # Prisma Python upsert syntax
    if path_data:
        try:
            await db.learningpath.upsert(
                where={
                    "user_id": current_user.id
                },
                data={
                    "create": {
                        "user_id": current_user.id,
                        "recommended_level": path_data.get("recommended_level", overall_level),
                        "roadmap": json.dumps(path_data.get("roadmap", []))
                    },
                    "update": {
                        "recommended_level": path_data.get("recommended_level", overall_level),
                        "roadmap": json.dumps(path_data.get("roadmap", []))
                    }
                }
            )
        except Exception as e:
            print(f"Failed to upsert LearningPath: {e}")

    return {
        "assessment_id": assessment.id,
        "overall_score": overall_score,
        "overall_level": overall_level,
        "learning_path": path_data
    }

@router.get("/learning_path")
async def get_learning_path(current_user: User = Depends(get_current_user)):
    db = get_db()
    path = await db.learningpath.find_unique(where={"user_id": current_user.id})
    if not path:
        return None
    
    return {
        "recommended_level": path.recommended_level,
        "roadmap": json.loads(path.roadmap) if isinstance(path.roadmap, str) else path.roadmap
    }

@router.get("/history")
async def get_assessment_history(current_user: User = Depends(get_current_user)):
    db = get_db()
    assessments = await db.assessment.find_many(
        where={"user_id": current_user.id},
        order={"created_at": "desc"}
    )
    return assessments

@router.get("/{id}", response_model=AssessmentInDB)
async def get_assessment(id: int, current_user: User = Depends(get_current_user)):
    db = get_db()
    assessment = await db.assessment.find_unique(where={"id": id})
    if not assessment or assessment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


