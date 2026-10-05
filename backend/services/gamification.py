from datetime import date, timedelta
from typing import Dict, List, Any, Optional

BADGE_DEFINITIONS = [
    {
        "id": "first_words",
        "title": "First Voice Step",
        "description": "Complete your very first voice pronunciation practice.",
        "icon": "Mic",
        "category": "voice",
        "xp_reward": 50,
        "required_count": 1
    },
    {
        "id": "pronunciation_star",
        "title": "Pronunciation Star",
        "description": "Score 90% or higher on any speaking drill.",
        "icon": "Sparkles",
        "category": "voice",
        "xp_reward": 100,
        "required_count": 1
    },
    {
        "id": "voice_master",
        "title": "Voice Master",
        "description": "Complete 10 speech practice sessions.",
        "icon": "Award",
        "category": "voice",
        "xp_reward": 250,
        "required_count": 10
    },
    {
        "id": "streak_3",
        "title": "Streak Starter",
        "description": "Maintain a 3-day active learning streak.",
        "icon": "Flame",
        "category": "streak",
        "xp_reward": 150,
        "required_count": 3
    },
    {
        "id": "streak_7",
        "title": "Consistency Champion",
        "description": "Reach a 7-day unbroken learning streak.",
        "icon": "Zap",
        "category": "streak",
        "xp_reward": 350,
        "required_count": 7
    },
    {
        "id": "streak_30",
        "title": "Unstoppable Learner",
        "description": "Achieve a monumental 30-day streak!",
        "icon": "Crown",
        "category": "streak",
        "xp_reward": 1000,
        "required_count": 30
    },
    {
        "id": "first_lesson",
        "title": "Curious Mind",
        "description": "Finish your first curriculum reading lesson.",
        "icon": "BookOpen",
        "category": "learning",
        "xp_reward": 50,
        "required_count": 1
    },
    {
        "id": "quiz_ace",
        "title": "Quiz Ace",
        "description": "Score 100% on any module quiz.",
        "icon": "CheckCircle2",
        "category": "learning",
        "xp_reward": 150,
        "required_count": 1
    },
    {
        "id": "polyglot_explorer",
        "title": "Multilingual Pioneer",
        "description": "Practice voice or literacy in more than one language.",
        "icon": "Globe",
        "category": "learning",
        "xp_reward": 200,
        "required_count": 2
    },
    {
        "id": "assessment_completed",
        "title": "Diagnosed & Ready",
        "description": "Complete the full diagnostic literacy assessment.",
        "icon": "Target",
        "category": "milestone",
        "xp_reward": 100,
        "required_count": 1
    },
    {
        "id": "level_5",
        "title": "Literacy Scholar",
        "description": "Reach Learner Level 5.",
        "icon": "Medal",
        "category": "milestone",
        "xp_reward": 300,
        "required_count": 5
    },
    {
        "id": "speed_reader",
        "title": "Rapid Speaker",
        "description": "Attain over 85% fluency on 3 voice challenges.",
        "icon": "TrendingUp",
        "category": "voice",
        "xp_reward": 200,
        "required_count": 3
    }
]

LEVEL_THRESHOLDS = [
    {"level": 1, "title": "Novice Learner", "min_xp": 0, "max_xp": 200, "badge": "Seed"},
    {"level": 2, "title": "Curious Explorer", "min_xp": 200, "max_xp": 500, "badge": "Sprout"},
    {"level": 3, "title": "Fluent Reader", "min_xp": 500, "max_xp": 1000, "badge": "Tree"},
    {"level": 4, "title": "Speech Artisan", "min_xp": 1000, "max_xp": 2000, "badge": "Silver Star"},
    {"level": 5, "title": "Literacy Scholar", "min_xp": 2000, "max_xp": 3500, "badge": "Gold Medal"},
    {"level": 6, "title": "Master Orator", "min_xp": 3500, "max_xp": 5500, "badge": "Ruby Gem"},
    {"level": 7, "title": "Literacy Champion", "min_xp": 5500, "max_xp": 8000, "badge": "Crown"}
]

# In-memory gamification cache / fallback store for instant responsiveness
_user_gamification_store: Dict[int, Dict[str, Any]] = {}

def get_user_gamification_state(user_id: int) -> Dict[str, Any]:
    """Retrieve or initialize gamification state for a user."""
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    
    if user_id not in _user_gamification_store:
        _user_gamification_store[user_id] = {
            "xp": 320,
            "current_streak": 3,
            "longest_streak": 5,
            "last_active_date": today_str,
            "active_dates": [
                (date.today() - timedelta(days=2)).isoformat(),
                yesterday_str,
                today_str
            ],
            "unlocked_badges": ["first_words", "first_lesson", "assessment_completed", "streak_3"],
            "voice_sessions_count": 4,
            "perfect_drills_count": 2,
            "completed_lessons_count": 3,
            "claimed_quests": [],
            "daily_quests": [
                {
                    "id": "quest_voice_1",
                    "title": "Voice Practice",
                    "description": "Complete 1 speech pronunciation drill today",
                    "progress": 1,
                    "target": 1,
                    "xp_reward": 50,
                    "completed": True,
                    "claimed": False
                },
                {
                    "id": "quest_score_80",
                    "title": "Precision Speaker",
                    "description": "Score 80%+ on any speech challenge",
                    "progress": 1,
                    "target": 1,
                    "xp_reward": 75,
                    "completed": True,
                    "claimed": False
                },
                {
                    "id": "quest_streak",
                    "title": "Daily Dedication",
                    "description": "Keep your learning streak active",
                    "progress": 1,
                    "target": 1,
                    "xp_reward": 40,
                    "completed": True,
                    "claimed": True
                }
            ]
        }
    return _user_gamification_store[user_id]

