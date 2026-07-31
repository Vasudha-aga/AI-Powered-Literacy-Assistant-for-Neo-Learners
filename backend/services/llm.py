import os
import google.generativeai as genai
from core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.LLM_API_KEY)

# Use gemini-1.5-flash as the default model
model = genai.GenerativeModel('gemini-1.5-flash')

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

