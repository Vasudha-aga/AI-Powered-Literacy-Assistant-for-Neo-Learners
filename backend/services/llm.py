import os
import google.generativeai as genai
from core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.LLM_API_KEY)

# Use gemini-3.5-flash as the default model
model = genai.GenerativeModel('gemini-3.5-flash')

async def evaluate_writing(prompt_text: str, user_response: str) -> dict:
    prompt = f"""
    You are an AI literacy tutor evaluating a user's writing. 
    The prompt given to the user was: "{prompt_text}"
    The user's response was: "{user_response}"
    
    Evaluate this response based on grammar, clarity, vocabulary, and overall relevance.
    Provide your output strictly in JSON format as follows without any markdown wrappers:
    {{
      "score": 7.5,
      "grammar_feedback": "string",
      "vocabulary_feedback": "string",
      "clarity_feedback": "string",
      "overall_feedback": "string"
    }}
    """
    
    response = await model.generate_content_async(prompt)
    return {"raw": response.text}

async def generate_learning_path(assessment_data: dict) -> dict:
    prompt = f"""
    You are an expert AI literacy educator. 
    A user has completed a comprehensive literacy assessment with the following results:
    Reading Score: {assessment_data.get('reading_score')} / 10
    Writing Score: {assessment_data.get('writing_score')} / 10
    Speaking Score: {assessment_data.get('speaking_score')} / 10
    Overall Level: {assessment_data.get('overall_level')}
    
    Writing Feedback: {assessment_data.get('writing_feedback')}
    Speaking Feedback: {assessment_data.get('speaking_feedback')}

    Based on this data, generate a personalized learning roadmap. 
    Provide your output strictly in JSON format as follows without any markdown wrappers:
    {{
      "recommended_level": "Beginner / Intermediate / Advanced",
      "focus_areas": ["area1", "area2"],
      "roadmap": [
        {{ "step": 1, "title": "string", "description": "string" }},
        {{ "step": 2, "title": "string", "description": "string" }}
      ],
      "encouraging_message": "string"
    }}
    """
    
    response = await model.generate_content_async(prompt)
    return {"raw": response.text}

async def generate_personalized_lesson(topic: str, proficiency_level: str, user_id: int) -> dict:
    from database.database import get_db
    import json
    
    prompt = f"""
    You are an expert AI literacy tutor. Generate a personalized mini-lesson for a user.
    Topic: {topic}
    User's Proficiency Level: {proficiency_level}
    
    The lesson should include a short reading or instructional content appropriate for their level,
    along with 2-3 multiple choice questions (quiz) to test their understanding.
    
    Provide your output strictly in JSON format as follows without any markdown wrappers:
    {{
      "title": "string",
      "content": "string (the lesson text)",
      "suggested_duration": 5,
      "quiz": [
        {{
          "question": "string",
          "options": ["A", "B", "C", "D"],
          "correct_answer": "string"
        }}
      ]
    }}
    """
    
    response = await model.generate_content_async(prompt)
    raw_text = response.text.strip()
    
    # Clean up json if markdown exists
    if raw_text.startswith('```json'):
        raw_text = raw_text[7:-3].strip()
    elif raw_text.startswith('```'):
        raw_text = raw_text[3:-3].strip()
        
    lesson_data = json.loads(raw_text)
    
    # Save to database
    db = get_db()
    
    # Create Curriculum
    curriculum = await db.curriculum.create(
        data={
            "language": "English",
            "level": proficiency_level,
            "category": "Custom Generation",
            "title": lesson_data["title"],
            "content": lesson_data["content"],
            "duration": lesson_data.get("suggested_duration", 5),
            "user_id": user_id,
            "is_custom": True
        }
    )
    
    # Create Quizzes
    for q in lesson_data["quiz"]:
        await db.quiz.create(
            data={
                "lesson_id": curriculum.id,
                "question": q["question"],
                "options": json.dumps(q["options"]),
                "correct_answer": q["correct_answer"]
            }
        )
        
    lesson_data["curriculum_id"] = curriculum.id
    return {"raw": json.dumps(lesson_data), "curriculum_id": curriculum.id, "lesson_data": lesson_data}