def calculate_level_info(total_xp: int) -> Dict[str, Any]:
    """Calculate level, current level progress, and next level requirements."""
    current_tier = LEVEL_THRESHOLDS[0]
    next_tier = LEVEL_THRESHOLDS[1]
    
    for i, tier in enumerate(LEVEL_THRESHOLDS):
        if total_xp >= tier["min_xp"]:
            current_tier = tier
            next_tier = LEVEL_THRESHOLDS[i + 1] if i + 1 < len(LEVEL_THRESHOLDS) else tier
            
    xp_in_level = total_xp - current_tier["min_xp"]
    level_span = max(1, next_tier["min_xp"] - current_tier["min_xp"])
    progress_pct = min(100.0, round((xp_in_level / level_span) * 100, 1)) if current_tier != next_tier else 100.0
    
    return {
        "level": current_tier["level"],
        "title": current_tier["title"],
        "badge": current_tier["badge"],
        "current_xp": total_xp,
        "level_min_xp": current_tier["min_xp"],
        "level_max_xp": next_tier["min_xp"],
        "xp_needed": max(0, next_tier["min_xp"] - total_xp),
        "progress_percentage": progress_pct
    }

async def award_xp(user_id: int, xp_amount: int, action_type: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Award XP to a user, update streaks, and evaluate badge unlock conditions."""
    state = get_user_gamification_state(user_id)
    state["xp"] += xp_amount
    
    # Update active date and streak
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    
    if today_str not in state["active_dates"]:
        if state["last_active_date"] == yesterday_str:
            state["current_streak"] += 1
        elif state["last_active_date"] != today_str:
            state["current_streak"] = 1
            
        state["longest_streak"] = max(state["longest_streak"], state["current_streak"])
        state["active_dates"].append(today_str)
        state["last_active_date"] = today_str

    # Update counts based on action
    newly_unlocked_badges = []
    if action_type == "voice_practice":
        state["voice_sessions_count"] = state.get("voice_sessions_count", 0) + 1
        score = (metadata or {}).get("score", 0)
        if score >= 90:
            state["perfect_drills_count"] = state.get("perfect_drills_count", 0) + 1
            
    elif action_type == "lesson_complete":
        state["completed_lessons_count"] = state.get("completed_lessons_count", 0) + 1

    # Check badge unlocks
    for badge in BADGE_DEFINITIONS:
        b_id = badge["id"]
        if b_id in state["unlocked_badges"]:
            continue
            
        unlocked = False
        if b_id == "first_words" and state.get("voice_sessions_count", 0) >= 1:
            unlocked = True
        elif b_id == "pronunciation_star" and state.get("perfect_drills_count", 0) >= 1:
            unlocked = True
        elif b_id == "voice_master" and state.get("voice_sessions_count", 0) >= 10:
            unlocked = True
        elif b_id == "streak_3" and state["current_streak"] >= 3:
            unlocked = True
        elif b_id == "streak_7" and state["current_streak"] >= 7:
            unlocked = True
        elif b_id == "streak_30" and state["current_streak"] >= 30:
            unlocked = True
        elif b_id == "first_lesson" and state.get("completed_lessons_count", 0) >= 1:
            unlocked = True
            
        if unlocked:
            state["unlocked_badges"].append(b_id)
            state["xp"] += badge["xp_reward"]
            newly_unlocked_badges.append(badge)

    level_info = calculate_level_info(state["xp"])
    return {
        "xp_gained": xp_amount,
        "total_xp": state["xp"],
        "level_info": level_info,
        "current_streak": state["current_streak"],
        "newly_unlocked_badges": newly_unlocked_badges
    }

def get_leaderboard_standings(current_user_id: int) -> List[Dict[str, Any]]:
    """Return top learners leaderboard."""
    mock_users = [
        {"id": 101, "name": "Aarav Sharma", "avatar": "🌟", "xp": 3450, "level": 5, "streak": 14, "badges": 8},
        {"id": 102, "name": "Priya Patel", "avatar": "🚀", "xp": 2890, "level": 4, "streak": 9, "badges": 6},
        {"id": 103, "name": "Rohan Deshmukh", "avatar": "⚡", "xp": 2100, "level": 4, "streak": 7, "badges": 5},
        {"id": current_user_id, "name": "You (Learner)", "avatar": "👑", "xp": get_user_gamification_state(current_user_id)["xp"], "level": calculate_level_info(get_user_gamification_state(current_user_id)["xp"])["level"], "streak": get_user_gamification_state(current_user_id)["current_streak"], "badges": len(get_user_gamification_state(current_user_id)["unlocked_badges"])},
        {"id": 104, "name": "Ananya Roy", "avatar": "🌸", "xp": 1450, "level": 3, "streak": 4, "badges": 4},
        {"id": 105, "name": "Vikram Singh", "avatar": "🔥", "xp": 980, "level": 2, "streak": 3, "badges": 3},
    ]
    # Sort descending by XP
    sorted_users = sorted(mock_users, key=lambda x: x["xp"], reverse=True)
    for rank, u in enumerate(sorted_users, 1):
        u["rank"] = rank
    return sorted_users
