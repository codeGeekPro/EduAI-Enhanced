"""
📦 Système de cache Redis avancé pour EduAI Enhanced
Optimisation des performances avec mise en cache intelligente
"""

import json
import hashlib
import asyncio
from functools import wraps
from typing import Any, Optional, Callable, Union
from datetime import datetime, timedelta
import redis.asyncio as redis
import logging

from backend.app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class CacheManager:
    """Gestionnaire de cache Redis avancé"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.default_ttl = 300  # 5 minutes par défaut
        self.cache_prefix = "eduai"
        
    async def initialize(self):
        """Initialiser la connexion Redis"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
                retry_on_timeout=True
            )
            # Test de connexion
            await self.redis_client.ping()
            logger.info("✅ Cache Redis initialisé avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur initialisation cache Redis: {e}")
            self.redis_client = None
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Générer une clé de cache unique"""
        # Créer un hash unique des arguments
        content = str(args) + str(sorted(kwargs.items()))
        hash_object = hashlib.md5(content.encode())
        hash_hex = hash_object.hexdigest()[:12]  # 12 premiers caractères
        
        return f"{self.cache_prefix}:{prefix}:{hash_hex}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Récupérer une valeur du cache"""
        if not self.redis_client:
            return None
            
        try:
            cached_data = await self.redis_client.get(key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Erreur lecture cache {key}: {e}")
        
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Stocker une valeur dans le cache"""
        if not self.redis_client:
            return False
            
        try:
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            await self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.warning(f"Erreur écriture cache {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Supprimer une clé du cache"""
        if not self.redis_client:
            return False
            
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Erreur suppression cache {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Supprimer toutes les clés correspondant à un pattern"""
        if not self.redis_client:
            return 0
            
        try:
            keys = await self.redis_client.keys(f"{self.cache_prefix}:{pattern}*")
            if keys:
                return await self.redis_client.delete(*keys)
        except Exception as e:
            logger.warning(f"Erreur nettoyage cache pattern {pattern}: {e}")
        
        return 0
    
    async def exists(self, key: str) -> bool:
        """Vérifier si une clé existe dans le cache"""
        if not self.redis_client:
            return False
            
        try:
            return bool(await self.redis_client.exists(key))
        except Exception as e:
            logger.warning(f"Erreur vérification existence cache {key}: {e}")
            return False
    
    async def increment(self, key: str, amount: int = 1, ttl: Optional[int] = None) -> int:
        """Incrémenter une valeur numérique"""
        if not self.redis_client:
            return 0
            
        try:
            value = await self.redis_client.incr(key, amount)
            if ttl:
                await self.redis_client.expire(key, ttl)
            return value
        except Exception as e:
            logger.warning(f"Erreur incrémentation cache {key}: {e}")
            return 0
    
    async def get_stats(self) -> dict:
        """Obtenir les statistiques du cache"""
        if not self.redis_client:
            return {"status": "disconnected"}
            
        try:
            info = await self.redis_client.info()
            return {
                "status": "connected",
                "used_memory": info.get("used_memory_human", "N/A"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(
                    info.get("keyspace_hits", 0),
                    info.get("keyspace_misses", 0)
                )
            }
        except Exception as e:
            logger.error(f"Erreur récupération stats cache: {e}")
            return {"status": "error", "error": str(e)}
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        """Calculer le taux de réussite du cache"""
        total = hits + misses
        return round((hits / total * 100) if total > 0 else 0, 2)

# Instance globale du gestionnaire de cache
cache_manager = CacheManager()

def cache_result(
    ttl: int = 300,
    prefix: str = "func",
    skip_cache_if: Optional[Callable] = None,
    cache_key_builder: Optional[Callable] = None
):
    """
    Décorateur pour mettre en cache le résultat d'une fonction
    
    Args:
        ttl: Durée de vie du cache en secondes
        prefix: Préfixe pour la clé de cache
        skip_cache_if: Fonction qui détermine si le cache doit être ignoré
        cache_key_builder: Fonction personnalisée pour construire la clé de cache
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Vérifier si on doit ignorer le cache
            if skip_cache_if and skip_cache_if(*args, **kwargs):
                return await func(*args, **kwargs)
            
            # Construire la clé de cache
            if cache_key_builder:
                cache_key = cache_key_builder(*args, **kwargs)
            else:
                cache_key = cache_manager._generate_cache_key(prefix, *args, **kwargs)
            
            # Essayer de récupérer depuis le cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit pour {func.__name__}: {cache_key}")
                return cached_result
            
            # Exécuter la fonction et mettre en cache
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ttl)
            logger.debug(f"Cache miss pour {func.__name__}: {cache_key}")
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Version synchrone pour les fonctions non-async
            if skip_cache_if and skip_cache_if(*args, **kwargs):
                return func(*args, **kwargs)
            
            if cache_key_builder:
                cache_key = cache_key_builder(*args, **kwargs)
            else:
                cache_key = cache_manager._generate_cache_key(prefix, *args, **kwargs)
            
            # Pour les fonctions sync, on utilise une version bloquante
            try:
                loop = asyncio.get_event_loop()
                cached_result = loop.run_until_complete(cache_manager.get(cache_key))
                if cached_result is not None:
                    return cached_result
                
                result = func(*args, **kwargs)
                loop.run_until_complete(cache_manager.set(cache_key, result, ttl))
                return result
            except Exception as e:
                logger.warning(f"Erreur cache sync pour {func.__name__}: {e}")
                return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Décorateurs spécialisés pour différents types de données
def cache_user_data(ttl: int = 900):  # 15 minutes
    """Cache spécialisé pour les données utilisateur"""
    return cache_result(ttl=ttl, prefix="user")

def cache_course_data(ttl: int = 1800):  # 30 minutes
    """Cache spécialisé pour les données de cours"""
    return cache_result(ttl=ttl, prefix="course")

def cache_ai_response(ttl: int = 3600):  # 1 heure
    """Cache spécialisé pour les réponses IA"""
    return cache_result(ttl=ttl, prefix="ai")

def cache_analytics(ttl: int = 300):  # 5 minutes
    """Cache spécialisé pour les analytics"""
    return cache_result(ttl=ttl, prefix="analytics")

# Classes utilitaires pour la gestion du cache

class UserCache:
    """Gestionnaire de cache spécialisé pour les utilisateurs"""
    
    @staticmethod
    async def get_user_profile(user_id: str) -> Optional[dict]:
        """Récupérer le profil utilisateur depuis le cache"""
        key = f"user:profile:{user_id}"
        return await cache_manager.get(key)
    
    @staticmethod
    async def set_user_profile(user_id: str, profile_data: dict, ttl: int = 900):
        """Mettre en cache le profil utilisateur"""
        key = f"user:profile:{user_id}"
        await cache_manager.set(key, profile_data, ttl)
    
    @staticmethod
    async def invalidate_user_cache(user_id: str):
        """Invalider tout le cache d'un utilisateur"""
        await cache_manager.clear_pattern(f"user:*:{user_id}")

class CourseCache:
    """Gestionnaire de cache spécialisé pour les cours"""
    
    @staticmethod
    async def get_course_list(filters: dict) -> Optional[list]:
        """Récupérer la liste des cours depuis le cache"""
        filter_hash = hashlib.md5(str(sorted(filters.items())).encode()).hexdigest()[:8]
        key = f"course:list:{filter_hash}"
        return await cache_manager.get(key)
    
    @staticmethod
    async def set_course_list(filters: dict, course_data: list, ttl: int = 1800):
        """Mettre en cache la liste des cours"""
        filter_hash = hashlib.md5(str(sorted(filters.items())).encode()).hexdigest()[:8]
        key = f"course:list:{filter_hash}"
        await cache_manager.set(key, course_data, ttl)
    
    @staticmethod
    async def invalidate_course_cache():
        """Invalider tout le cache des cours"""
        await cache_manager.clear_pattern("course:*")

class AICache:
    """Gestionnaire de cache spécialisé pour les réponses IA"""
    
    @staticmethod
    async def get_ai_response(prompt_hash: str, model: str) -> Optional[dict]:
        """Récupérer une réponse IA depuis le cache"""
        key = f"ai:response:{model}:{prompt_hash}"
        return await cache_manager.get(key)
    
    @staticmethod
    async def set_ai_response(prompt_hash: str, model: str, response_data: dict, ttl: int = 3600):
        """Mettre en cache une réponse IA"""
        key = f"ai:response:{model}:{prompt_hash}"
        await cache_manager.set(key, response_data, ttl)
    
    @staticmethod
    def generate_prompt_hash(prompt: str, context: dict = None) -> str:
        """Générer un hash unique pour un prompt"""
        content = prompt + str(context or {})
        return hashlib.sha256(content.encode()).hexdigest()[:16]

# Fonctions utilitaires

async def warm_up_cache():
    """Préchauffer le cache avec des données fréquemment utilisées"""
    logger.info("🔥 Démarrage du préchauffage du cache...")
    
    try:
        # Ici, vous pouvez ajouter la logique pour précharger
        # les données les plus fréquemment utilisées
        pass
    except Exception as e:
        logger.error(f"Erreur lors du préchauffage du cache: {e}")

async def cleanup_expired_cache():
    """Nettoyer les entrées expirées du cache (si nécessaire)"""
    logger.info("🧹 Nettoyage du cache expiré...")
    
    try:
        # Redis gère automatiquement l'expiration, mais on peut
        # ajouter une logique personnalisée ici si nécessaire
        stats = await cache_manager.get_stats()
        logger.info(f"Stats cache après nettoyage: {stats}")
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage du cache: {e}")

# Initialisation automatique
async def initialize_cache():
    """Initialiser le système de cache"""
    await cache_manager.initialize()
    await warm_up_cache()

# Export des principales fonctions et classes
__all__ = [
    'cache_manager',
    'cache_result',
    'cache_user_data',
    'cache_course_data', 
    'cache_ai_response',
    'cache_analytics',
    'UserCache',
    'CourseCache',
    'AICache',
    'initialize_cache'
]
