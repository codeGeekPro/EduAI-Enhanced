"""
🎓 EduAI Enhanced - Routes Cours Avec Pagination
Gestion des cours et contenus éducatifs avec pagination avancée
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from backend.app.core.database import db
from backend.app.core.pagination import (
    PaginatedResponse, 
    CoursePaginationParams, 
    get_course_pagination_params,
    MongoDBPaginator,
    PaginationPatterns
)
from backend.app.core.cache import cache_result
from backend.app.core.logging import log_api_request, get_context_logger

router = APIRouter()
logger = get_context_logger("courses_api", service="courses")

# Modèles Pydantic pour les cours

class CourseBase(BaseModel):
    """Modèle de base pour un cours"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(..., min_length=1, max_length=100)
    difficulty: str = Field(..., regex="^(Beginner|Intermediate|Advanced)$")
    language: str = Field("French", max_length=50)
    duration_minutes: Optional[int] = Field(None, ge=1)
    prerequisites: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class CourseCreate(CourseBase):
    """Modèle pour créer un cours"""
    pass

class CourseUpdate(BaseModel):
    """Modèle pour mettre à jour un cours"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    difficulty: Optional[str] = Field(None, regex="^(Beginner|Intermediate|Advanced)$")
    language: Optional[str] = Field(None, max_length=50)
    duration_minutes: Optional[int] = Field(None, ge=1)
    prerequisites: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class Course(CourseBase):
    """Modèle complet d'un cours"""
    id: str = Field(..., alias="_id")
    is_published: bool = Field(default=False)
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    enrollment_count: int = Field(default=0)
    rating_average: Optional[float] = Field(None, ge=0, le=5)
    rating_count: int = Field(default=0)
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CourseStats(BaseModel):
    """Statistiques d'un cours"""
    total_lessons: int
    total_duration_minutes: int
    completion_rate: float
    average_rating: float
    total_enrollments: int
    active_students: int

# Routes avec pagination

@router.get("/", response_model=PaginatedResponse[Course])
@cache_result(ttl=300)  # Cache de 5 minutes
async def list_courses(
    pagination: CoursePaginationParams = Depends(get_course_pagination_params)
):
    """
    Lister les cours avec pagination et filtres avancés
    
    - **page**: Numéro de page (défaut: 1)
    - **size**: Taille de page (défaut: 20, max: 100)
    - **search**: Recherche dans titre et description
    - **category**: Filtrer par catégorie
    - **difficulty**: Filtrer par niveau de difficulté
    - **language**: Filtrer par langue
    - **is_published**: Filtrer par statut de publication
    - **sort_by**: Champ de tri (title, created_at, rating_average, etc.)
    - **sort_order**: Ordre de tri (asc/desc)
    """
    
    try:
        # Créer le paginateur
        paginator = MongoDBPaginator(db.courses)
        
        # Construire les filtres additionnels
        additional_filters = PaginationPatterns.create_course_filters(pagination)
        
        # Champs de recherche
        search_fields = ["title", "description", "category", "tags"]
        
        # Exécuter la pagination
        result = await paginator.paginate(
            pagination=pagination,
            search_fields=search_fields,
            additional_filters=additional_filters
        )
        
        # Convertir les résultats en modèles Pydantic
        courses = []
        for course_data in result.items:
            course_data["id"] = str(course_data.pop("_id"))
            courses.append(Course(**course_data))
        
        # Logger la requête
        logger.info(
            "Courses listed successfully",
            page=pagination.page,
            size=pagination.size,
            total_results=result.meta.total_items,
            filters_applied=bool(additional_filters),
            search_query=pagination.search
        )
        
        return PaginatedResponse(items=courses, meta=result.meta)
        
    except Exception as e:
        logger.error(f"Error listing courses: {str(e)}", error_type=type(e).__name__)
        raise HTTPException(status_code=500, detail="Error retrieving courses")

@router.get("/categories")
@cache_result(ttl=3600)  # Cache d'1 heure
async def get_course_categories():
    """Obtenir toutes les catégories de cours disponibles"""
    try:
        categories = await db.courses.distinct("category", {"is_published": True})
        
        # Compter les cours par catégorie
        category_counts = {}
        for category in categories:
            count = await db.courses.count_documents({
                "category": category,
                "is_published": True
            })
            category_counts[category] = count
        
        logger.info(f"Retrieved {len(categories)} course categories")
        
        return {
            "categories": categories,
            "category_counts": category_counts,
            "total_categories": len(categories)
        }
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving categories")

