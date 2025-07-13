"""
🎓 EduAI Enhanced - Routes Utilisateurs Avec Pagination
Gestion des profils et données utilisateurs avec pagination avancée
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from backend.app.core.database import db
from backend.app.core.pagination import (
    PaginatedResponse,
    UserPaginationParams,
    get_user_pagination_params,
    MongoDBPaginator,
    PaginationPatterns
)
from backend.app.core.cache import cache_result
from backend.app.core.logging import get_context_logger
from backend.app.api.routes.auth import get_current_user

router = APIRouter()
logger = get_context_logger("users_api", service="users")

# Modèles Pydantic pour les utilisateurs

class UserBase(BaseModel):
    """Modèle de base pour un utilisateur"""
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    full_name: str = Field(..., min_length=1, max_length=100)
    preferred_language: str = Field("French", max_length=50)
    timezone: Optional[str] = Field(None, max_length=50)
    
class UserProfile(UserBase):
    """Profil utilisateur complet"""
    id: str = Field(..., alias="_id")
    role: str = Field(default="student")
    is_active: bool = Field(default=True)
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    interests: List[str] = Field(default_factory=list)
    created_at: datetime
    last_active: Optional[datetime] = None
    email_verified: bool = Field(default=False)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserStats(BaseModel):
    """Statistiques d'apprentissage utilisateur"""
    total_sessions: int
    learning_streak: int
    favorite_subjects: List[str]
    total_learning_time: int  # en minutes
    courses_enrolled: int
    courses_completed: int
    badges_earned: int
    current_level: str
    experience_points: int
    weekly_goal_progress: float  # pourcentage
    monthly_activity: Dict[str, int]  # jours du mois -> minutes d'activité

class UserActivity(BaseModel):
    """Activité utilisateur"""
    user_id: str
    date: datetime
    activity_type: str  # "course_start", "lesson_complete", "quiz_passed", etc.
    details: Dict[str, Any]
    duration_minutes: Optional[int] = None

class UserPreferences(BaseModel):
    """Préférences utilisateur"""
    language: str = "French"
    timezone: str = "Europe/Paris"
    notifications_enabled: bool = True
    email_notifications: bool = True
    difficulty_preference: str = "Adaptive"
    learning_style: Optional[str] = None
    daily_goal_minutes: int = 30
    preferred_study_time: Optional[str] = None  # "morning", "afternoon", "evening"

