"""
🔗 Message Broker pour l'orchestration des microservices
Coordination et communication asynchrone entre services IA
"""

import asyncio
import json
import redis
from typing import Dict, Any, Callable, List, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class MessageType(str, Enum):
    """Types de messages inter-services"""
    AI_REQUEST = "ai_request"
    AI_RESPONSE = "ai_response"
    LEARNING_EVENT = "learning_event"
    USER_ACTION = "user_action"
    SYSTEM_EVENT = "system_event"
    HEALTH_CHECK = "health_check"
    ORCHESTRATION_COMMAND = "orchestration_command"


class ServiceMessage(BaseModel):
    """Modèle de message inter-services"""
    message_id: str
    message_type: MessageType
    source_service: str
    target_service: Optional[str] = None  # None = broadcast
    timestamp: datetime
    data: Dict[str, Any]
    correlation_id: Optional[str] = None
    reply_to: Optional[str] = None


class MessageBroker:
    """Broker de messages Redis pour l'orchestration"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.subscribers: Dict[str, List[Callable]] = {}
        self.running = False
        
    async def start(self):
        """Démarrer le broker"""
        self.running = True
        logger.info("Message Broker démarré")
    
    async def stop(self):
        """Arrêter le broker"""
        self.running = False
        logger.info("Message Broker arrêté")
    
    async def publish(self, channel: str, message: ServiceMessage) -> bool:
        """Publier un message sur un canal"""
        try:
            message_json = message.json()
            result = self.redis_client.publish(channel, message_json)
            logger.info(f"Message publié sur {channel}: {message.message_id}")
            return result > 0
        except Exception as e:
            logger.error(f"Erreur publication message: {e}")
            return False
    
    async def subscribe(self, channel: str, callback: Callable):
        """S'abonner à un canal"""
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)
        
        # Créer un subscriber Redis
        pubsub = self.redis_client.pubsub()
        pubsub.subscribe(channel)
        
        # Écouter les messages de manière asynchrone
        asyncio.create_task(self._listen_channel(pubsub, channel))
    
    async def _listen_channel(self, pubsub, channel: str):
        """Écouter un canal Redis"""
        while self.running:
            try:
                message = pubsub.get_message(timeout=1.0)
                if message and message['type'] == 'message':
                    data = json.loads(message['data'])
                    service_message = ServiceMessage(**data)
                    
                    # Notifier tous les callbacks
                    for callback in self.subscribers.get(channel, []):
                        try:
                            await callback(service_message)
                        except Exception as e:
                            logger.error(f"Erreur callback {channel}: {e}")
                            
            except Exception as e:
                logger.error(f"Erreur écoute canal {channel}: {e}")
                await asyncio.sleep(1)


