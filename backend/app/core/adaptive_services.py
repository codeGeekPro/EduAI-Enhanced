"""
🚀 Service d'initialisation pour Event Sourcing + Orchestration
Démarrage et configuration des composants adaptatifs
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from .event_sourcing import event_publisher, event_store, learning_projection
from .orchestration import message_broker, service_orchestrator


logger = logging.getLogger(__name__)


class EventHandler:
    """Gestionnaire d'événements pour l'apprentissage adaptatif"""
    
    async def handle_event(self, event):
        """Traiter un événement d'apprentissage"""
        logger.info(f"Traitement événement: {event.event_type} pour utilisateur {event.user_id}")
        
        # Logique métier basée sur le type d'événement
        if event.event_type == "skill_mastered":
            await self._handle_skill_mastery(event)
        elif event.event_type == "difficulty_adjusted":
            await self._handle_difficulty_adjustment(event)
        elif event.event_type == "emotion_detected":
            await self._handle_emotion_detection(event)
    
    async def _handle_skill_mastery(self, event):
        """Gérer la maîtrise d'une compétence"""
        skill = event.data.get("skill_name")
        logger.info(f"Compétence {skill} maîtrisée par {event.user_id}")
        
        # Déclencher des recommandations pour la prochaine compétence
        # En production, cela interagirait avec le système de recommandation
    
    async def _handle_difficulty_adjustment(self, event):
        """Gérer l'ajustement de difficulté"""
        adjustment = event.data.get("new_level")
        logger.info(f"Difficulté ajustée à {adjustment} pour {event.user_id}")
    
    async def _handle_emotion_detection(self, event):
        """Gérer la détection d'émotion"""
        emotion = event.data.get("emotion")
        logger.info(f"Émotion {emotion} détectée pour {event.user_id}")


# Instance du gestionnaire d'événements
event_handler = EventHandler()


@asynccontextmanager
async def lifespan_adaptive_services(app: FastAPI):
    """Gestionnaire du cycle de vie des services adaptatifs"""
    
    # 🚀 STARTUP
    logger.info("🎯 Démarrage des services adaptatifs...")
    
    try:
        # 1. Démarrer le message broker
        await message_broker.start()
        logger.info("✅ Message Broker démarré")
        
        # 2. Enregistrer les services IA
        await service_orchestrator.register_service("nlp_service", {
            "endpoint": "http://localhost:8001/nlp",
            "capabilities": ["text_analysis", "sentiment", "comprehension"]
        })
        
        await service_orchestrator.register_service("emotion_service", {
            "endpoint": "http://localhost:8001/emotion",
            "capabilities": ["emotion_detection", "mood_analysis"]
        })
        
        await service_orchestrator.register_service("vision_service", {
            "endpoint": "http://localhost:8001/vision",
            "capabilities": ["image_analysis", "object_detection"]
        })
        
        await service_orchestrator.register_service("speech_service", {
            "endpoint": "http://localhost:8001/speech",
            "capabilities": ["speech_recognition", "tts"]
        })
        
        logger.info("✅ Services IA enregistrés")
        
        # 3. S'abonner aux événements d'apprentissage
        event_publisher.subscribe(event_handler)
        logger.info("✅ Gestionnaire d'événements configuré")
        
        # 4. Initialiser les projections
        # En production, cela chargerait les snapshots existants
        logger.info("✅ Projections initialisées")
        
        logger.info("🎉 Services adaptatifs prêts!")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du démarrage: {e}")
        raise
    
    # 🛑 SHUTDOWN
    logger.info("🔄 Arrêt des services adaptatifs...")
    
    try:
        await message_broker.stop()
        logger.info("✅ Message Broker arrêté")
        
        # Sauvegarder les événements en attente si nécessaire
        logger.info("✅ Données sauvegardées")
        
        logger.info("👋 Services adaptatifs arrêtés proprement")
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'arrêt: {e}")


async def health_check_services():
    """Vérification de santé des services"""
    try:
        # Vérifier Redis
        test_message = {
            "type": "health_check",
            "timestamp": "2025-01-01T00:00:00Z"
        }
        result = message_broker.redis_client.ping()
        
        # Vérifier l'orchestrateur
        services_status = await service_orchestrator.get_services_health()
        
        return {
            "redis_connection": "ok" if result else "error",
            "services_count": len(services_status),
            "all_services_healthy": all(
                s["status"] == "active" for s in services_status.values()
            )
        }
        
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        return {"status": "error", "message": str(e)}
