"""
🎓 EduAI Enhanced - Système de Pagination Avancé
Pagination optimisée pour les API avec métadonnées complètes
"""

from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional, Any, Dict
from fastapi import Query, Depends
from math import ceil

T = TypeVar('T')

class PaginationParams(BaseModel):
    """Paramètres de pagination standards"""
    page: int = Field(1, ge=1, description="Numéro de page (commence à 1)")
    size: int = Field(20, ge=1, le=100, description="Nombre d'éléments par page")
    sort_by: Optional[str] = Field(None, description="Champ pour le tri")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Ordre de tri")
    search: Optional[str] = Field(None, description="Terme de recherche")

class PaginationMeta(BaseModel):
    """Métadonnées de pagination"""
    current_page: int
    per_page: int
    total_items: int
    total_pages: int
    has_previous: bool
    has_next: bool
    previous_page: Optional[int]
    next_page: Optional[int]
    sort_by: Optional[str]
    sort_order: str
    search: Optional[str]

class PaginatedResponse(BaseModel, Generic[T]):
    """Réponse paginée générique"""
    items: List[T]
    meta: PaginationMeta
    
    class Config:
        arbitrary_types_allowed = True

def get_pagination_params(
    page: int = Query(1, ge=1, description="Numéro de page"),
    size: int = Query(20, ge=1, le=100, description="Taille de page"),
    sort_by: Optional[str] = Query(None, description="Champ de tri"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Ordre de tri"),
    search: Optional[str] = Query(None, description="Recherche")
) -> PaginationParams:
    """Dependency pour extraire les paramètres de pagination"""
    return PaginationParams(
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search
    )

class PaginationHelper:
    """Helper pour simplifier la pagination MongoDB"""
    
    @staticmethod
    def create_pagination_meta(
        current_page: int,
        per_page: int,
        total_items: int,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
        search: Optional[str] = None
    ) -> PaginationMeta:
        """Créer les métadonnées de pagination"""
        total_pages = ceil(total_items / per_page) if total_items > 0 else 1
        
        has_previous = current_page > 1
        has_next = current_page < total_pages
        
        previous_page = current_page - 1 if has_previous else None
        next_page = current_page + 1 if has_next else None
        
        return PaginationMeta(
            current_page=current_page,
            per_page=per_page,
            total_items=total_items,
            total_pages=total_pages,
            has_previous=has_previous,
            has_next=has_next,
            previous_page=previous_page,
            next_page=next_page,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search
        )
    
    @staticmethod
    def get_skip_limit(page: int, size: int) -> tuple[int, int]:
        """Calculer skip et limit pour MongoDB"""
        skip = (page - 1) * size
        return skip, size
    
    @staticmethod
    def get_sort_criteria(sort_by: Optional[str], sort_order: str = "asc") -> Optional[List[tuple]]:
        """Créer les critères de tri pour MongoDB"""
        if not sort_by:
            return None
        
        direction = 1 if sort_order == "asc" else -1
        return [(sort_by, direction)]
    
    @staticmethod
    def create_search_filter(search: Optional[str], search_fields: List[str]) -> Dict[str, Any]:
        """Créer un filtre de recherche MongoDB"""
        if not search or not search_fields:
            return {}
        
        # Recherche insensible à la casse sur plusieurs champs
        search_conditions = []
        for field in search_fields:
            search_conditions.append({
                field: {"$regex": search, "$options": "i"}
            })
        
        return {"$or": search_conditions} if search_conditions else {}

# Décorateur pour paginer automatiquement les résultats
def paginate(search_fields: Optional[List[str]] = None):
    """Décorateur pour ajouter la pagination automatique"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extraire les paramètres de pagination des kwargs
            pagination = kwargs.get('pagination')
            if not pagination:
                raise ValueError("Pagination parameters required")
            
            # Appeler la fonction originale avec les paramètres de pagination
            result = await func(*args, **kwargs)
            
            # Si le résultat est déjà paginé, le retourner
            if isinstance(result, PaginatedResponse):
                return result
            
            # Sinon, créer une réponse paginée simple
            items = result if isinstance(result, list) else [result]
            meta = PaginationHelper.create_pagination_meta(
                current_page=pagination.page,
                per_page=pagination.size,
                total_items=len(items),
                sort_by=pagination.sort_by,
                sort_order=pagination.sort_order,
                search=pagination.search
            )
            
            return PaginatedResponse(items=items, meta=meta)
        
        return wrapper
    return decorator

# Classes spécialisées pour différents types de contenu

class CoursePaginationParams(PaginationParams):
    """Paramètres de pagination spécifiques aux cours"""
    category: Optional[str] = Field(None, description="Filtrer par catégorie")
    difficulty: Optional[str] = Field(None, description="Filtrer par difficulté")
    language: Optional[str] = Field(None, description="Filtrer par langue")
    is_published: Optional[bool] = Field(None, description="Filtrer par statut de publication")

class UserPaginationParams(PaginationParams):
    """Paramètres de pagination spécifiques aux utilisateurs"""
    role: Optional[str] = Field(None, description="Filtrer par rôle")
    is_active: Optional[bool] = Field(None, description="Filtrer par statut actif")
    registration_date_from: Optional[str] = Field(None, description="Date d'inscription à partir de")
    registration_date_to: Optional[str] = Field(None, description="Date d'inscription jusqu'à")

class ProgressPaginationParams(PaginationParams):
    """Paramètres de pagination spécifiques au progrès"""
    user_id: Optional[str] = Field(None, description="Filtrer par utilisateur")
    course_id: Optional[str] = Field(None, description="Filtrer par cours")
    completion_rate_min: Optional[float] = Field(None, ge=0, le=1, description="Taux de completion minimum")
    completion_rate_max: Optional[float] = Field(None, ge=0, le=1, description="Taux de completion maximum")

# Fonctions helper pour les dépendances FastAPI

def get_course_pagination_params(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None)
) -> CoursePaginationParams:
    """Dependency pour les paramètres de pagination des cours"""
    return CoursePaginationParams(
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        category=category,
        difficulty=difficulty,
        language=language,
        is_published=is_published
    )

def get_user_pagination_params(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    registration_date_from: Optional[str] = Query(None),
    registration_date_to: Optional[str] = Query(None)
) -> UserPaginationParams:
    """Dependency pour les paramètres de pagination des utilisateurs"""
    return UserPaginationParams(
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        role=role,
        is_active=is_active,
        registration_date_from=registration_date_from,
        registration_date_to=registration_date_to
    )

# Classe pour gérer la pagination MongoDB de manière simple

class MongoDBPaginator:
    """Paginateur optimisé pour MongoDB"""
    
    def __init__(self, collection, base_filter: Optional[Dict] = None):
        self.collection = collection
        self.base_filter = base_filter or {}
    
    async def paginate(
        self,
        pagination: PaginationParams,
        search_fields: Optional[List[str]] = None,
        additional_filters: Optional[Dict] = None
    ) -> PaginatedResponse:
        """Paginer les résultats d'une collection MongoDB"""
        
        # Construire le filtre final
        final_filter = {**self.base_filter}
        
        # Ajouter les filtres additionnels
        if additional_filters:
            final_filter.update(additional_filters)
        
        # Ajouter le filtre de recherche
        if pagination.search and search_fields:
            search_filter = PaginationHelper.create_search_filter(
                pagination.search, search_fields
            )
            if search_filter:
                final_filter.update(search_filter)
        
        # Calculer skip et limit
        skip, limit = PaginationHelper.get_skip_limit(pagination.page, pagination.size)
        
        # Construire la requête
        query = self.collection.find(final_filter)
        
        # Ajouter le tri
        sort_criteria = PaginationHelper.get_sort_criteria(
            pagination.sort_by, pagination.sort_order
        )
        if sort_criteria:
            query = query.sort(sort_criteria)
        
        # Exécuter les requêtes en parallèle
        items_coro = query.skip(skip).limit(limit).to_list(length=limit)
        total_coro = self.collection.count_documents(final_filter)
        
        items, total = await items_coro, await total_coro
        
        # Créer les métadonnées
        meta = PaginationHelper.create_pagination_meta(
            current_page=pagination.page,
            per_page=pagination.size,
            total_items=total,
            sort_by=pagination.sort_by,
            sort_order=pagination.sort_order,
            search=pagination.search
        )
        
        return PaginatedResponse(items=items, meta=meta)

# Exemples d'utilisation et patterns

class PaginationPatterns:
    """Patterns communs pour la pagination"""
    
    @staticmethod
    async def paginate_with_aggregation(
        collection,
        pipeline: List[Dict],
        pagination: PaginationParams,
        search_stage: Optional[Dict] = None
    ) -> PaginatedResponse:
        """Paginer avec une pipeline d'agrégation MongoDB"""
        
        # Pipeline de base
        base_pipeline = list(pipeline)
        
        # Ajouter la recherche si nécessaire
        if search_stage and pagination.search:
            base_pipeline.insert(0, search_stage)
        
        # Ajouter le tri
        if pagination.sort_by:
            sort_direction = 1 if pagination.sort_order == "asc" else -1
            base_pipeline.append({"$sort": {pagination.sort_by: sort_direction}})
        
        # Pipeline pour compter le total
        count_pipeline = base_pipeline + [{"$count": "total"}]
        
        # Pipeline pour les données paginées
        skip, limit = PaginationHelper.get_skip_limit(pagination.page, pagination.size)
        data_pipeline = base_pipeline + [
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        # Exécuter les deux pipelines
        count_result = list(await collection.aggregate(count_pipeline).to_list(length=1))
        total = count_result[0]["total"] if count_result else 0
        
        items = await collection.aggregate(data_pipeline).to_list(length=limit)
        
        # Créer les métadonnées
        meta = PaginationHelper.create_pagination_meta(
            current_page=pagination.page,
            per_page=pagination.size,
            total_items=total,
            sort_by=pagination.sort_by,
            sort_order=pagination.sort_order,
            search=pagination.search
        )
        
        return PaginatedResponse(items=items, meta=meta)
    
    @staticmethod
    def create_course_filters(params: CoursePaginationParams) -> Dict[str, Any]:
        """Créer des filtres spécifiques aux cours"""
        filters = {}
        
        if params.category:
            filters["category"] = params.category
        if params.difficulty:
            filters["difficulty"] = params.difficulty
        if params.language:
            filters["language"] = params.language
        if params.is_published is not None:
            filters["is_published"] = params.is_published
        
        return filters
    
    @staticmethod
    def create_user_filters(params: UserPaginationParams) -> Dict[str, Any]:
        """Créer des filtres spécifiques aux utilisateurs"""
        filters = {}
        
        if params.role:
            filters["role"] = params.role
        if params.is_active is not None:
            filters["is_active"] = params.is_active
        
        # Filtres de date
        date_filter = {}
        if params.registration_date_from:
            date_filter["$gte"] = params.registration_date_from
        if params.registration_date_to:
            date_filter["$lte"] = params.registration_date_to
        if date_filter:
            filters["created_at"] = date_filter
        
        return filters
