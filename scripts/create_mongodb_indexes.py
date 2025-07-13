"""
🔧 Script de création des index MongoDB pour optimisation
Exécute la création d'index pour améliorer les performances
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from backend.app.core.config import get_settings

settings = get_settings()

async def create_database_indexes():
    """Créer tous les index nécessaires pour optimiser les performances"""
    
    client = AsyncIOMotorClient(
        settings.mongodb_url,
        **settings.database_config
    )
    
    db = client[settings.mongodb_db_name]
    
    try:
        print("🔧 Création des index MongoDB...")
        
        # Index pour les utilisateurs
        await db.users.create_index([("email", 1)], unique=True, name="users_email_unique")
        await db.users.create_index([("last_active", 1)], name="users_last_active")
        await db.users.create_index([("created_at", 1)], name="users_created_at")
        print("✅ Index utilisateurs créés")
        
        # Index pour les cours
        await db.courses.create_index([("title", "text"), ("description", "text")], name="courses_text_search")
        await db.courses.create_index([("category", 1), ("level", 1)], name="courses_category_level")
        await db.courses.create_index([("created_at", -1)], name="courses_created_desc")
        await db.courses.create_index([("is_active", 1)], name="courses_active")
        print("✅ Index cours créés")
        
        # Index pour les progrès
        await db.progress.create_index([("user_id", 1), ("course_id", 1)], unique=True, name="progress_user_course_unique")
        await db.progress.create_index([("user_id", 1), ("updated_at", -1)], name="progress_user_updated")
        await db.progress.create_index([("completion_percentage", 1)], name="progress_completion")
        print("✅ Index progrès créés")
        
        # Index pour les sessions
        await db.sessions.create_index([("user_id", 1)], name="sessions_user")
        await db.sessions.create_index([("created_at", 1)], expireAfterSeconds=86400, name="sessions_ttl")  # Expire après 24h
        print("✅ Index sessions créés")
        
        # Index pour les événements de sécurité
        await db.security_events.create_index([("user_id", 1), ("timestamp", -1)], name="security_events_user_time")
        await db.security_events.create_index([("severity", 1), ("timestamp", -1)], name="security_events_severity_time")
        await db.security_events.create_index([("timestamp", 1)], expireAfterSeconds=2592000, name="security_events_ttl")  # Expire après 30 jours
        print("✅ Index événements sécurité créés")
        
        # Index pour les métriques
        await db.metrics.create_index([("service", 1), ("operation", 1), ("timestamp", -1)], name="metrics_service_operation_time")
        await db.metrics.create_index([("timestamp", 1)], expireAfterSeconds=604800, name="metrics_ttl")  # Expire après 7 jours
        print("✅ Index métriques créés")
        
        # Index pour le cache AI
        await db.ai_cache.create_index([("cache_key", 1)], unique=True, name="ai_cache_key_unique")
        await db.ai_cache.create_index([("created_at", 1)], expireAfterSeconds=3600, name="ai_cache_ttl")  # Expire après 1h
        print("✅ Index cache IA créés")
        
        print("🎉 Tous les index ont été créés avec succès!")
        
        # Afficher les statistiques des index
        collections = ['users', 'courses', 'progress', 'sessions', 'security_events', 'metrics', 'ai_cache']
        for collection_name in collections:
            collection = db[collection_name]
            indexes = await collection.list_indexes().to_list(None)
            print(f"📊 {collection_name}: {len(indexes)} index")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des index: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_database_indexes())
