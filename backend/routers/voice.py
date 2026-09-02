from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from auth.deps import get_current_user
from prisma.models import User
from services.speech import evaluate_speech_with_model
from services.gamification import award_xp

router = APIRouter()

VOICE_DRILLS_LIBRARY = [
    {
        "id": "vdrill_1",
        "title": "Daily Greetings & Introduction",
        "category": "Conversational",
        "level": "Beginner",
        "language": "English",
        "text": "Hello, my name is Alex and I am happy to meet you.",
        "difficulty": "Easy",
        "target_phonemes": ["m", "n", "th"],
        "xp_reward": 40,
        "tips": "Pay special attention to closing your lips on 'name' and 'meet'."
    },
    {
        "id": "vdrill_2",
        "title": "Literacy & Learning",
        "category": "Sentences",
        "level": "Beginner",
        "language": "English",
        "text": "I am learning to read and write every day.",
        "difficulty": "Easy",
        "target_phonemes": ["r", "w", "d"],
        "xp_reward": 40,
        "tips": "Emphasize the 'ing' sound at the end of learning."
    },
    {
        "id": "vdrill_3",
        "title": "Asking for Assistance",
        "category": "Workplace",
        "level": "Intermediate",
        "language": "English",
        "text": "Could you please explain how this application works?",
        "difficulty": "Medium",
        "target_phonemes": ["pl", "ks", "w"],
        "xp_reward": 60,
        "tips": "Link 'could you' smoothly and articulate 'application' clearly."
    },
    {
        "id": "vdrill_4",
        "title": "Tongue Twister: S & Sh Sounds",
        "category": "Tongue Twisters",
        "level": "Intermediate",
        "language": "English",
        "text": "She sells sea shells by the sunny seashore.",
        "difficulty": "Medium",
        "target_phonemes": ["s", "sh"],
        "xp_reward": 75,
        "tips": "Alternate cleanly between the soft 'sh' and sharp 's' sounds."
    },
    {
        "id": "vdrill_5",
        "title": "Professional Introduction",
        "category": "Workplace",
        "level": "Advanced",
        "language": "English",
        "text": "Education and continuous knowledge empower every individual.",
        "difficulty": "Hard",
        "target_phonemes": ["j", "kw", "p"],
        "xp_reward": 90,
        "tips": "Pronounce 'individual' as in-dih-VID-yoo-ul."
    },
    {
        "id": "vdrill_6",
        "title": "हिंदी अभिवादन (Hindi Greeting)",
        "category": "Multilingual",
        "level": "Beginner",
        "language": "Hindi",
        "text": "नमस्ते, मैं आज एक नया पाठ सीख रहा हूँ।",
        "difficulty": "Easy",
        "target_phonemes": ["स", "ख", "ह"],
        "xp_reward": 50,
        "tips": "Focus on the nasal sound in 'हूँ'."
    },
    {
        "id": "vdrill_7",
        "title": "मराठी संभाषण (Marathi Conversation)",
        "category": "Multilingual",
        "level": "Beginner",
        "language": "Marathi",
        "text": "नमस्कार, मला दररोज नवीन गोष्टी शिकायला आवडतात.",
        "difficulty": "Easy",
        "target_phonemes": ["ण", "ळ", "श"],
        "xp_reward": 50,
        "tips": "Pronounce 'शिकायला' with clear syllables."
    }
]

# In-memory history for practice logs
_user_voice_history: List[dict] = []

@router.get("/drills")
async def get_voice_drills(
    category: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Retrieve curated speech drills filtered by criteria."""
    drills = VOICE_DRILLS_LIBRARY
    if category and category.lower() != "all":
        drills = [d for d in drills if d["category"].lower() == category.lower()]
    if level and level.lower() != "all":
        drills = [d for d in drills if d["level"].lower() == level.lower()]
    if language and language.lower() != "all":
        drills = [d for d in drills if d["language"].lower() == language.lower()]
    return drills

@router.post("/evaluate")
async def evaluate_voice_practice(
    target_text: str = Form(...),
    client_transcription: Optional[str] = Form(""),
    drill_id: Optional[str] = Form(None),
    voice_audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluate user voice audio recording against target text using pronunciation AI models,
    and award gamification XP and streak updates.
    """
    audio_bytes = b""
    mime_type = "audio/webm"
    if voice_audio:
        audio_bytes = await voice_audio.read()
        mime_type = voice_audio.content_type or "audio/webm"

    # Evaluate via Speech & Pronunciation model
    eval_result = await evaluate_speech_with_model(
        audio_bytes=audio_bytes,
        target_text=target_text,
        mime_type=mime_type,
        client_transcription=client_transcription or ""
    )

    overall_score = eval_result.get("overall_score", 75.0)

    # Calculate XP reward
    base_xp = 40
    if overall_score >= 90:
        base_xp += 30
    elif overall_score >= 80:
        base_xp += 15

    gamification_update = await award_xp(
        user_id=current_user.id,
        xp_amount=base_xp,
        action_type="voice_practice",
        metadata={"score": overall_score, "drill_id": drill_id}
    )

    # Record history
    history_entry = {
        "user_id": current_user.id,
        "target_text": target_text,
        "transcription": eval_result.get("transcription", client_transcription or target_text),
        "overall_score": overall_score,
        "accuracy_score": eval_result.get("accuracy_score", 75.0),
        "fluency_score": eval_result.get("fluency_score", 75.0),
        "completeness_score": eval_result.get("completeness_score", 80.0),
        "created_at": "Just now",
        "drill_id": drill_id
    }
    _user_voice_history.insert(0, history_entry)

    return {
        "assessment": eval_result,
        "gamification": gamification_update
    }

@router.get("/history")
async def get_voice_practice_history(current_user: User = Depends(get_current_user)):
    """Retrieve history of user voice practice sessions."""
    user_history = [h for h in _user_voice_history if h.get("user_id") == current_user.id]
    if not user_history:
        # Provide representative initial practice history
        user_history = [
            {
                "user_id": current_user.id,
                "target_text": "I am learning to read and write every day.",
                "transcription": "I am learning to read and write every day.",
                "overall_score": 92.0,
                "accuracy_score": 94.0,
                "fluency_score": 90.0,
                "completeness_score": 100.0,
                "created_at": "Today, 10:30 AM",
                "drill_id": "vdrill_2"
            },
            {
                "user_id": current_user.id,
                "target_text": "Hello, my name is Alex and I am happy to meet you.",
                "transcription": "Hello my name is Alex and I am happy to meet you.",
                "overall_score": 88.5,
                "accuracy_score": 90.0,
                "fluency_score": 85.0,
                "completeness_score": 95.0,
                "created_at": "Yesterday, 4:15 PM",
                "drill_id": "vdrill_1"
            }
        ]
    return user_history
