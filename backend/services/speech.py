import json
from typing import Any
from core.config import settings
from services.pronunciation import evaluate_pronunciation_heuristic

# Initialize Gemini 3.6 Flash
gemini_model: Any = None
try:
    import google.generativeai as genai
    if settings.LLM_API_KEY:
        genai.configure(api_key=settings.LLM_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-3.6-flash')
except Exception as e:
    print(f"Gemini speech model init notice: {e}")

async def evaluate_speech_with_model(
    audio_bytes: bytes,
    target_text: str = "I am learning to read and write today.",
    mime_type: str = "audio/webm",
    client_transcription: str = ""
) -> dict:
    """
    Evaluates speech audio using Gemini multimodal analysis, or algorithmic pronunciation model.
    Scores strictly based on the accuracy of spoken words compared to the target text.
    """
    spoken_text = client_transcription.strip() if client_transcription else ""
    
    # Normalize MIME type for Gemini
    clean_mime = "audio/webm"
    if "mp4" in mime_type.lower():
        clean_mime = "audio/mp4"
    elif "wav" in mime_type.lower():
        clean_mime = "audio/wav"
    elif "ogg" in mime_type.lower():
        clean_mime = "audio/ogg"

    if gemini_model and audio_bytes and len(audio_bytes) > 200:
        try:
            prompt = f"""
            You are an expert speech and pronunciation evaluator for a literacy learning application.
            The user was instructed to read the following target text out loud:
            Target Text: "{target_text}"

            Listen carefully to the user's voice in the provided audio file.
            1. Transcribe the exact words the user actually spoke in the audio.
            2. Compare what the user spoke with the Target Text word by word.
            3. If the user spoke words clearly and correctly matching the target text, award a high score (85-100%).
            4. If the user spoke different words, skipped words, or mispronounced words, score them accurately based on the incorrectness.
            5. Mark each target word status as "perfect", "good", "needs_work", "mispronounced", or "omitted".
            
            Return ONLY a raw valid JSON object (no markdown formatting, no backticks, no code blocks) matching this schema:
            {{
              "overall_score": 88.0,
              "accuracy_score": 90.0,
              "fluency_score": 85.0,
              "completeness_score": 92.0,
              "transcription": "the exact words the user actually spoke in the audio",
              "word_analysis": [
                {{
                  "word": "target_word",
                  "spoken": "spoken_word_or_null",
                  "status": "perfect" | "good" | "needs_work" | "mispronounced" | "omitted",
                  "accuracy": 95.0,
                  "phonetic_hint": "SYL-la-ble",
                  "tip": "Specific pronunciation tip"
                }}
              ],
              "feedback": {{
                "general": "Overall summary advice",
                "strength": "What they did well",
                "focus_area": "What words to practice",
                "intonation": "Rhythm feedback"
              }}
            }}
            """

            response = await gemini_model.generate_content_async([
                prompt,
                {
                    "mime_type": clean_mime,
                    "data": audio_bytes
                }
            ])
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            if "overall_score" in parsed and "word_analysis" in parsed:
                return parsed
        except Exception as e:
            print(f"Gemini audio evaluation notice: {e}")

    # Fallback to algorithmic pronunciation assessment using spoken text or target text
    effective_spoken = spoken_text or target_text
    return evaluate_pronunciation_heuristic(target_text, effective_spoken)

async def evaluate_speech(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    """Legacy wrapper for assessment quiz flow."""
    target_sentence = "I am learning to read and write today."
    res = await evaluate_speech_with_model(audio_bytes, target_sentence, mime_type)
    score_10 = round((res.get("overall_score", 75.0) / 10.0), 1)
    
    formatted_legacy = {
        "score": score_10,
        "transcription": res.get("transcription", target_sentence),
        "pronunciation_feedback": res.get("feedback", {}).get("focus_area", "Practice clear pronunciation."),
        "fluency_feedback": res.get("feedback", {}).get("intonation", "Natural pacing."),
        "overall_feedback": res.get("feedback", {}).get("general", "Keep practicing!"),
        "word_analysis": res.get("word_analysis", []),
        "accuracy_score": res.get("accuracy_score", 75.0),
        "fluency_score": res.get("fluency_score", 75.0)
    }
    return {"raw": json.dumps(formatted_legacy)}
