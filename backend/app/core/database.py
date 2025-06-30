"""
🎓 EduAI Enhanced - Gestion de Base de Données
Configuration MongoDB + Redis pour l'application IA éducative
"""

import asyncio
import json
import motor.motor_asyncio
import redis.asyncio as aioredis
from typing import Optional
from pymongo import IndexModel, ASCENDING, TEXT
import logging

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# 🗄️ Connexions de base de données
mongodb_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
database: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None
redis_client: Optional[aioredis.Redis] = None


async def connect_to_mongodb():
    """Initialiser la connexion MongoDB"""
    global mongodb_client, database
    
    try:
        logger.info("🔌 Connexion à MongoDB...")
        mongodb_client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_url,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000
        )
        
        # Test de connexion
        await mongodb_client.admin.command('ping')
        
        database = mongodb_client[settings.mongodb_db_name]
        logger.info(f"✅ MongoDB connecté: {settings.mongodb_db_name}")
        
        # Créer les index pour optimiser les performances
        await create_database_indexes()
        
    except Exception as e:
        logger.error(f"❌ Erreur connexion MongoDB: {e}")
        raise


async def connect_to_redis():
    """Initialiser la connexion Redis"""
    global redis_client
    
    try:
        logger.info("🔌 Connexion à Redis...")
        redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
        
        # Test de connexion
        await redis_client.ping()
        logger.info("✅ Redis connecté")
        
    except Exception as e:
        logger.error(f"❌ Erreur connexion Redis: {e}")
        raise


async def create_database_indexes():
    """Créer les index de base de données pour optimiser les performances"""
    if not database:
        return
    
    try:
        logger.info("📊 Création des index de base de données...")
        
        # Index pour les utilisateurs
        await database.users.create_indexes([
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("username", ASCENDING)], unique=True),
            IndexModel([("created_at", ASCENDING)]),
            IndexModel([("language", ASCENDING)]),
            IndexModel([("learning_preferences", ASCENDING)])
        ])
        
        # Index pour les cours
        await database.courses.create_indexes([
            IndexModel([("title", TEXT), ("description", TEXT)]),
            IndexModel([("subject", ASCENDING)]),
            IndexModel([("language", ASCENDING)]), 
            IndexModel([("difficulty_level", ASCENDING)]),
            IndexModel([("created_at", ASCENDING)])
        ])
        
        # Index pour les sessions d'apprentissage
        await database.learning_sessions.create_indexes([
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("course_id", ASCENDING)]),
            IndexModel([("started_at", ASCENDING)]),
            IndexModel([("emotion_state", ASCENDING)]),
            IndexModel([("performance_score", ASCENDING)])
        ])
        
        # Index pour les données d'IA
        await database.ai_interactions.create_indexes([
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("session_id", ASCENDING)]),
            IndexModel([("timestamp", ASCENDING)]),
            IndexModel([("interaction_type", ASCENDING)]),
            IndexModel([("language", ASCENDING)])
        ])
        
        # Index pour l'analytics
        await database.analytics.create_indexes([
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("event_type", ASCENDING)]),
            IndexModel([("timestamp", ASCENDING)]),
            IndexModel([("session_id", ASCENDING)])
        ])
        
        # Index pour le cache offline
        await database.offline_cache.create_indexes([
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("content_type", ASCENDING)]),
            IndexModel([("cached_at", ASCENDING)]),
            IndexModel([("expires_at", ASCENDING)])
        ])
        
        logger.info("✅ Index de base de données créés")
        
    except Exception as e:
        logger.error(f"❌ Erreur création index: {e}")


async def close_database_connections():
    """Fermer toutes les connexions de base de données"""
    global mongodb_client, redis_client
    
    try:
        if mongodb_client:
            mongodb_client.close()
            logger.info("🔌 Connexion MongoDB fermée")
            
        if redis_client:
            await redis_client.close()
            logger.info("🔌 Connexion Redis fermée")
            
    except Exception as e:
        logger.error(f"❌ Erreur fermeture connexions: {e}")


async def init_database():
    """Initialiser toutes les connexions de base de données"""
    await connect_to_mongodb()
    await connect_to_redis()


# 🛠️ Fonctions utilitaires pour les opérations de base de données

def get_database():
    """Obtenir l'instance de la base de données MongoDB"""
    return database


def get_redis():
    """Obtenir l'instance du client Redis"""
    return redis_client


