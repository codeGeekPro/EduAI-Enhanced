"""
🎓 EduAI Enhanced - Routes Mode Offline
Support pour PWA et fonctionnement hors ligne
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/sync")
async def sync_offline_data():
    """Synchroniser les données offline"""
    return {"message": "Sync offline - À implémenter"}
