import os
import google.generativeai as genai
from core.config import settings
import tempfile
import uuid

genai.configure(api_key=settings.LLM_API_KEY)

# Use Gemini 3.5 Flash for faster audio processing
model = genai.GenerativeModel('gemini-3.5-flash')

async def evaluate_speech(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    """
    Evaluates speech audio using Gemini.
    """
    if not audio_bytes:
        return {
            "score": 0.0,
            "feedback": "No audio provided.",
            "transcription": ""
        }
    
    try:
        prompt = """
        You are an AI literacy tutor. The user was asked to read the following sentence out loud:
        "I am learning to read and write today."
        
        Listen to the audio and evaluate their speaking ability.
        Provide your output strictly in JSON format as follows without any markdown wrappers:
        {
          "score": 8.5,
          "transcription": "what the user actually said",
          "pronunciation_feedback": "feedback string",
          "fluency_feedback": "feedback string",
          "overall_feedback": "feedback string"
        }
        """

        response = await model.generate_content_async([
            prompt,
            {
                "mime_type": mime_type,
                "data": audio_bytes
            }
        ])
        
        return {"raw": response.text}
        
    except Exception as e:
        print(f"Error in speech evaluation: {e}")
        return {
            "raw": '{"score": 5.0, "transcription": "Error processing audio.", "pronunciation_feedback": "N/A", "fluency_feedback": "N/A", "overall_feedback": "Audio processing failed."}'
        }
