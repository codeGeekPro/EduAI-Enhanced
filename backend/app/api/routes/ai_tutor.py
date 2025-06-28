"""
🎓 EduAI Enhanced - Routes du Tuteur IA
API pour l'interaction avec le tuteur IA adaptatif multilingue
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import json
import time
from datetime import datetime

from ...core.config import get_settings
from ...core.database import get_database, save_learning_analytics

settings = get_settings()
router = APIRouter()

# 📝 Modèles de données

class ChatMessage(BaseModel):
    """Message dans une conversation avec le tuteur IA"""
    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[datetime] = None
    language: Optional[str] = "fr"
    emotion_detected: Optional[str] = None
    confidence_score: Optional[float] = None

class TutorRequest(BaseModel):
    """Requête au tuteur IA"""
    message: str
    user_id: str
    session_id: Optional[str] = None
    subject: str = "general"
    language: str = "fr"
    difficulty_level: str = "intermediate"  # beginner, intermediate, advanced
    learning_style: str = "mixed"  # visual, auditory, kinesthetic, mixed
    context: Optional[Dict[str, Any]] = None

class TutorResponse(BaseModel):
    """Réponse du tuteur IA"""
    message: str
    session_id: str
    emotion_adaptation: Optional[str] = None
    suggested_exercises: Optional[List[Dict]] = None
    learning_insights: Optional[Dict] = None
    next_recommendations: Optional[List[str]] = None
    performance_feedback: Optional[Dict] = None

class LearningSession(BaseModel):
    """Session d'apprentissage"""
    session_id: str
    user_id: str
    subject: str
    started_at: datetime
    messages: List[ChatMessage] = []
    performance_metrics: Dict[str, Any] = {}
    emotion_timeline: List[Dict] = []

# 🗄️ Stockage temporaire des sessions (en production, utiliser Redis)
active_sessions: Dict[str, LearningSession] = {}

# 🤖 Routes du Tuteur IA

@router.post("/chat", response_model=TutorResponse)
async def chat_with_tutor(request: TutorRequest):
    """
    💬 Converser avec le tuteur IA adaptatif
    
    Le tuteur s'adapte au style d'apprentissage, au niveau et à l'état émotionnel
    """
    try:
        # Générer un ID de session si nécessaire
        session_id = request.session_id or f"session_{int(time.time())}_{request.user_id}"
        
        # Récupérer ou créer la session
        if session_id not in active_sessions:
            active_sessions[session_id] = LearningSession(
                session_id=session_id,
                user_id=request.user_id,
                subject=request.subject,
                started_at=datetime.now()
            )
        
        session = active_sessions[session_id]
        
        # Analyser l'émotion du message (simulation)
        emotion_detected = await analyze_emotion(request.message, request.language)
        
        # Ajouter le message utilisateur à l'historique
        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.now(),
            language=request.language,
            emotion_detected=emotion_detected.get("emotion"),
            confidence_score=emotion_detected.get("confidence")
        )
        session.messages.append(user_message)
        
        # Générer la réponse du tuteur IA
        tutor_response = await generate_tutor_response(
            request=request,
            session=session,
            emotion_state=emotion_detected
        )
        
        # Ajouter la réponse à l'historique
        assistant_message = ChatMessage(
            role="assistant",
            content=tutor_response.message,
            timestamp=datetime.now(),
            language=request.language
        )
        session.messages.append(assistant_message)
        
        # Sauvegarder les analytics
        await save_learning_analytics(request.user_id, {
            "event_type": "ai_interaction",
            "session_id": session_id,
            "subject": request.subject,
            "language": request.language,
            "emotion_detected": emotion_detected.get("emotion"),
            "message_length": len(request.message),
            "response_quality": "high"  # À calculer en fonction des métriques
        })
        
        tutor_response.session_id = session_id
        return tutor_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur tuteur IA: {str(e)}")