class UserUpdate(BaseModel):
    """Modèle pour mettre à jour un utilisateur"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    interests: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None

# Routes avec pagination pour les administrateurs

@router.get("/", response_model=PaginatedResponse[UserProfile])
async def list_users(
    pagination: UserPaginationParams = Depends(get_user_pagination_params),
    current_user: dict = Depends(get_current_user)
):
    """
    Lister les utilisateurs avec pagination (admin seulement)
    
    - **page**: Numéro de page (défaut: 1)
    - **size**: Taille de page (défaut: 20, max: 100)
    - **search**: Recherche dans nom et email
    - **role**: Filtrer par rôle (student, teacher, admin)
    - **is_active**: Filtrer par statut actif
    - **registration_date_from**: Date d'inscription à partir de
    - **registration_date_to**: Date d'inscription jusqu'à
    - **sort_by**: Champ de tri (full_name, created_at, last_active, etc.)
    - **sort_order**: Ordre de tri (asc/desc)
    """
    
    # Vérifier les permissions administrateur
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Créer le paginateur
        paginator = MongoDBPaginator(db.users)
        
        # Construire les filtres additionnels
        additional_filters = PaginationPatterns.create_user_filters(pagination)
        
        # Champs de recherche
        search_fields = ["full_name", "email"]
        
        # Exécuter la pagination
        result = await paginator.paginate(
            pagination=pagination,
            search_fields=search_fields,
            additional_filters=additional_filters
        )
        
        # Convertir les résultats en modèles Pydantic (sans mot de passe)
        users = []
        for user_data in result.items:
            user_data["id"] = str(user_data.pop("_id"))
            user_data.pop("password_hash", None)  # Retirer le hash du mot de passe
            users.append(UserProfile(**user_data))
        
        logger.info(
            "Users listed by admin",
            admin_id=current_user.get("user_id"),
            page=pagination.page,
            total_results=result.meta.total_items,
            filters_applied=bool(additional_filters)
        )
        
        return PaginatedResponse(items=users, meta=result.meta)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}", admin_id=current_user.get("user_id"))
        raise HTTPException(status_code=500, detail="Error retrieving users")

@router.get("/analytics/overview")
@cache_result(ttl=300)  # Cache de 5 minutes
async def get_users_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Obtenir un aperçu analytique des utilisateurs (admin seulement)"""
    
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Pipeline d'agrégation pour les analytics
        analytics_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "active_users": {
                        "$sum": {
                            "$cond": [{"$eq": ["$is_active", True]}, 1, 0]
                        }
                    },
                    "verified_users": {
                        "$sum": {
                            "$cond": [{"$eq": ["$email_verified", True]}, 1, 0]
                        }
                    }
                }
            }
        ]
        
        # Exécuter l'agrégation
        result = await db.users.aggregate(analytics_pipeline).to_list(1)
        stats = result[0] if result else {"total_users": 0, "active_users": 0, "verified_users": 0}
        
        # Statistiques par rôle
        role_stats = await db.users.aggregate([
            {"$group": {"_id": "$role", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Nouvelles inscriptions (7 derniers jours)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        new_registrations = await db.users.count_documents({
            "created_at": {"$gte": seven_days_ago}
        })
        
        # Utilisateurs actifs (dernières 24h)
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        active_last_24h = await db.users.count_documents({
            "last_active": {"$gte": twenty_four_hours_ago}
        })
        
        logger.info("User analytics retrieved", admin_id=current_user.get("user_id"))
        
        return {
            "overview": {
                "total_users": stats["total_users"],
                "active_users": stats["active_users"],
                "verified_users": stats["verified_users"],
                "new_registrations_7d": new_registrations,
                "active_last_24h": active_last_24h
            },
            "by_role": {item["_id"]: item["count"] for item in role_stats},
            "activity_metrics": {
                "activation_rate": round((stats["active_users"] / max(stats["total_users"], 1)) * 100, 2),
                "verification_rate": round((stats["verified_users"] / max(stats["total_users"], 1)) * 100, 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving user analytics")

# Routes pour le profil personnel

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Obtenir le profil de l'utilisateur connecté"""
    try:
        from bson import ObjectId
        
        user_data = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Convertir en modèle Pydantic
        user_data["id"] = str(user_data.pop("_id"))
        user_data.pop("password_hash", None)  # Retirer le hash du mot de passe
        
        return UserProfile(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}", user_id=current_user.get("user_id"))
        raise HTTPException(status_code=500, detail="Error retrieving user profile")

@router.get("/me/stats", response_model=UserStats)
@cache_result(ttl=300)  # Cache de 5 minutes
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Obtenir les statistiques d'apprentissage de l'utilisateur connecté"""
    try:
        from bson import ObjectId
        
        user_id = ObjectId(current_user["user_id"])
        
        # Pipeline d'agrégation pour calculer les statistiques
        stats_pipeline = [
            {"$match": {"_id": user_id}},
            {
                "$lookup": {
                    "from": "enrollments",
                    "localField": "_id",
                    "foreignField": "user_id",
                    "as": "enrollments"
                }
            },
            {
                "$lookup": {
                    "from": "sessions",
                    "localField": "_id",
                    "foreignField": "user_id",
                    "as": "sessions"
                }
            },
            {
                "$lookup": {
                    "from": "achievements",
                    "localField": "_id",
                    "foreignField": "user_id",
                    "as": "achievements"
                }
            },
            {
                "$project": {
                    "total_sessions": {"$size": "$sessions"},
                    "courses_enrolled": {"$size": "$enrollments"},
                    "courses_completed": {
                        "$size": {
                            "$filter": {
                                "input": "$enrollments",
                                "cond": {"$eq": ["$$this.status", "completed"]}
                            }
                        }
                    },
                    "badges_earned": {"$size": "$achievements"},
                    "total_learning_time": {"$sum": "$sessions.duration_minutes"},
                    "experience_points": {"$sum": "$sessions.xp_earned"}
                }
            }
        ]
        
        result = await db.users.aggregate(stats_pipeline).to_list(1)
        
        if not result:
            # Utilisateur nouveau, créer des stats par défaut
            stats_data = {
                "total_sessions": 0,
                "courses_enrolled": 0,
                "courses_completed": 0,
                "badges_earned": 0,
                "total_learning_time": 0,
                "experience_points": 0
            }
        else:
            stats_data = result[0]
        
        # Calculer le streak d'apprentissage
        learning_streak = await calculate_learning_streak(user_id)
        
        # Obtenir les sujets favoris
        favorite_subjects = await get_favorite_subjects(user_id)
        
        # Calculer le niveau actuel
        current_level = calculate_level_from_xp(stats_data.get("experience_points", 0))
        
        # Calculer le progrès hebdomadaire
        weekly_progress = await calculate_weekly_goal_progress(user_id)
        
        # Activité mensuelle
        monthly_activity = await get_monthly_activity(user_id)
        
        stats = UserStats(
            total_sessions=stats_data.get("total_sessions", 0),
            learning_streak=learning_streak,
            favorite_subjects=favorite_subjects,
            total_learning_time=stats_data.get("total_learning_time", 0),
            courses_enrolled=stats_data.get("courses_enrolled", 0),
            courses_completed=stats_data.get("courses_completed", 0),
            badges_earned=stats_data.get("badges_earned", 0),
            current_level=current_level,
            experience_points=stats_data.get("experience_points", 0),
            weekly_goal_progress=weekly_progress,
            monthly_activity=monthly_activity
        )
        
        logger.info("User stats retrieved", user_id=current_user["user_id"])
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}", user_id=current_user.get("user_id"))
        raise HTTPException(status_code=500, detail="Error retrieving user statistics")

@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le profil de l'utilisateur connecté"""
    try:
        from bson import ObjectId
        
        # Préparer les données de mise à jour
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Mettre à jour en base
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Récupérer l'utilisateur mis à jour
        updated_user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        updated_user["id"] = str(updated_user.pop("_id"))
        updated_user.pop("password_hash", None)
        
        logger.info("User profile updated", user_id=current_user["user_id"], fields_updated=len(update_data))
        
        return UserProfile(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}", user_id=current_user.get("user_id"))
        raise HTTPException(status_code=500, detail="Error updating user profile")

@router.get("/me/activity")
async def get_user_activity(
    days: int = Query(7, ge=1, le=90, description="Nombre de jours d'historique"),
    current_user: dict = Depends(get_current_user)
):
    """Obtenir l'historique d'activité de l'utilisateur"""
    try:
        from bson import ObjectId
        
        user_id = ObjectId(current_user["user_id"])
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Récupérer les activités
        activities = await db.user_activities.find({
            "user_id": user_id,
            "date": {"$gte": start_date}
        }).sort("date", -1).to_list(None)
        
        # Convertir en modèles Pydantic
        activity_list = []
        for activity in activities:
            activity["user_id"] = str(activity["user_id"])
            activity_list.append(UserActivity(**activity))
        
        logger.info("User activity retrieved", user_id=current_user["user_id"], days=days, activities_count=len(activity_list))
        
        return {
            "activities": activity_list,
            "period_days": days,
            "total_activities": len(activity_list)
        }
        
    except Exception as e:
        logger.error(f"Error getting user activity: {str(e)}", user_id=current_user.get("user_id"))
        raise HTTPException(status_code=500, detail="Error retrieving user activity")

# Fonctions utilitaires

async def calculate_learning_streak(user_id) -> int:
    """Calculer le streak d'apprentissage actuel"""
    try:
        # Récupérer les sessions récentes
        sessions = await db.sessions.find({
            "user_id": user_id
        }).sort("date", -1).to_list(None)
        
        if not sessions:
            return 0
        
        # Calculer le streak
        streak = 0
        current_date = datetime.utcnow().date()
        
        for session in sessions:
            session_date = session["date"].date()
            
            if session_date == current_date or session_date == current_date - timedelta(days=streak):
                streak += 1
                current_date = session_date
            else:
                break
        
        return streak
    except:
        return 0

async def get_favorite_subjects(user_id) -> List[str]:
    """Obtenir les sujets favoris basés sur l'activité"""
    try:
        # Pipeline pour analyser les sujets les plus étudiés
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$lookup": {
                    "from": "courses",
                    "localField": "course_id",
                    "foreignField": "_id",
                    "as": "course"
                }
            },
            {"$unwind": "$course"},
            {
                "$group": {
                    "_id": "$course.category",
                    "total_time": {"$sum": "$duration_minutes"}
                }
            },
            {"$sort": {"total_time": -1}},
            {"$limit": 3}
        ]
        
        result = await db.sessions.aggregate(pipeline).to_list(None)
        return [item["_id"] for item in result]
    except:
        return []

def calculate_level_from_xp(xp: int) -> str:
    """Calculer le niveau basé sur les points d'expérience"""
    if xp < 100:
        return "Débutant"
    elif xp < 500:
        return "Apprenti"
    elif xp < 1000:
        return "Intermédiaire"
    elif xp < 2500:
        return "Avancé"
    elif xp < 5000:
        return "Expert"
    else:
        return "Maître"

async def calculate_weekly_goal_progress(user_id) -> float:
    """Calculer le progrès vers l'objectif hebdomadaire"""
    try:
        # Récupérer l'objectif quotidien de l'utilisateur
        user = await db.users.find_one({"_id": user_id})
        daily_goal = user.get("preferences", {}).get("daily_goal_minutes", 30)
        weekly_goal = daily_goal * 7
        
        # Calculer le temps passé cette semaine
        week_start = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        weekly_sessions = await db.sessions.find({
            "user_id": user_id,
            "date": {"$gte": week_start}
        }).to_list(None)
        
        total_minutes = sum(session.get("duration_minutes", 0) for session in weekly_sessions)
        
        return min(100.0, (total_minutes / weekly_goal) * 100) if weekly_goal > 0 else 0.0
    except:
        return 0.0

async def get_monthly_activity(user_id) -> Dict[str, int]:
    """Obtenir l'activité mensuelle (jours -> minutes)"""
    try:
        # Début du mois actuel
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Pipeline d'agrégation pour grouper par jour
        pipeline = [
            {"$match": {"user_id": user_id, "date": {"$gte": month_start}}},
            {
                "$group": {
                    "_id": {"$dayOfMonth": "$date"},
                    "total_minutes": {"$sum": "$duration_minutes"}
                }
            }
        ]
        
        result = await db.sessions.aggregate(pipeline).to_list(None)
        return {str(item["_id"]): item["total_minutes"] for item in result}
    except:
        return {}
