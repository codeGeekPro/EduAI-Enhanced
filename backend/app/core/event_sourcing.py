"""
🎯 Event Sourcing pour l'apprentissage adaptatif
Trace toutes les interactions d'apprentissage pour analytics et adaptation IA
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum
import json
import uuid
from pydantic import BaseModel


class EventType(str, Enum):
    """Types d'événements d'apprentissage"""
    LEARNING_STARTED = "learning_started"
    CONTENT_VIEWED = "content_viewed"
    EXERCISE_ATTEMPTED = "exercise_attempted"
    EXERCISE_COMPLETED = "exercise_completed"
    SKILL_MASTERED = "skill_mastered"
    DIFFICULTY_ADJUSTED = "difficulty_adjusted"
    EMOTION_DETECTED = "emotion_detected"
    INTERACTION_RECORDED = "interaction_recorded"
    ACHIEVEMENT_UNLOCKED = "achievement_unlocked"
    COLLABORATION_JOINED = "collaboration_joined"
    AI_FEEDBACK_GIVEN = "ai_feedback_given"
    METACOGNITION_TRIGGERED = "metacognition_triggered"


class LearningEvent(BaseModel):
    """Modèle d'événement d'apprentissage"""
    event_id: str = None
    event_type: EventType
    user_id: str
    session_id: str
    timestamp: datetime
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    
    def __init__(self, **data):
        if 'event_id' not in data or data['event_id'] is None:
            data['event_id'] = str(uuid.uuid4())
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow()
        super().__init__(**data)


class EventStore:
    """Store pour les événements d'apprentissage"""
    
    def __init__(self):
        self.events: List[LearningEvent] = []
        self.snapshots: Dict[str, Dict] = {}
    
    async def append_event(self, event: LearningEvent) -> str:
        """Ajouter un événement au store"""
        self.events.append(event)
        return event.event_id
    
    async def get_events_by_user(self, user_id: str, 
                               from_date: Optional[datetime] = None,
                               to_date: Optional[datetime] = None) -> List[LearningEvent]:
        """Récupérer les événements d'un utilisateur"""
        filtered_events = [e for e in self.events if e.user_id == user_id]
        
        if from_date:
            filtered_events = [e for e in filtered_events if e.timestamp >= from_date]
        if to_date:
            filtered_events = [e for e in filtered_events if e.timestamp <= to_date]
            
        return sorted(filtered_events, key=lambda e: e.timestamp)
    
    async def get_events_by_type(self, event_type: EventType) -> List[LearningEvent]:
        """Récupérer les événements par type"""
        return [e for e in self.events if e.event_type == event_type]
    
    async def create_snapshot(self, user_id: str, state: Dict[str, Any]) -> None:
        """Créer un snapshot de l'état d'apprentissage"""
        self.snapshots[user_id] = {
            "timestamp": datetime.utcnow().isoformat(),
            "state": state
        }


class LearningProjection:
    """Projection pour reconstruire l'état d'apprentissage à partir des événements"""
    
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
    
    async def rebuild_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Reconstruire le progrès d'un utilisateur à partir des événements"""
        events = await self.event_store.get_events_by_user(user_id)
        
        progress = {
            "skills_mastered": [],
            "current_level": 1,
            "total_time_spent": 0,
            "exercises_completed": 0,
            "achievements": [],
            "emotion_patterns": {},
            "learning_preferences": {},
            "difficulty_history": []
        }
        
        for event in events:
            await self._apply_event_to_progress(event, progress)
        
        return progress
    
    async def _apply_event_to_progress(self, event: LearningEvent, progress: Dict) -> None:
        """Appliquer un événement au progrès"""
        if event.event_type == EventType.SKILL_MASTERED:
            skill = event.data.get("skill_name")
            if skill and skill not in progress["skills_mastered"]:
                progress["skills_mastered"].append(skill)
        
        elif event.event_type == EventType.EXERCISE_COMPLETED:
            progress["exercises_completed"] += 1
            time_spent = event.data.get("time_spent", 0)
            progress["total_time_spent"] += time_spent
        
        elif event.event_type == EventType.EMOTION_DETECTED:
            emotion = event.data.get("emotion")
            if emotion:
                if emotion not in progress["emotion_patterns"]:
                    progress["emotion_patterns"][emotion] = 0
                progress["emotion_patterns"][emotion] += 1
        
        elif event.event_type == EventType.DIFFICULTY_ADJUSTED:
            progress["difficulty_history"].append({
                "timestamp": event.timestamp.isoformat(),
                "old_level": event.data.get("old_level"),
                "new_level": event.data.get("new_level"),
                "reason": event.data.get("reason")
            })


class EventPublisher:
    """Publisher pour diffuser les événements aux autres services"""
    
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
        self.subscribers = []
    
    def subscribe(self, subscriber):
        """S'abonner aux événements"""
        self.subscribers.append(subscriber)
    
    async def publish_event(self, event: LearningEvent) -> str:
        """Publier un événement"""
        event_id = await self.event_store.append_event(event)
        
        # Notifier tous les abonnés
        for subscriber in self.subscribers:
            try:
                await subscriber.handle_event(event)
            except Exception as e:
                print(f"Erreur lors de la notification: {e}")
        
        return event_id


# Instance globale pour le projet
event_store = EventStore()
event_publisher = EventPublisher(event_store)
learning_projection = LearningProjection(event_store)


# Fonctions utilitaires pour créer des événements communs
async def track_learning_interaction(user_id: str, session_id: str, 
                                   interaction_type: str, data: Dict[str, Any]):
    """Tracer une interaction d'apprentissage"""
    event = LearningEvent(
        event_type=EventType.INTERACTION_RECORDED,
        user_id=user_id,
        session_id=session_id,
        data={"interaction_type": interaction_type, **data}
    )
    return await event_publisher.publish_event(event)


async def track_skill_progress(user_id: str, session_id: str, 
                             skill_name: str, mastery_level: float):
    """Tracer le progrès d'une compétence"""
    event_type = EventType.SKILL_MASTERED if mastery_level >= 0.8 else EventType.EXERCISE_ATTEMPTED
    
    event = LearningEvent(
        event_type=event_type,
        user_id=user_id,
        session_id=session_id,
        data={
            "skill_name": skill_name,
            "mastery_level": mastery_level,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    return await event_publisher.publish_event(event)


async def track_ai_adaptation(user_id: str, session_id: str, 
                            adaptation_type: str, details: Dict[str, Any]):
    """Tracer une adaptation IA"""
    event = LearningEvent(
        event_type=EventType.METACOGNITION_TRIGGERED,
        user_id=user_id,
        session_id=session_id,
        data={
            "adaptation_type": adaptation_type,
            "details": details
        }
    )
    return await event_publisher.publish_event(event)