async def create_user_collection():
    """Créer la collection utilisateurs avec validation"""
    if not database:
        return
    
    # Schéma de validation pour les utilisateurs
    user_schema = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["email", "username", "created_at"],
            "properties": {
                "email": {
                    "bsonType": "string",
                    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                },
                "username": {
                    "bsonType": "string",
                    "minLength": 3,
                    "maxLength": 50
                },
                "language": {
                    "bsonType": "string",
                    "enum": settings.supported_languages
                },
                "learning_preferences": {
                    "bsonType": "object",
                    "properties": {
                        "difficulty_level": {
                            "bsonType": "string",
                            "enum": ["beginner", "intermediate", "advanced"]
                        },
                        "learning_style": {
                            "bsonType": "string", 
                            "enum": ["visual", "auditory", "kinesthetic", "mixed"]
                        },
                        "subjects": {
                            "bsonType": "array",
                            "items": {
                                "bsonType": "string",
                                "enum": settings.supported_subjects
                            }
                        }
                    }
                }
            }
        }
    }
    
    try:
        await database.create_collection("users", validator=user_schema)
        logger.info("✅ Collection utilisateurs créée avec validation")
    except Exception as e:
        logger.info(f"ℹ️  Collection utilisateurs existe déjà: {e}")


async def create_courses_collection():
    """Créer la collection cours avec validation"""
    if not database:
        return
    
    # Schéma de validation pour les cours
    course_schema = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["title", "subject", "language", "created_at"],
            "properties": {
                "title": {
                    "bsonType": "string",
                    "minLength": 5,
                    "maxLength": 200
                },
                "subject": {
                    "bsonType": "string",
                    "enum": settings.supported_subjects
                },
                "language": {
                    "bsonType": "string",
                    "enum": settings.supported_languages
                },
                "difficulty_level": {
                    "bsonType": "string",
                    "enum": ["beginner", "intermediate", "advanced"]
                },
                "content": {
                    "bsonType": "object",
                    "properties": {
                        "lessons": {
                            "bsonType": "array",
                            "items": {
                                "bsonType": "object",
                                "required": ["title", "content"],
                                "properties": {
                                    "title": {"bsonType": "string"},
                                    "content": {"bsonType": "string"},
                                    "duration_minutes": {"bsonType": "int"},
                                    "multimedia": {
                                        "bsonType": "array",
                                        "items": {
                                            "bsonType": "object",
                                            "properties": {
                                                "type": {
                                                    "bsonType": "string",
                                                    "enum": ["image", "audio", "video", "interactive"]
                                                },
                                                "url": {"bsonType": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    try:
        await database.create_collection("courses", validator=course_schema)
        logger.info("✅ Collection cours créée avec validation")
    except Exception as e:
        logger.info(f"ℹ️  Collection cours existe déjà: {e}")


# 📊 Fonctions pour les métriques et analytics

async def save_learning_analytics(user_id: str, event_data: dict):
    """Sauvegarder les données d'analytics d'apprentissage"""
    if not database:
        return
    
    try:
        analytics_doc = {
            "user_id": user_id,
            "timestamp": asyncio.get_event_loop().time(),
            **event_data
        }
        
        await database.analytics.insert_one(analytics_doc)
        
        # Cache dans Redis pour accès rapide
        if redis_client:
            key = f"analytics:{user_id}:latest"
            await redis_client.setex(key, 3600, str(analytics_doc))
            
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde analytics: {e}")


async def get_user_learning_progress(user_id: str) -> dict:
    """Récupérer les progrès d'apprentissage d'un utilisateur"""
    if not database:
        return {}
    
    try:
        # Essayer d'abord le cache Redis
        if redis_client:
            cached = await redis_client.get(f"progress:{user_id}")
            if cached:
                return json.loads(cached)
        
        # Sinon, requête MongoDB
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$subject",
                "total_sessions": {"$sum": 1},
                "avg_performance": {"$avg": "$performance_score"},
                "total_time": {"$sum": "$duration_seconds"}
            }}
        ]
        
        results = []
        async for doc in database.learning_sessions.aggregate(pipeline):
            results.append(doc)
        
        progress_data = {"subjects": results}
        
        # Mettre en cache
        if redis_client:
            await redis_client.setex(f"progress:{user_id}", 1800, str(progress_data))
        
        return progress_data
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération progrès: {e}")
        return {}


logger.info("🎓 Module base de données EduAI Enhanced initialisé")