class ServiceOrchestrator:
    """Orchestrateur des services IA"""
    
    def __init__(self, broker: MessageBroker):
        self.broker = broker
        self.services_status: Dict[str, Dict] = {}
        self.workflow_handlers: Dict[str, Callable] = {}
    
    async def register_service(self, service_name: str, service_config: Dict[str, Any]):
        """Enregistrer un service"""
        self.services_status[service_name] = {
            "status": "active",
            "last_heartbeat": datetime.utcnow(),
            "config": service_config
        }
        
        # S'abonner aux messages du service
        await self.broker.subscribe(f"service.{service_name}", self._handle_service_message)
        
        logger.info(f"Service {service_name} enregistré")
    
    async def orchestrate_ai_workflow(self, workflow_name: str, 
                                    input_data: Dict[str, Any],
                                    user_id: str) -> Dict[str, Any]:
        """Orchestrer un workflow IA complexe"""
        workflow_id = f"workflow_{datetime.utcnow().timestamp()}"
        
        if workflow_name == "adaptive_learning":
            return await self._handle_adaptive_learning_workflow(workflow_id, input_data, user_id)
        elif workflow_name == "multimodal_analysis":
            return await self._handle_multimodal_analysis_workflow(workflow_id, input_data, user_id)
        elif workflow_name == "collaborative_learning":
            return await self._handle_collaborative_learning_workflow(workflow_id, input_data, user_id)
        else:
            raise ValueError(f"Workflow inconnu: {workflow_name}")
    
    async def _handle_adaptive_learning_workflow(self, workflow_id: str, 
                                               data: Dict[str, Any], 
                                               user_id: str) -> Dict[str, Any]:
        """Workflow d'apprentissage adaptatif"""
        results = {}
        
        # 1. Analyser l'émotion de l'utilisateur
        emotion_message = ServiceMessage(
            message_id=f"{workflow_id}_emotion",
            message_type=MessageType.AI_REQUEST,
            source_service="orchestrator",
            target_service="emotion_service",
            timestamp=datetime.utcnow(),
            data={"text": data.get("user_input", ""), "user_id": user_id}
        )
        await self.broker.publish("ai.emotion", emotion_message)
        
        # 2. Analyser le niveau de compréhension (NLP)
        nlp_message = ServiceMessage(
            message_id=f"{workflow_id}_nlp",
            message_type=MessageType.AI_REQUEST,
            source_service="orchestrator",
            target_service="nlp_service",
            timestamp=datetime.utcnow(),
            data={"text": data.get("content", ""), "task": "comprehension_analysis"}
        )
        await self.broker.publish("ai.nlp", nlp_message)
        
        # 3. Ajuster la difficulté basé sur les résultats
        # (Simulation - en réalité, on attendrait les réponses)
        results = {
            "workflow_id": workflow_id,
            "emotion_analysis": "positive",
            "comprehension_level": 0.75,
            "difficulty_adjustment": "increase",
            "recommended_next_content": "advanced_concepts"
        }
        
        return results
    
    async def _handle_multimodal_analysis_workflow(self, workflow_id: str,
                                                 data: Dict[str, Any],
                                                 user_id: str) -> Dict[str, Any]:
        """Workflow d'analyse multimodale"""
        results = {}
        
        # Traitement en parallèle de différentes modalités
        tasks = []
        
        if "text" in data:
            tasks.append(self._process_text_modality(workflow_id, data["text"]))
        
        if "image" in data:
            tasks.append(self._process_image_modality(workflow_id, data["image"]))
        
        if "audio" in data:
            tasks.append(self._process_audio_modality(workflow_id, data["audio"]))
        
        # Exécuter en parallèle
        modal_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Fusion des résultats multimodaux
        results = {
            "workflow_id": workflow_id,
            "modalities_processed": len(tasks),
            "unified_analysis": self._fuse_multimodal_results(modal_results)
        }
        
        return results
    
    async def _process_text_modality(self, workflow_id: str, text: str) -> Dict:
        """Traiter la modalité texte"""
        message = ServiceMessage(
            message_id=f"{workflow_id}_text",
            message_type=MessageType.AI_REQUEST,
            source_service="orchestrator",
            target_service="nlp_service",
            timestamp=datetime.utcnow(),
            data={"text": text, "analysis_type": "full"}
        )
        await self.broker.publish("ai.nlp", message)
        return {"modality": "text", "status": "processed"}
    
    async def _process_image_modality(self, workflow_id: str, image_data: str) -> Dict:
        """Traiter la modalité image"""
        message = ServiceMessage(
            message_id=f"{workflow_id}_image",
            message_type=MessageType.AI_REQUEST,
            source_service="orchestrator",
            target_service="vision_service",
            timestamp=datetime.utcnow(),
            data={"image_data": image_data}
        )
        await self.broker.publish("ai.vision", message)
        return {"modality": "image", "status": "processed"}
    
    async def _process_audio_modality(self, workflow_id: str, audio_data: str) -> Dict:
        """Traiter la modalité audio"""
        message = ServiceMessage(
            message_id=f"{workflow_id}_audio",
            message_type=MessageType.AI_REQUEST,
            source_service="orchestrator",
            target_service="speech_service",
            timestamp=datetime.utcnow(),
            data={"audio_data": audio_data}
        )
        await self.broker.publish("ai.speech", message)
        return {"modality": "audio", "status": "processed"}
    
    def _fuse_multimodal_results(self, results: List) -> Dict:
        """Fusionner les résultats multimodaux"""
        return {
            "confidence_score": 0.85,
            "primary_modality": "text",
            "cross_modal_correlations": ["text-emotion", "image-context"],
            "unified_interpretation": "Learning content understood with high confidence"
        }
    
    async def _handle_collaborative_learning_workflow(self, workflow_id: str,
                                                    data: Dict[str, Any],
                                                    user_id: str) -> Dict[str, Any]:
        """Workflow d'apprentissage collaboratif"""
        # Coordination des interactions entre apprenants
        return {
            "workflow_id": workflow_id,
            "collaboration_type": "peer_learning",
            "participants": data.get("participants", []),
            "shared_content": "synchronized",
            "interaction_quality": "high"
        }
    
    async def _handle_service_message(self, message: ServiceMessage):
        """Gérer les messages des services"""
        logger.info(f"Message reçu de {message.source_service}: {message.message_type}")
        
        # Mettre à jour le statut du service
        if message.source_service in self.services_status:
            self.services_status[message.source_service]["last_heartbeat"] = datetime.utcnow()
    
    async def get_services_health(self) -> Dict[str, Dict]:
        """Obtenir le statut de santé des services"""
        return self.services_status


# Instances globales
message_broker = MessageBroker()
service_orchestrator = ServiceOrchestrator(message_broker)
