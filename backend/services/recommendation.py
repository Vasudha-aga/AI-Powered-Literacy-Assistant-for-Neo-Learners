import json
from database.database import get_db
from services.llm import model

async def predict_proficiency(user_id: int) -> dict:
    db = get_db()
    
    # Fetch recent assessments
    assessments = await db.assessment.find_many(
        where={"user_id": user_id},
        order={"created_at": "desc"},
        take=5
    )
    
    # Fetch user progress
    progress = await db.userprogress.find_many(
        where={"user_id": user_id, "status": "completed"}
    )
    
    if not assessments and not progress:
        return {
            "predicted_level": "Beginner",
            "confidence_score": 0.1,
            "analysis": "Insufficient data. Defaulting to Beginner."
        }
        
    avg_score = 0.0
    if assessments:
        avg_score = sum(a.overall_score for a in assessments if a.overall_score) / len(assessments)
        
    # Analyze with LLM
    data_summary = f"User has completed {len(progress)} lessons. Recent assessment average score: {avg_score:.2f} / 10."
    prompt = f"""
    You are an expert educational AI. Based on the user's performance data, predict their current literacy proficiency level (Beginner, Intermediate, or Advanced).
    
    Data:
    {data_summary}
    
    Return ONLY a JSON response like this, without markdown formatting:
    {{
      "predicted_level": "Beginner / Intermediate / Advanced",
      "confidence_score": 0.0 - 1.0,
      "analysis": "Short explanation of the prediction"
    }}
    """
    
    try:
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()
            
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"Prediction failed: {e}")
        # Fallback heuristic
        level = "Beginner"
        if avg_score > 7:
            level = "Advanced"
        elif avg_score >= 4:
            level = "Intermediate"
            
        return {
            "predicted_level": level,
            "confidence_score": 0.5,
            "analysis": "Heuristic fallback due to AI error."
        }

async def get_content_recommendations(user_id: int) -> list[dict]:
    db = get_db()
    
    # 1. Get user's current proficiency
    proficiency_data = await predict_proficiency(user_id)
    level = proficiency_data.get("predicted_level", "Beginner")
    
    # 2. Get completed curriculum IDs
    progress = await db.userprogress.find_many(
        where={"user_id": user_id}
    )
    completed_ids = [p.curriculum_id for p in progress if p.status == "completed"]
    
    # 3. Find lessons that match the level and are not completed
    where_match: dict = {"level": level}
    if completed_ids:
        where_match["id"] = {"notIn": completed_ids}

    available_lessons = await db.curriculum.find_many(
        where=where_match,  # type: ignore
        take=3
    )
    
    recommendations = []
    for lesson in available_lessons:
        recommendations.append({
            "curriculum_id": lesson.id,
            "title": lesson.title,
            "level": lesson.level,
            "category": lesson.category,
            "reason": f"Matches your predicted level: {level}."
        })
        
    # If no lessons match, we might fall back to other levels
    if not recommendations:
        where_fallback: dict = {}
        if completed_ids:
            where_fallback["id"] = {"notIn": completed_ids}

        other_lessons = await db.curriculum.find_many(
            where=where_fallback if where_fallback else None,  # type: ignore
            take=3
        )
        for lesson in other_lessons:
            recommendations.append({
                "curriculum_id": lesson.id,
                "title": lesson.title,
                "level": lesson.level,
                "category": lesson.category,
                "reason": "Next available lesson."
            })
            
    return recommendations
