from fastapi import APIRouter, Depends
from auth.deps import get_current_user
from prisma.models import User
from services.reports import generate_user_learning_report

router = APIRouter()

@router.get("/summary")
async def get_learning_report_summary(current_user: User = Depends(get_current_user)):
    """Generate and return comprehensive learning report."""
    report = await generate_user_learning_report(current_user.id)
    return report

@router.get("/recommendations")
async def get_targeted_recommendations(current_user: User = Depends(get_current_user)):
    """Fetch actionable personalized improvement recommendations."""
    report = await generate_user_learning_report(current_user.id)
    return {
        "recommendations": report.get("recommendations", []),
        "growth_areas": report.get("growth_areas", []),
        "strengths": report.get("strengths", [])
    }