@router.post("/voice-chat")
async def voice_chat_with_tutor(
    user_id: str,
    subject: str = "general",
    language: str = "fr",
    audio_file: UploadFile = File(...)
):
    """
    🎤 Interaction vocale avec le tuteur IA
    
    Traite l'audio avec Whisper, génère une réponse et la convertit en speech
    """
    try:
        # Vérifier le format audio
        if not audio_file.filename.endswith(tuple(settings.supported_audio_formats)):
            raise HTTPException(
                status_code=400, 
                detail=f"Format audio non supporté. Utilisez: {settings.supported_audio_formats}"
            )
        
        # Lire le fichier audio
        audio_content = await audio_file.read()
        
        # Transcription avec Whisper (simulation)
        transcription = await transcribe_audio(audio_content, language)
        
        # Créer une requête de chat
        chat_request = TutorRequest(
            message=transcription["text"],
            user_id=user_id,
            subject=subject,
            language=language
        )
        
        # Obtenir la réponse du tuteur
        tutor_response = await chat_with_tutor(chat_request)
        
        # Convertir la réponse en audio avec TTS
        audio_response = await text_to_speech(
            text=tutor_response.message,
            language=language,
            voice_style="educational"
        )
        
        # Retourner l'audio comme streaming response
        return StreamingResponse(
            audio_response,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=tutor_response.wav",
                "X-Transcription": transcription["text"],
                "X-Session-ID": tutor_response.session_id
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur chat vocal: {str(e)}")

@router.get("/session/{session_id}", response_model=LearningSession)
async def get_learning_session(session_id: str):
    """📊 Récupérer les détails d'une session d'apprentissage"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    return active_sessions[session_id]

@router.get("/user/{user_id}/sessions")
async def get_user_sessions(user_id: str, limit: int = 10):
    """📋 Récupérer les sessions d'un utilisateur"""
    user_sessions = [
        session for session in active_sessions.values() 
        if session.user_id == user_id
    ]
    
    # Trier par date (plus récentes en premier)
    user_sessions.sort(key=lambda x: x.started_at, reverse=True)
    
    return {
        "user_id": user_id,
        "total_sessions": len(user_sessions),
        "sessions": user_sessions[:limit]
    }

@router.post("/session/{session_id}/feedback")
async def submit_session_feedback(
    session_id: str,
    feedback: Dict[str, Any]
):
    """⭐ Soumettre un feedback sur la session d'apprentissage"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    session = active_sessions[session_id]
    
    # Ajouter le feedback aux métriques de performance
    session.performance_metrics.update({
        "user_feedback": feedback,
        "feedback_timestamp": datetime.now(),
        "satisfaction_score": feedback.get("rating", 0)
    })
    
    # Sauvegarder dans la base de données
    await save_learning_analytics(session.user_id, {
        "event_type": "session_feedback",
        "session_id": session_id,
        "feedback": feedback
    })
    
    return {"status": "success", "message": "Feedback enregistré avec succès"}

@router.get("/adaptive-insights/{user_id}")
async def get_adaptive_insights(user_id: str):
    """🧠 Obtenir des insights adaptatifs pour personnaliser l'apprentissage"""
    try:
        # Analyser l'historique d'apprentissage de l'utilisateur
        user_sessions = [
            session for session in active_sessions.values() 
            if session.user_id == user_id
        ]
        
        if not user_sessions:
            return {
                "user_id": user_id,
                "insights": "Données insuffisantes pour générer des insights",
                "recommendations": [
                    "Commencez par une session d'introduction",
                    "Explorez différents sujets pour identifier vos préférences"
                ]
            }
        
        # Calculer les métriques d'apprentissage
        total_sessions = len(user_sessions)
        avg_session_length = sum(len(s.messages) for s in user_sessions) / total_sessions
        
        # Analyser les émotions dominantes
        all_emotions = []
        for session in user_sessions:
            for message in session.messages:
                if message.emotion_detected:
                    all_emotions.append(message.emotion_detected)
        
        dominant_emotion = max(set(all_emotions), key=all_emotions.count) if all_emotions else "neutral"
        
        # Analyser les sujets préférés
        subject_counts = {}
        for session in user_sessions:
            subject_counts[session.subject] = subject_counts.get(session.subject, 0) + 1
        
        preferred_subject = max(subject_counts.items(), key=lambda x: x[1])[0] if subject_counts else "general"
        
        insights = {
            "user_id": user_id,
            "learning_profile": {
                "total_sessions": total_sessions,
                "avg_interaction_per_session": round(avg_session_length, 1),
                "dominant_emotion": dominant_emotion,
                "preferred_subject": preferred_subject,
                "engagement_level": "high" if avg_session_length > 5 else "medium"
            },
            "personalized_recommendations": [
                f"Continuez à explorer {preferred_subject} - vous montrez de l'intérêt !",
                f"Votre état émotionnel '{dominant_emotion}' suggère un style d'apprentissage adaptatif",
                "Essayez les exercices interactifs pour maintenir l'engagement"
            ],
            "next_learning_paths": [
                {
                    "subject": preferred_subject,
                    "difficulty": "intermediate",
                    "estimated_duration": "15-20 minutes"
                }
            ]
        }
        
        return insights
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération insights: {str(e)}")

# 🛠️ Fonctions utilitaires

async def analyze_emotion(text: str, language: str) -> Dict[str, Any]:
    """Analyser l'émotion dans un texte"""
    # Simulation - en réalité, utiliser un modèle de détection d'émotion
    emotions = ["happy", "sad", "frustrated", "excited", "confused", "confident", "neutral"]
    
    # Logique simple basée sur des mots-clés
    emotion_keywords = {
        "happy": ["super", "génial", "parfait", "excellent", "great", "awesome"],
        "frustrated": ["difficile", "compliqué", "impossible", "nul", "hate", "difficult"],
        "confused": ["comprends pas", "confus", "quoi", "confused", "what", "huh"],
        "excited": ["wow", "incroyable", "amazing", "fantastic", "love"],
        "confident": ["facile", "sûr", "certain", "easy", "confident", "sure"]
    }
    
    text_lower = text.lower()
    detected_emotion = "neutral"
    confidence = 0.5
    
    for emotion, keywords in emotion_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            detected_emotion = emotion
            confidence = 0.8
            break
    
    return {
        "emotion": detected_emotion,
        "confidence": confidence,
        "available_emotions": emotions
    }

async def generate_tutor_response(
    request: TutorRequest,
    session: LearningSession,
    emotion_state: Dict[str, Any]
) -> TutorResponse:
    """Générer une réponse du tuteur IA adaptée"""
    
    # Adapter le ton selon l'émotion détectée
    emotion = emotion_state.get("emotion", "neutral")
    
    tone_adaptations = {
        "frustrated": "Je comprends que cela puisse être frustrant. Prenons les choses étape par étape.",
        "confused": "Pas de souci, clarifions cela ensemble. Quelle partie vous pose le plus de problème ?",
        "excited": "J'adore votre enthousiasme ! Continuons sur cette lancée.",
        "confident": "Excellent ! Vous maîtrisez bien. Prêt pour un défi plus avancé ?",
        "sad": "L'apprentissage peut parfois sembler difficile, mais vous progressez vraiment bien."
    }
    
    # Construire la réponse selon le contexte
    base_response = f"Concernant votre question sur {request.subject}: "
    
    # Ajouter l'adaptation émotionnelle
    if emotion in tone_adaptations:
        emotion_adaptation = tone_adaptations[emotion]
        response = f"{emotion_adaptation} {base_response}"
    else:
        response = base_response
    
    # Simulation d'une réponse éducative (en réalité, utiliser GPT-4)
    educational_responses = {
        "mathematics": "Les mathématiques suivent des patterns logiques. Essayons de décomposer le problème...",
        "science": "La science nous aide à comprendre le monde qui nous entoure. Observons ce phénomène...",
        "history": "L'histoire nous enseigne les leçons du passé. Cette période était caractérisée par...",
        "literature": "La littérature exprime la beauté du langage. Analysons ce texte ensemble..."
    }
    
    subject_response = educational_responses.get(request.subject, "C'est une excellente question ! Explorons cela ensemble.")
    response += subject_response
    
    # Générer des exercices suggérés
    suggested_exercises = [
        {
            "type": "quiz",
            "title": f"Quiz rapide sur {request.subject}",
            "duration": "5 minutes",
            "difficulty": request.difficulty_level
        },
        {
            "type": "interactive",
            "title": "Exercice pratique interactif", 
            "duration": "10 minutes",
            "style": request.learning_style
        }
    ]
    
    # Insights d'apprentissage
    learning_insights = {
        "interaction_count": len(session.messages),
        "session_duration": (datetime.now() - session.started_at).seconds,
        "emotion_trend": emotion,
        "engagement_level": "high" if len(session.messages) > 3 else "building"
    }
    
    return TutorResponse(
        message=response,
        session_id=session.session_id,
        emotion_adaptation=tone_adaptations.get(emotion),
        suggested_exercises=suggested_exercises,
        learning_insights=learning_insights,
        next_recommendations=[
            f"Explorez plus de {request.subject}",
            "Essayez un exercice pratique",
            "Partagez vos questions"
        ]
    )

async def transcribe_audio(audio_content: bytes, language: str) -> Dict[str, Any]:
    """Transcrire l'audio en texte avec Whisper"""
    # Simulation - en réalité, utiliser OpenAI Whisper API
    await asyncio.sleep(1)  # Simuler le traitement
    
    return {
        "text": "Bonjour, peux-tu m'aider avec les mathématiques ?",
        "language": language,
        "confidence": 0.95,
        "duration": 3.5
    }

async def text_to_speech(text: str, language: str, voice_style: str = "educational"):
    """Convertir le texte en parole avec ElevenLabs"""
    # Simulation - en réalité, utiliser ElevenLabs API
    await asyncio.sleep(1)  # Simuler la génération
    
    # Retourner un générateur pour l'audio (simulation)
    async def generate_audio():
        yield b"fake_audio_data_here"  # En réalité, les données audio réelles
    
    return generate_audio()

# Middleware pour la gestion des erreurs
@router.exception_handler(Exception)
async def tutor_exception_handler(request, exc):
    return {"error": "Erreur du tuteur IA", "detail": str(exc), "status": "error"}
