"""
🎓 EduAI Enhanced - Routes Analytics
Analytics et métriques d'apprentissage
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_analytics_dashboard():
    """Tableau de bord analytics"""
    return {"message": "Analytics dashboard - À implémenter"}