@router.get("/search/advanced")
async def advanced_course_search(
    query: str = Query(..., min_length=1),
    categories: Optional[List[str]] = Query(None),
    difficulties: Optional[List[str]] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    max_duration: Optional[int] = Query(None, ge=1),
    pagination: CoursePaginationParams = Depends(get_course_pagination_params)
):
    """
    Recherche avancée de cours avec filtres multiples
    
    - **query**: Terme de recherche (obligatoire)
    - **categories**: Liste des catégories à inclure
    - **difficulties**: Liste des niveaux de difficulté
    - **min_rating**: Note minimum requise
    - **max_duration**: Durée maximum en minutes
    """
    
    try:
        # Pipeline d'agrégation MongoDB pour la recherche avancée
        pipeline = []
        
        # Étape de recherche textuelle
        search_stage = {
            "$match": {
                "$and": [
                    {"is_published": True},
                    {
                        "$or": [
                            {"title": {"$regex": query, "$options": "i"}},
                            {"description": {"$regex": query, "$options": "i"}},
                            {"tags": {"$in": [{"$regex": query, "$options": "i"}]}}
                        ]
                    }
                ]
            }
        }
        
        # Ajouter les filtres
        if categories:
            search_stage["$match"]["$and"].append({"category": {"$in": categories}})
        
        if difficulties:
            search_stage["$match"]["$and"].append({"difficulty": {"$in": difficulties}})
        
        if min_rating is not None:
            search_stage["$match"]["$and"].append({"rating_average": {"$gte": min_rating}})
        
        if max_duration is not None:
            search_stage["$match"]["$and"].append({"duration_minutes": {"$lte": max_duration}})
        
        pipeline.append(search_stage)
        
        # Ajouter le score de pertinence
        pipeline.append({
            "$addFields": {
                "relevance_score": {
                    "$add": [
                        {
                            "$cond": [
                                {"$regexMatch": {"input": "$title", "regex": query, "options": "i"}},
                                10, 0
                            ]
                        },
                        {
                            "$cond": [
                                {"$regexMatch": {"input": "$description", "regex": query, "options": "i"}},
                                5, 0
                            ]
                        },
                        {"$multiply": [{"$ifNull": ["$rating_average", 0]}, 2]}
                    ]
                }
            }
        })
        
        # Utiliser la pagination avec agrégation
        result = await PaginationPatterns.paginate_with_aggregation(
            collection=db.courses,
            pipeline=pipeline,
            pagination=pagination,
            search_stage=None  # Déjà inclus dans la pipeline
        )
        
        # Convertir en modèles Pydantic
        courses = []
        for course_data in result.items:
            course_data["id"] = str(course_data.pop("_id"))
            course_data.pop("relevance_score", None)  # Retirer le score de la réponse
            courses.append(Course(**course_data))
        
        logger.info(
            "Advanced search completed",
            query=query,
            total_results=result.meta.total_items,
            filters_count=len([f for f in [categories, difficulties, min_rating, max_duration] if f is not None])
        )
        
        return PaginatedResponse(items=courses, meta=result.meta)
        
    except Exception as e:
        logger.error(f"Error in advanced search: {str(e)}")
        raise HTTPException(status_code=500, detail="Error in advanced search")

@router.get("/{course_id}", response_model=Course)
@cache_result(ttl=600)  # Cache de 10 minutes
async def get_course(course_id: str):
    """Obtenir un cours spécifique par son ID"""
    try:
        from bson import ObjectId
        
        # Valider l'ObjectId
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID format")
        
        course_data = await db.courses.find_one({"_id": ObjectId(course_id)})
        
        if not course_data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Convertir en modèle Pydantic
        course_data["id"] = str(course_data.pop("_id"))
        course = Course(**course_data)
        
        logger.info(f"Course retrieved successfully", course_id=course_id, course_title=course.title)
        
        return course
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving course")

