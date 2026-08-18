from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ContentRecommendation(BaseModel):
    id: int
    title: str
    level: str
    category: str
    duration: int

class ProficiencyPrediction(BaseModel):
    predicted_level: str
    confidence_score: float
    factors: Dict[str, Any]

class PersonalizedLessonRequest(BaseModel):
    topic: str
    proficiency_level: Optional[str] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class PersonalizedLessonResponse(BaseModel):
    title: str
    content: str
    suggested_duration: int
    quiz: List[QuizQuestion]

class UserProgressCreate(BaseModel):
    curriculum_id: int
    status: str
    score: Optional[float] = None

class UserProgressInDB(UserProgressCreate):
    id: int
    user_id: int
    attempts: int
    history: Any
    
    class Config:
        from_attributes = True
