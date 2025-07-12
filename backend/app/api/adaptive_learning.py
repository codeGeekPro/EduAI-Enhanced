"""
🎯 Intégration Event Sourcing + Orchestration dans l'API principale
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

from ..core.event_sourcing import (
    EventType, LearningEvent, event_publisher, learning_projection,
    track_learning_interaction, track_skill_progress, track_ai_adaptation
)
from ..core.orchestration import (
    MessageType, ServiceMessage, service_orchestrator, message_broker
)

router = APIRouter(prefix="/api/adaptive", tags=["Adaptive Learning"])


class LearningInteractionRequest(BaseModel):
    user_id: str
    session_id: str
    interaction_type: str
    content: Dict[str, Any]


class SkillProgressRequest(BaseModel):
    user_id: str
    session_id: str
    skill_name: str
    exercise_result: Dict[str, Any]


class AdaptiveLearningRequest(BaseModel):
    user_id: str
    current_content: str
    user_input: str
    context: Dict[str, Any]


class MultimodalAnalysisRequest(BaseModel):
    user_id: str
    text: Optional[str] = None
    image_data: Optional[str] = None
    audio_data: Optional[str] = None


@router.post("/interaction")
async def record_learning_interaction(
    request: LearningInteractionRequest,
    background_tasks: BackgroundTasks
):
    """Enregistrer une interaction d'apprentissage"""
    try:
        # Enregistrer l'événement
        event_id = await track_learning_interaction(
            user_id=request.user_id,
            session_id=request.session_id,
            interaction_type=request.interaction_type,
            data=request.content
        )
        
        # Déclencher l'adaptation IA en arrière-plan
        background_tasks.add_task(
            trigger_adaptive_response,
            request.user_id,
            request.session_id,
            request.content
        )
        
        return {
            "status": "success",
            "event_id": event_id,
            "message": "Interaction enregistrée"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/skill-progress")
async def record_skill_progress(
    request: SkillProgressRequest,
    background_tasks: BackgroundTasks
):
    """Enregistrer le progrès d'une compétence"""
    try:
        # Calculer le niveau de maîtrise
        mastery_level = calculate_mastery_level(request.exercise_result)
        
        # Enregistrer l'événement
        event_id = await track_skill_progress(
            user_id=request.user_id,
            session_id=request.session_id,
            skill_name=request.skill_name,
            mastery_level=mastery_level
        )
        
        # Si la compétence est maîtrisée, déclencher une adaptation
        if mastery_level >= 0.8:
            background_tasks.add_task(
                adapt_difficulty_level,
                request.user_id,
                request.skill_name,
                "increase"
            )
        
        return {
            "status": "success",
            "event_id": event_id,
            "mastery_level": mastery_level,
            "skill_mastered": mastery_level >= 0.8
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/adaptive-learning")
async def orchestrate_adaptive_learning(request: AdaptiveLearningRequest):
    """Orchestrer un workflow d'apprentissage adaptatif"""
    try:
        # Préparer les données pour l'orchestrateur
        workflow_data = {
            "user_input": request.user_input,
            "content": request.current_content,
            "context": request.context
        }
        
        # Lancer le workflow via l'orchestrateur
        result = await service_orchestrator.orchestrate_ai_workflow(
            workflow_name="adaptive_learning",
            input_data=workflow_data,
            user_id=request.user_id
        )
        
        # Enregistrer l'adaptation comme événement
        await track_ai_adaptation(
            user_id=request.user_id,
            session_id=request.context.get("session_id", ""),
            adaptation_type="difficulty_adjustment",
            details=result
        )
        
        return {
            "status": "success",
            "adaptation_result": result,
            "recommendations": generate_learning_recommendations(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.post("/multimodal-analysis")
async def orchestrate_multimodal_analysis(request: MultimodalAnalysisRequest):
    """Orchestrer une analyse multimodale"""
    try:
        # Préparer les données multimodales
        multimodal_data = {}
        if request.text:
            multimodal_data["text"] = request.text
        if request.image_data:
            multimodal_data["image"] = request.image_data
        if request.audio_data:
            multimodal_data["audio"] = request.audio_data
        
        # Lancer le workflow multimodal
        result = await service_orchestrator.orchestrate_ai_workflow(
            workflow_name="multimodal_analysis",
            input_data=multimodal_data,
            user_id=request.user_id
        )
        
        return {
            "status": "success",
            "analysis_result": result,
            "insights": extract_multimodal_insights(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/user-progress/{user_id}")
async def get_user_learning_progress(user_id: str):
    """Récupérer le progrès d'apprentissage d'un utilisateur"""
    try:
        # Reconstruire le progrès à partir des événements
        progress = await learning_projection.rebuild_user_progress(user_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "progress": progress,
            "analytics": generate_progress_analytics(progress)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/services-health")
async def get_services_health():
    """Obtenir le statut de santé des services"""
    try:
        health_status = await service_orchestrator.get_services_health()
        
        return {
            "status": "success",
            "services": health_status,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# Fonctions utilitaires

def calculate_mastery_level(exercise_result: Dict[str, Any]) -> float:
    """Calculer le niveau de maîtrise d'une compétence"""
    score = exercise_result.get("score", 0.0)
    time_factor = exercise_result.get("time_efficiency", 1.0)
    attempts = exercise_result.get("attempts", 1)
    
    # Formule de calcul de maîtrise
    mastery = (score * time_factor) / attempts
    return min(max(mastery, 0.0), 1.0)


async def trigger_adaptive_response(user_id: str, session_id: str, content: Dict[str, Any]):
    """Déclencher une réponse adaptative basée sur l'interaction"""
    # Analyser le type d'interaction et déclencher les adaptations appropriées
    interaction_type = content.get("type", "unknown")
    
    if interaction_type == "struggle_detected":
        await adapt_difficulty_level(user_id, content.get("skill"), "decrease")
    elif interaction_type == "quick_completion":
        await adapt_difficulty_level(user_id, content.get("skill"), "increase")


async def adapt_difficulty_level(user_id: str, skill: str, direction: str):
    """Adapter le niveau de difficulté"""
    adaptation_details = {
        "skill": skill,
        "direction": direction,
        "timestamp": datetime.utcnow().isoformat(),
        "reason": f"Performance analysis indicated {direction} needed"
    }
    
    await track_ai_adaptation(
        user_id=user_id,
        session_id="system_adaptation",
        adaptation_type="difficulty_adjustment",
        details=adaptation_details
    )


def generate_learning_recommendations(adaptation_result: Dict[str, Any]) -> List[str]:
    """Générer des recommandations d'apprentissage"""
    recommendations = []
    
    difficulty = adaptation_result.get("difficulty_adjustment")
    if difficulty == "increase":
        recommendations.append("Essayez des exercices plus avancés")
        recommendations.append("Explorez des concepts connexes")
    elif difficulty == "decrease":
        recommendations.append("Revoyez les concepts fondamentaux")
        recommendations.append("Pratiquez avec des exemples simples")
    
    return recommendations


def extract_multimodal_insights(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
    """Extraire des insights de l'analyse multimodale"""
    return {
        "primary_learning_style": "visual" if "image" in analysis_result else "textual",
        "engagement_level": "high",
        "comprehension_indicators": ["attention_focus", "response_quality"],
        "recommended_modalities": ["text", "visual", "interactive"]
    }


def generate_progress_analytics(progress: Dict[str, Any]) -> Dict[str, Any]:
    """Générer des analytics de progrès"""
    return {
        "learning_velocity": len(progress["skills_mastered"]) / max(1, progress["total_time_spent"] / 3600),
        "skill_diversity": len(set(progress["skills_mastered"])),
        "emotional_stability": calculate_emotional_stability(progress["emotion_patterns"]),
        "learning_efficiency": progress["exercises_completed"] / max(1, progress["total_time_spent"] / 60)
    }


def calculate_emotional_stability(emotion_patterns: Dict[str, int]) -> float:
    """Calculer la stabilité émotionnelle"""
    if not emotion_patterns:
        return 0.5
    
    positive_emotions = ["joy", "excitement", "confidence", "satisfaction"]
    total_emotions = sum(emotion_patterns.values())
    positive_count = sum(emotion_patterns.get(emotion, 0) for emotion in positive_emotions)
    
    return positive_count / total_emotions if total_emotions > 0 else 0.5
