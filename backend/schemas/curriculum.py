from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# Curriculum Schemas
class CurriculumBase(BaseModel):
    language: str
    level: str
    category: str
    title: str
    content: str
    duration: int

class CurriculumCreate(CurriculumBase):
    pass

class CurriculumUpdate(BaseModel):
    language: Optional[str] = None
    level: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    duration: Optional[int] = None

class CurriculumInDB(CurriculumBase):
    id: int

    class Config:
        from_attributes = True

# Assessment Schemas
class AssessmentBase(BaseModel):
    reading_score: Optional[float] = None
    writing_score: Optional[float] = None
    speaking_score: Optional[float] = None
    overall_score: Optional[float] = None
    literacy_level: Optional[str] = None
    feedback: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    user_id: int

class AssessmentInDB(AssessmentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Learning Path Schemas
class LearningPathBase(BaseModel):
    recommended_level: str
    roadmap: Any

class LearningPathCreate(LearningPathBase):
    user_id: int

class LearningPathInDB(LearningPathBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizBase(BaseModel):
    lesson_id: int
    question: str
    options: List[str]
    correct_answer: str

class QuizCreate(QuizBase):
    pass

class QuizInDB(QuizBase):
    id: int

    class Config:
        from_attributes = True
