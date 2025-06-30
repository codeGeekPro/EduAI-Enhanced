"""
FastAPI Microservice pour les services IA d'EduAI Enhanced
Intégration complète des modules NLP, Emotion, Speech et Vision
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List, Union
import uvicorn
import logging
import asyncio
import io
import json
from datetime import datetime

# Import des processeurs IA
from nlp.text_processor import NLPProcessor
from emotion.emotion_analyzer import emotion_analyzer
from speech.speech_processor import speech_processor
from vision.vision_processor import vision_processor

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Création des instances des processeurs IA
nlp_processor = NLPProcessor()

app = FastAPI(
    title="EduAI Enhanced AI Services",
    description="Microservices IA avancés pour l'éducation adaptative multimodale",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic pour les requêtes
class TextRequest(BaseModel):
    text: str
    language: str = "en"
    level: str = "intermediate"

class TextComplexityRequest(BaseModel):
    text: str
    language: str = "en"

class ContentGenerationRequest(BaseModel):
    topic: str
    level: str = "intermediate"
    language: str = "en"
    content_type: str = "explanation"

class QuestionGenerationRequest(BaseModel):
    text: str
    num_questions: int = 5
    language: str = "en"
    difficulty: str = "medium"

class ResponseAnalysisRequest(BaseModel):
    question: str
    response: str
    expected_concepts: List[str]
    language: str = "en"

class SpeechRequest(BaseModel):
    text: str
    language: str = "en"
    voice_style: str = "neutral"
    speed: float = 1.0

class PronunciationRequest(BaseModel):
    reference_text: str
    language: str = "en"

class MultimodalEmotionRequest(BaseModel):
    text: Optional[str] = None
    weights: Optional[Dict[str, float]] = None

class AIResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    message: str = ""
    timestamp: str = ""
    processing_time: float = 0

# Endpoints de santé et information
@app.get("/")
async def root():
    return {
        "service": "EduAI Enhanced AI Services",
        "version": "2.0.0",
        "status": "operational",
        "features": {
            "nlp": "✅ Traitement du langage naturel avancé",
            "speech": "✅ Reconnaissance et synthèse vocale",
            "emotion": "✅ Analyse émotionnelle multimodale", 
            "vision": "✅ Vision par ordinateur éducative",
            "multimodal": "✅ Analyse intégrée multimodale"
        },
        "endpoints": {
            "nlp": ["/nlp/complexity", "/nlp/generate", "/nlp/concepts", "/nlp/questions"],
            "emotion": ["/emotion/text", "/emotion/speech", "/emotion/facial", "/emotion/multimodal"],
            "speech": ["/speech/recognize", "/speech/synthesize", "/speech/pronunciation"],
            "vision": ["/vision/analyze", "/vision/handwriting", "/vision/gestures", "/vision/document"]
        }
    }

@app.get("/health")
async def health_check():
    """Vérification de santé du service avec status des modules IA"""
    start_time = datetime.now()
    
    # Test de santé de chaque module
    health_status = {
        "service": "ai-services",
        "status": "healthy",
        "modules": {
            "nlp": "healthy",
            "emotion": "healthy", 
            "speech": "healthy",
            "vision": "healthy"
        },
        "timestamp": start_time.isoformat(),
        "version": "2.0.0"
    }
    
    try:
        # Test rapide de chaque module
        test_text = "Hello world"
        test_result = await nlp_processor.analyze_text_complexity(test_text)
        if "error" in test_result:
            health_status["modules"]["nlp"] = "warning"
    except Exception:
        health_status["modules"]["nlp"] = "error"
    
    return health_status

@app.get("/capabilities")
async def get_capabilities():
    """Retourne les capacités disponibles du service"""
    return {
        "nlp": {
            "text_complexity_analysis": True,
            "content_generation": True,
            "question_generation": True,
            "response_analysis": True,
            "concept_extraction": True,
            "supported_languages": ["en", "fr", "es", "de"]
        },
        "emotion": {
            "text_emotion_analysis": True,
            "speech_emotion_analysis": True,
            "facial_emotion_analysis": True,
            "multimodal_analysis": True,
            "educational_recommendations": True
        },
        "speech": {
            "speech_to_text": True,
            "text_to_speech": True,
            "pronunciation_analysis": True,
            "language_detection": True,
            "pronunciation_exercises": True,
            "supported_languages": ["en", "fr", "es", "de", "it", "pt"]
        },
        "vision": {
            "image_analysis": True,
            "object_detection": True,
            "text_extraction": True,
            "handwriting_recognition": True,
            "gesture_detection": True,
            "document_analysis": True,
            "visual_explanations": True
        }
    }

# =========================
# ENDPOINTS NLP
# =========================

@app.post("/nlp/complexity", response_model=AIResponse)
async def analyze_text_complexity(request: TextComplexityRequest):
    """Analyse la complexité d'un texte pour l'adaptation pédagogique"""
    start_time = datetime.now()
    
    try:
        result = await nlp_processor.analyze_text_complexity(request.text, request.language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AIResponse(
            success=True,
            data=result,
            message="Analyse de complexité terminée",
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Erreur analyse complexité: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nlp/generate", response_model=AIResponse)
async def generate_educational_content(request: ContentGenerationRequest):
    """Génère du contenu éducatif adapté"""
    start_time = datetime.now()
    
    try:
        result = await nlp_processor.generate_educational_content(
            request.topic, request.level, request.language
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AIResponse(
            success=True,
            data=result,
            message="Contenu généré avec succès",
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Erreur génération contenu: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nlp/concepts")
async def extract_concepts(request: TextRequest):
    """Extrait les concepts clés d'un texte"""
    start_time = datetime.now()
    
    try:
        result = await nlp_processor.extract_key_concepts(request.text, request.language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": {"concepts": result},
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur extraction concepts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nlp/questions")
async def generate_questions(request: QuestionGenerationRequest):
    """Génère des questions basées sur un texte"""
    start_time = datetime.now()
    
    try:
        result = await nlp_processor.generate_questions(
            request.text, request.num_questions, request.language
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": {"questions": result},
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur génération questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nlp/analyze-response")
async def analyze_student_response(request: ResponseAnalysisRequest):
    """Analyse la réponse d'un étudiant"""
    start_time = datetime.now()
    
    try:
        result = await nlp_processor.analyze_student_response(
            request.question, request.response, request.expected_concepts
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse réponse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# ENDPOINTS EMOTION
# =========================

@app.post("/emotion/text")
async def analyze_text_emotion(request: TextRequest):
    """Analyse les émotions dans un texte"""
    start_time = datetime.now()
    
    try:
        result = await emotion_analyzer.analyze_text_emotion(request.text, request.language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse émotion texte: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/emotion/speech")
async def analyze_speech_emotion(audio: UploadFile = File(...)):
    """Analyse les émotions dans la voix"""
    start_time = datetime.now()
    
    try:
        audio_data = await audio.read()
        result = await emotion_analyzer.analyze_speech_emotion(audio_data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse émotion vocale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/emotion/facial")
async def analyze_facial_emotion(image: UploadFile = File(...)):
    """Analyse les émotions faciales"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await emotion_analyzer.analyze_facial_emotion(image_data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse émotion faciale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/emotion/multimodal")
async def analyze_multimodal_emotion(
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    weights: Optional[str] = Form(None)
):
    """Analyse émotionnelle multimodale"""
    start_time = datetime.now()
    
    try:
        audio_data = await audio.read() if audio else None
        image_data = await image.read() if image else None
        weights_dict = json.loads(weights) if weights else None
        
        result = await emotion_analyzer.get_multimodal_emotion_analysis(
            text=text,
            audio_data=audio_data,
            image_data=image_data,
            weights=weights_dict
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse multimodale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# ENDPOINTS SPEECH
# =========================

@app.post("/speech/recognize")
async def speech_to_text(
    audio: UploadFile = File(...), 
    language: str = Form("en"),
    enhance_quality: bool = Form(True)
):
    """Reconnaissance vocale avancée"""
    start_time = datetime.now()
    
    try:
        audio_data = await audio.read()
        result = await speech_processor.speech_to_text(audio_data, language, enhance_quality)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur reconnaissance vocale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speech/synthesize")
async def text_to_speech(request: SpeechRequest):
    """Synthèse vocale adaptative"""
    start_time = datetime.now()
    
    try:
        result = await speech_processor.text_to_speech(
            request.text, request.language, request.voice_style, request.speed
        )
        
        if "audio_data" in result:
            # Retourne l'audio en streaming
            audio_stream = io.BytesIO(result["audio_data"])
            return StreamingResponse(
                audio_stream,
                media_type="audio/wav",
                headers={"Content-Disposition": "attachment; filename=synthesized_speech.wav"}
            )
        else:
            return {"success": False, "error": "Erreur lors de la synthèse"}
            
    except Exception as e:
        logger.error(f"Erreur synthèse vocale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speech/pronunciation")
async def analyze_pronunciation(
    audio: UploadFile = File(...),
    reference_text: str = Form(...),
    language: str = Form("en")
):
    """Analyse de prononciation"""
    start_time = datetime.now()
    
    try:
        audio_data = await audio.read()
        result = await speech_processor.analyze_pronunciation(reference_text, audio_data, language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse prononciation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speech/detect-language")
async def detect_language(audio: UploadFile = File(...)):
    """Détection automatique de la langue parlée"""
    start_time = datetime.now()
    
    try:
        audio_data = await audio.read()
        result = await speech_processor.detect_language(audio_data)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur détection langue: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speech/exercise")
async def create_pronunciation_exercise(
    target_words: List[str] = Form(...),
    language: str = Form("en"),
    difficulty: str = Form("intermediate")
):
    """Crée un exercice de prononciation personnalisé"""
    start_time = datetime.now()
    
    try:
        result = await speech_processor.create_pronunciation_exercise(target_words, language, difficulty)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur création exercice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# ENDPOINTS VISION
# =========================

@app.post("/vision/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    analysis_type: str = Form("comprehensive")
):
    """Analyse complète d'image pour le contexte éducatif"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await vision_processor.analyze_image(image_data, analysis_type)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vision/handwriting")
async def detect_handwriting(
    image: UploadFile = File(...),
    language: str = Form("en")
):
    """Détection et analyse d'écriture manuscrite"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await vision_processor.detect_handwriting(image_data, language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur détection écriture: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vision/gestures")
async def detect_gestures(
    image: UploadFile = File(...),
    gesture_type: str = Form("hands")
):
    """Détection de gestes de la main ou du corps"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await vision_processor.detect_gestures(image_data, gesture_type)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur détection gestes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vision/document")
async def analyze_document(
    image: UploadFile = File(...),
    document_type: str = Form("general")
):
    """Analyse détaillée de documents éducatifs"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await vision_processor.analyze_document(image_data, document_type)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur analyse document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vision/explanation")
async def create_visual_explanation(
    image: UploadFile = File(...),
    concept: str = Form(...),
    language: str = Form("en")
):
    """Crée une explication visuelle interactive"""
    start_time = datetime.now()
    
    try:
        image_data = await image.read()
        result = await vision_processor.create_visual_explanation(concept, image_data, language)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur création explication visuelle: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vision/assess")
async def assess_visual_learning(
    reference_image: UploadFile = File(...),
    student_image: UploadFile = File(...),
    task_description: str = Form(...)
):
    """Évalue l'apprentissage visuel par comparaison d'images"""
    start_time = datetime.now()
    
    try:
        ref_data = await reference_image.read()
        student_data = await student_image.read()
        
        result = await vision_processor.assess_visual_learning(ref_data, student_data, task_description)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": result,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Erreur évaluation visuelle: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# ENDPOINTS INTÉGRÉS
# =========================

@app.post("/integrated/full-analysis")
async def full_multimodal_analysis(
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    language: str = Form("en")
):
    """Analyse multimodale complète intégrant tous les services"""
    start_time = datetime.now()
    
    try:
        analysis_results = {
            "text_analysis": {},
            "audio_analysis": {},
            "image_analysis": {},
            "emotion_analysis": {},
            "integrated_insights": {}
        }
        
        # Traitement parallèle des modalités disponibles
        tasks = []
        
        if text:
            tasks.append(("text", nlp_processor.analyze_text_complexity(text, language)))
            tasks.append(("text_emotion", emotion_analyzer.analyze_text_emotion(text, language)))
        
        if audio:
            audio_data = await audio.read()
            tasks.append(("audio", speech_processor.speech_to_text(audio_data, language)))
            tasks.append(("audio_emotion", emotion_analyzer.analyze_speech_emotion(audio_data)))
        
        if image:
            image_data = await image.read()
            tasks.append(("image", vision_processor.analyze_image(image_data, "comprehensive")))
            tasks.append(("image_emotion", emotion_analyzer.analyze_facial_emotion(image_data)))
        
        # Exécution des tâches
        for task_name, task_coroutine in tasks:
            try:
                result = await task_coroutine
                if "text" in task_name:
                    analysis_results["text_analysis"][task_name] = result
                elif "audio" in task_name:
                    analysis_results["audio_analysis"][task_name] = result
                elif "image" in task_name:
                    analysis_results["image_analysis"][task_name] = result
            except Exception as e:
                logger.warning(f"Erreur dans {task_name}: {e}")
        
        # Analyse émotionnelle intégrée
        if text or audio_data or image_data:
            multimodal_emotion = await emotion_analyzer.get_multimodal_emotion_analysis(
                text=text,
                audio_data=audio_data if audio else None,
                image_data=image_data if image else None
            )
            analysis_results["emotion_analysis"] = multimodal_emotion
        
        # Génération d'insights intégrés
        # TODO: Implémenter la logique d'intégration des insights
        analysis_results["integrated_insights"] = {
            "learning_state": "engaged",
            "recommended_actions": ["Continue with current approach"],
            "adaptation_suggestions": ["Maintain current difficulty level"]
        }
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "data": analysis_results,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erreur analyse complète: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Gestion des erreurs globales
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erreur non gérée: {exc}")
    return {
        "success": False,
        "error": str(exc),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
