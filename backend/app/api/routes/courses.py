"""
🎓 EduAI Enhanced - Routes Cours
Gestion des cours et contenus éducatifs
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_courses():
    """Lister les cours disponibles"""
    return {"message": "Cours - À implémenter"}

@router.get("/{course_id}")
async def get_course(course_id: str):
    """Obtenir un cours spécifique"""
    return {"message": f"Cours {course_id} - À implémenter"}
