from fastapi import APIRouter, Depends, HTTPException
from auth.deps import get_current_user
from prisma.models import User
from services.gamification import (
    get_user_gamification_state,
    calculate_level_info,
    BADGE_DEFINITIONS,
    get_leaderboard_standings,
    award_xp
)

router = APIRouter()

@router.get("/status")
async def get_gamification_status(current_user: User = Depends(get_current_user)):
    """Fetch complete gamification status including badges, streaks, level, and quests."""
    state = get_user_gamification_state(current_user.id)
    level_info = calculate_level_info(state["xp"])
    
    # Enrich badge definitions with user unlock status
    enriched_badges = []
    for b in BADGE_DEFINITIONS:
        unlocked = b["id"] in state["unlocked_badges"]
        enriched_badges.append({
            **b,
            "unlocked": unlocked,
            "unlocked_at": "Achieved" if unlocked else "Locked"
        })

    return {
        "xp": state["xp"],
        "level_info": level_info,
        "current_streak": state["current_streak"],
        "longest_streak": state["longest_streak"],
        "active_dates": state["active_dates"],
        "badges": enriched_badges,
        "unlocked_count": len(state["unlocked_badges"]),
        "total_badges_count": len(BADGE_DEFINITIONS),
        "daily_quests": state["daily_quests"]
    }

@router.post("/claim_quest")
async def claim_quest_reward(quest_id: str, current_user: User = Depends(get_current_user)):
    """Claim XP reward for a completed daily quest."""
    state = get_user_gamification_state(current_user.id)
    quest = next((q for q in state["daily_quests"] if q["id"] == quest_id), None)
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
        
    if not quest["completed"]:
        raise HTTPException(status_code=400, detail="Quest is not completed yet")
        
    if quest["claimed"]:
        raise HTTPException(status_code=400, detail="Quest reward already claimed")
        
    quest["claimed"] = True
    reward_xp = quest["xp_reward"]
    
    update = await award_xp(current_user.id, reward_xp, "quest_claim", {"quest_id": quest_id})
    return {
        "success": True,
        "reward_xp": reward_xp,
        "gamification": update
    }

@router.get("/leaderboard")
async def get_leaderboard(current_user: User = Depends(get_current_user)):
    """Fetch community and peer learning leaderboard."""
    leaderboard = get_leaderboard_standings(current_user.id)
    return {
        "leaderboard": leaderboard,
        "user_rank": next((u["rank"] for u in leaderboard if u["id"] == current_user.id), 1)
    }
