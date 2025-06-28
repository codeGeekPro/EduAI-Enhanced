"""
🎓 EduAI Enhanced - Routes Utilisateurs
Gestion des profils et données utilisateurs
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

from ...core.database import get_database
from .auth import get_current_user

router = APIRouter()

class UserStats(BaseModel):
    total_sessions: int
    learning_streak: int
    favorite_subjects: List[str]
    total_learning_time: int  # en minutes

@router.get("/me/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Obtenir les statistiques d'apprentissage de l'utilisateur"""
    return {"message": "Stats utilisateur - À implémenter"}

@router.get("/")
async def list_users():
    """Lister les utilisateurs (admin seulement)"""
    return {"message": "Liste utilisateurs - À implémenter"}