@router.get("/{course_id}/stats", response_model=CourseStats)
@cache_result(ttl=300)  # Cache de 5 minutes
async def get_course_stats(course_id: str):
    """Obtenir les statistiques d'un cours"""
    try:
        from bson import ObjectId
        
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID format")
        
        # Vérifier que le cours existe
        course = await db.courses.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Pipeline d'agrégation pour calculer les statistiques
        stats_pipeline = [
            {"$match": {"_id": ObjectId(course_id)}},
            {
                "$lookup": {
                    "from": "lessons",
                    "localField": "_id",
                    "foreignField": "course_id",
                    "as": "lessons"
                }
            },
            {
                "$lookup": {
                    "from": "enrollments",
                    "localField": "_id",
                    "foreignField": "course_id",
                    "as": "enrollments"
                }
            },
            {
                "$lookup": {
                    "from": "progress",
                    "localField": "_id",
                    "foreignField": "course_id",
                    "as": "progress"
                }
            },
            {
                "$project": {
                    "total_lessons": {"$size": "$lessons"},
                    "total_duration_minutes": {"$sum": "$lessons.duration_minutes"},
                    "total_enrollments": {"$size": "$enrollments"},
                    "active_students": {
                        "$size": {
                            "$filter": {
                                "input": "$enrollments",
                                "cond": {"$eq": ["$$this.status", "active"]}
                            }
                        }
                    },
                    "completion_rate": {
                        "$avg": "$progress.completion_percentage"
                    },
                    "average_rating": "$rating_average"
                }
            }
        ]
        
        result = await db.courses.aggregate(stats_pipeline).to_list(1)
        
        if not result:
            raise HTTPException(status_code=404, detail="Course statistics not found")
        
        stats_data = result[0]
        
        # Valeurs par défaut pour les champs manquants
        stats = CourseStats(
            total_lessons=stats_data.get("total_lessons", 0),
            total_duration_minutes=stats_data.get("total_duration_minutes", 0),
            completion_rate=round(stats_data.get("completion_rate", 0.0), 2),
            average_rating=round(stats_data.get("average_rating", 0.0), 2),
            total_enrollments=stats_data.get("total_enrollments", 0),
            active_students=stats_data.get("active_students", 0)
        )
        
        logger.info(f"Course stats retrieved", course_id=course_id, total_enrollments=stats.total_enrollments)
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course stats {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving course statistics")

@router.post("/", response_model=Course, status_code=201)
async def create_course(course_data: CourseCreate):
    """Créer un nouveau cours"""
    try:
        # Préparer les données pour l'insertion
        course_dict = course_data.dict()
        course_dict.update({
            "is_published": False,
            "created_at": datetime.utcnow(),
            "enrollment_count": 0,
            "rating_count": 0
        })
        
        # Insérer en base
        result = await db.courses.insert_one(course_dict)
        
        # Récupérer le cours créé
        created_course = await db.courses.find_one({"_id": result.inserted_id})
        created_course["id"] = str(created_course.pop("_id"))
        
        logger.info(f"Course created successfully", course_id=created_course["id"], title=course_data.title)
        
        return Course(**created_course)
        
    except Exception as e:
        logger.error(f"Error creating course: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating course")

@router.put("/{course_id}", response_model=Course)
async def update_course(course_id: str, course_update: CourseUpdate):
    """Mettre à jour un cours existant"""
    try:
        from bson import ObjectId
        
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID format")
        
        # Préparer les données de mise à jour
        update_data = {k: v for k, v in course_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Mettre à jour en base
        result = await db.courses.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Récupérer le cours mis à jour
        updated_course = await db.courses.find_one({"_id": ObjectId(course_id)})
        updated_course["id"] = str(updated_course.pop("_id"))
        
        logger.info(f"Course updated successfully", course_id=course_id, fields_updated=len(update_data))
        
        return Course(**updated_course)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating course")

@router.delete("/{course_id}", status_code=204)
async def delete_course(course_id: str):
    """Supprimer un cours"""
    try:
        from bson import ObjectId
        
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID format")
        
        result = await db.courses.delete_one({"_id": ObjectId(course_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        
        logger.info(f"Course deleted successfully", course_id=course_id)
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting course")
