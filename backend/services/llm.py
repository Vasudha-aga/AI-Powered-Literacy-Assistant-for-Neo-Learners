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
    Provide your output strictly in JSON format as follows:
    {{
      "score": <float out of 10>,
      "grammar_feedback": "<string>",
      "vocabulary_feedback": "<string>",
      "clarity_feedback": "<string>",
      "overall_feedback": "<string>"
    }}
    """
    
    response = await model.generate_content_async(prompt)
    # the response.text is the generated text. In a real app we would parse JSON safely.
    # For now, return the raw text to be handled by the router.
    return {"raw": response.text}
