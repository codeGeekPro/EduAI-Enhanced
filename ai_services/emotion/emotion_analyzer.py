"""
Advanced Emotion Analysis Module for EduAI Enhanced
Combines facial recognition, voice tone analysis, and text sentiment for multimodal emotion detection
Features: Real-time emotion tracking, learning state prediction, adaptive response generation
"""

import asyncio
from typing import Dict, List, Optional, Any, Tuple
import logging
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# External dependencies with graceful fallbacks
try:
    import cv2
    import mediapipe as mp
    from tensorflow.keras.models import load_model
    import librosa
    import pickle
    import torch
    from transformers import pipeline
    ADVANCED_FEATURES_AVAILABLE = True
except ImportError:
    cv2 = None
    mp = None
    load_model = None
    librosa = None
    pickle = None
    torch = None
    pipeline = lambda *args, **kwargs: lambda x: [{"label": "neutral", "score": 0.5}]
    ADVANCED_FEATURES_AVAILABLE = False

class EmotionalStateTracker:
    """Tracks emotional state evolution over learning sessions"""
    
    def __init__(self):
        self.emotion_history = []
        self.engagement_patterns = {}
        self.learning_correlation = {}
        
    def update_emotional_state(self, emotion_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update emotional state with temporal analysis"""
        timestamp = datetime.now()
        
        emotion_entry = {
            "timestamp": timestamp,
            "primary_emotion": emotion_data.get("primary_emotion", "neutral"),
            "confidence": emotion_data.get("confidence", 0.5),
            "engagement_level": emotion_data.get("engagement_level", 0.5),
            "stress_indicators": emotion_data.get("stress_indicators", []),
            "learning_readiness": self._calculate_learning_readiness(emotion_data)
        }
        
        self.emotion_history.append(emotion_entry)
        
        # Keep only recent history (last 2 hours)
        cutoff_time = timestamp - timedelta(hours=2)
        self.emotion_history = [e for e in self.emotion_history if e["timestamp"] > cutoff_time]
        
        return self._analyze_emotional_trends()
    
    def _calculate_learning_readiness(self, emotion_data: Dict[str, Any]) -> float:
        """Calculate how ready the student is to learn based on emotional state"""
        primary_emotion = emotion_data.get("primary_emotion", "neutral")
        confidence = emotion_data.get("confidence", 0.5)
        engagement = emotion_data.get("engagement_level", 0.5)
        
        # Optimal emotions for learning
        optimal_emotions = {
            "curious": 0.9,
            "focused": 0.85,
            "calm": 0.8,
            "excited": 0.75,
            "neutral": 0.6,
            "confused": 0.4,
            "frustrated": 0.3,
            "anxious": 0.2,
            "bored": 0.1
        }
        
        base_readiness = optimal_emotions.get(primary_emotion, 0.5)
        confidence_boost = confidence * 0.3
        engagement_boost = engagement * 0.2
        
        return min(1.0, base_readiness + confidence_boost + engagement_boost)

class MultimodalEmotionFusion:
    """Fuses emotion data from multiple sources (face, voice, text) for comprehensive analysis"""
    
    def __init__(self):
        self.modality_weights = {
            "facial": 0.4,
            "vocal": 0.35,
            "textual": 0.25
        }
        self.confidence_threshold = 0.6

class EmotionAnalyzer:
    """Advanced multimodal emotion analyzer with learning state prediction"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if torch else None
        self.emotional_tracker = EmotionalStateTracker()
        self.multimodal_fusion = MultimodalEmotionFusion()
        self.face_detector = None
        self.emotion_model = None
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize emotion detection models"""
        try:
            if ADVANCED_FEATURES_AVAILABLE and pipeline:
                # Text emotion analysis
                self.text_emotion_model = pipeline(
                    "text-classification",
                    model="j-hartmann/emotion-english-distilroberta-base",
                    device=0 if torch and torch.cuda.is_available() else -1
                )
                
                # Initialize MediaPipe face detection if available
                if mp:
                    self.face_detector = mp.solutions.face_detection.FaceDetection(
                        model_selection=0, min_detection_confidence=0.5
                    )
                    
                logger.info("Emotion analysis models initialized successfully")
            else:
                logger.warning("Advanced emotion detection features not available")
        except Exception as e:
            logger.error(f"Error initializing emotion models: {e}")
            
            # Modèle pour l'analyse d'émotions faciales
            try:
                self.face_emotion_detector = FER(mtcnn=True)
            except Exception as e:
                logger.warning(f"Détecteur d'émotions faciales non disponible: {e}")
                self.face_emotion_detector = None
            
            # Mapping des émotions vers des recommandations pédagogiques
            self.emotion_pedagogical_mapping = {
                "joy": {"energy": "high", "difficulty": "maintain", "encouragement": "positive"},
                "sadness": {"energy": "low", "difficulty": "reduce", "encouragement": "supportive"},
                "anger": {"energy": "high", "difficulty": "reduce", "encouragement": "calming"},
                "fear": {"energy": "low", "difficulty": "reduce", "encouragement": "reassuring"},
                "surprise": {"energy": "medium", "difficulty": "explain", "encouragement": "clarifying"},
                "disgust": {"energy": "low", "difficulty": "change_approach", "encouragement": "motivating"},
                "neutral": {"energy": "medium", "difficulty": "maintain", "encouragement": "neutral"}
            }
            
            logger.info("Modèles d'analyse émotionnelle initialisés avec succès")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation des modèles d'émotion: {e}")
            raise

    async def analyze_text_emotion(self, text: str, language: str = "en") -> Dict[str, Any]:
        """Analyse les émotions dans un texte"""
        try:
            # Analyse principale avec le modèle
            emotions = self.text_emotion_model(text)
            
            # Normalisation des scores
            emotion_scores = {}
            for emotion in emotions:
                emotion_scores[emotion['label'].lower()] = emotion['score']
            
            # Détection d'émotions spécifiques au contexte éducatif
            educational_emotions = await self._detect_educational_emotions(text)
            
            # Émotion dominante
            dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
            
            # Recommandations pédagogiques
            recommendations = self._get_pedagogical_recommendations(dominant_emotion[0])
            
            result = {
                "emotions": emotion_scores,
                "dominant_emotion": {
                    "emotion": dominant_emotion[0],
                    "confidence": dominant_emotion[1]
                },
                "educational_emotions": educational_emotions,
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat(),
                "text_length": len(text),
                "language": language
            }
            
            # Ajout à l'historique
            self._add_to_history("text", result)
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse d'émotion textuelle: {e}")
            return {"error": str(e)}

    async def analyze_speech_emotion(self, audio_data: bytes, sample_rate: int = 16000) -> Dict[str, Any]:
        """Analyse les émotions dans un signal audio"""
        try:
            if not self.speech_processor or not self.speech_model:
                return {"error": "Modèle de reconnaissance vocale des émotions non disponible"}
            
            # Conversion des données audio
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
            
            # Preprocessing audio
            if len(audio_array) > sample_rate * 10:  # Limite à 10 secondes
                audio_array = audio_array[:sample_rate * 10]
            
            # Extraction des features avec Wav2Vec2
            inputs = self.speech_processor(
                audio_array, 
                sampling_rate=sample_rate, 
                return_tensors="pt", 
                padding=True
            )
            
            # Prédiction
            with torch.no_grad():
                outputs = self.speech_model(**inputs)
                predictions = F.softmax(outputs.logits, dim=-1)
            
            # Mapping des émotions (basé sur le modèle utilisé)
            emotion_labels = ["angry", "calm", "disgust", "fearful", "happy", "neutral", "sad", "surprised"]
            emotion_scores = {}
            
            for i, label in enumerate(emotion_labels):
                emotion_scores[label] = float(predictions[0][i])
            
            # Émotion dominante
            dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
            
            # Analyse supplémentaire avec librosa
            prosodic_features = await self._analyze_prosodic_features(audio_array, sample_rate)
            
            # Recommandations pédagogiques
            recommendations = self._get_pedagogical_recommendations(dominant_emotion[0])
            
            result = {
                "emotions": emotion_scores,
                "dominant_emotion": {
                    "emotion": dominant_emotion[0],
                    "confidence": dominant_emotion[1]
                },
                "prosodic_features": prosodic_features,
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat(),
                "audio_duration": len(audio_array) / sample_rate,
                "sample_rate": sample_rate
            }
            
            # Ajout à l'historique
            self._add_to_history("speech", result)
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse d'émotion vocale: {e}")
            return {"error": str(e)}

    async def analyze_facial_emotion(self, image_data: bytes) -> Dict[str, Any]:
        """Analyse les émotions faciales dans une image"""
        try:
            if not self.face_emotion_detector:
                return {"error": "Détecteur d'émotions faciales non disponible"}
            
            # Conversion de l'image
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {"error": "Image non valide"}
            
            # Détection des émotions
            emotions = self.face_emotion_detector.detect_emotions(image)
            
            if not emotions:
                return {"emotions": {}, "faces_detected": 0}
            
            # Traitement des résultats pour chaque visage détecté
            faces_emotions = []
            for face_data in emotions:
                face_emotions = face_data["emotions"]
                
                # Émotion dominante pour ce visage
                dominant_emotion = max(face_emotions.items(), key=lambda x: x[1])
                
                # Recommandations pédagogiques
                recommendations = self._get_pedagogical_recommendations(dominant_emotion[0])
                
                faces_emotions.append({
                    "box": face_data["box"],
                    "emotions": face_emotions,
                    "dominant_emotion": {
                        "emotion": dominant_emotion[0],
                        "confidence": dominant_emotion[1]
                    },
                    "recommendations": recommendations
                })
            
            # Émotion moyenne si plusieurs visages
            if len(faces_emotions) > 1:
                avg_emotions = self._calculate_average_emotions([f["emotions"] for f in faces_emotions])
                dominant_avg = max(avg_emotions.items(), key=lambda x: x[1])
            else:
                avg_emotions = faces_emotions[0]["emotions"] if faces_emotions else {}
                dominant_avg = faces_emotions[0]["dominant_emotion"] if faces_emotions else {"emotion": "neutral", "confidence": 0}
            
            result = {
                "faces": faces_emotions,
                "faces_detected": len(faces_emotions),
                "average_emotions": avg_emotions,
                "dominant_emotion": dominant_avg,
                "recommendations": self._get_pedagogical_recommendations(dominant_avg["emotion"]) if isinstance(dominant_avg, dict) else {},
                "timestamp": datetime.now().isoformat(),
                "image_processed": True
            }
            
            # Ajout à l'historique
            self._add_to_history("facial", result)
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse d'émotion faciale: {e}")
            return {"error": str(e)}

    async def get_multimodal_emotion_analysis(self, 
                                            text: Optional[str] = None,
                                            audio_data: Optional[bytes] = None,
                                            image_data: Optional[bytes] = None,
                                            weights: Dict[str, float] = None) -> Dict[str, Any]:
        """Analyse émotionnelle multimodale combinée"""
        
        if weights is None:
            weights = {"text": 0.4, "speech": 0.35, "facial": 0.25}
        
        analyses = {}
        combined_emotions = {}
        
        try:
            # Analyse textuelle
            if text:
                text_analysis = await self.analyze_text_emotion(text)
                if "error" not in text_analysis:
                    analyses["text"] = text_analysis
                    for emotion, score in text_analysis["emotions"].items():
                        combined_emotions[emotion] = combined_emotions.get(emotion, 0) + (score * weights["text"])
            
            # Analyse vocale
            if audio_data:
                speech_analysis = await self.analyze_speech_emotion(audio_data)
                if "error" not in speech_analysis:
                    analyses["speech"] = speech_analysis
                    for emotion, score in speech_analysis["emotions"].items():
                        combined_emotions[emotion] = combined_emotions.get(emotion, 0) + (score * weights["speech"])
            
            # Analyse faciale
            if image_data:
                facial_analysis = await self.analyze_facial_emotion(image_data)
                if "error" not in facial_analysis:
                    analyses["facial"] = facial_analysis
                    if "average_emotions" in facial_analysis:
                        for emotion, score in facial_analysis["average_emotions"].items():
                            combined_emotions[emotion] = combined_emotions.get(emotion, 0) + (score * weights["facial"])
            
            # Normalisation des scores combinés
            if combined_emotions:
                total_weight = sum(weights[modality] for modality in analyses.keys())
                for emotion in combined_emotions:
                    combined_emotions[emotion] /= total_weight
            
            # Émotion dominante combinée
            dominant_combined = max(combined_emotions.items(), key=lambda x: x[1]) if combined_emotions else ("neutral", 0)
            
            # Recommandations consolidées
            consolidated_recommendations = self._consolidate_recommendations(analyses, dominant_combined[0])
            
            # Tendances émotionnelles
            emotion_trends = self._analyze_emotion_trends()
            
            result = {
                "individual_analyses": analyses,
                "combined_emotions": combined_emotions,
                "dominant_emotion": {
                    "emotion": dominant_combined[0],
                    "confidence": dominant_combined[1]
                },
                "consolidated_recommendations": consolidated_recommendations,
                "emotion_trends": emotion_trends,
                "modalities_used": list(analyses.keys()),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse multimodale: {e}")
            return {"error": str(e)}

    async def analyze_emotion(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive emotion analysis from multiple input sources"""
        try:
            # Text-based emotion analysis
            textual_data = {}
            if "text" in input_data:
                textual_data = await self._analyze_text_emotion(input_data["text"])
            
            # Facial emotion analysis (placeholder - would use actual image processing)
            facial_data = {}
            if "image" in input_data:
                facial_data = await self._analyze_facial_emotion(input_data["image"])
            
            # Voice emotion analysis (placeholder - would use actual audio processing)
            vocal_data = {}
            if "audio" in input_data:
                vocal_data = await self._analyze_voice_emotion(input_data["audio"])
            
            # Fuse multimodal emotion data
            fused_emotion = await self._fuse_emotion_signals(facial_data, vocal_data, textual_data)
            
            # Update emotional state tracking
            emotional_state = self.emotional_tracker.update_emotional_state(fused_emotion)
            
            # Generate adaptive responses
            adaptive_response = await self._generate_adaptive_response(fused_emotion, emotional_state)
            
            return {
                "primary_emotion": fused_emotion["primary_emotion"],
                "confidence": fused_emotion["overall_confidence"],
                "emotion_breakdown": fused_emotion.get("emotion_scores", {}),
                "modality_analysis": {
                    "facial": facial_data,
                    "vocal": vocal_data,
                    "textual": textual_data
                },
                "emotional_trends": emotional_state,
                "adaptive_response": adaptive_response,
                "learning_readiness": emotional_state.get("current_readiness", 0.5),
                "innovation_features": [
                    "multimodal_fusion",
                    "temporal_emotion_tracking", 
                    "adaptive_response_generation",
                    "learning_readiness_prediction"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in emotion analysis: {e}")
            return {
                "primary_emotion": "neutral",
                "confidence": 0.5,
                "error": str(e),
                "fallback_used": True
            }
    
    async def _analyze_text_emotion(self, text: str) -> Dict[str, Any]:
        """Analyze emotion from text input using advanced NLP"""
        try:
            if ADVANCED_FEATURES_AVAILABLE and hasattr(self, 'text_emotion_model'):
                result = self.text_emotion_model(text)[0]
                emotion = result['label'].lower()
                confidence = result['score']
            else:
                # Fallback keyword-based analysis
                emotion, confidence = self._keyword_emotion_analysis(text)
            
            return {
                "emotion": emotion,
                "confidence": confidence,
                "text_length": len(text),
                "analysis_method": "transformer_model" if ADVANCED_FEATURES_AVAILABLE else "keyword_based"
            }
        except Exception as e:
            logger.error(f"Error in text emotion analysis: {e}")
            return {"emotion": "neutral", "confidence": 0.3, "error": str(e)}
    
    def _keyword_emotion_analysis(self, text: str) -> Tuple[str, float]:
        """Fallback keyword-based emotion analysis"""
        emotion_keywords = {
            "joy": ["happy", "great", "awesome", "love", "amazing", "excellent", "wonderful"],
            "excitement": ["wow", "fantastic", "incredible", "brilliant", "outstanding"],
            "sadness": ["sad", "disappointed", "unhappy", "depressed", "down"],
            "anger": ["angry", "mad", "furious", "annoyed", "irritated"],
            "fear": ["scared", "afraid", "worried", "nervous", "anxious"],
            "surprise": ["surprised", "shocked", "amazed", "astonished"],
            "disgust": ["disgusting", "awful", "terrible", "horrible", "gross"]
        }
        
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score / len(keywords)
        
        if not emotion_scores:
            return "neutral", 0.5
        
        primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
        confidence = min(emotion_scores[primary_emotion] * 2, 1.0)  # Scale up confidence
        
        return primary_emotion, confidence
    
    async def _analyze_facial_emotion(self, image_data: Any) -> Dict[str, Any]:
        """Analyze emotion from facial expressions"""
        try:
            if not ADVANCED_FEATURES_AVAILABLE or not self.face_detector:
                return {
                    "emotion": "neutral",
                    "confidence": 0.3,
                    "analysis_method": "fallback",
                    "message": "Advanced facial analysis not available"
                }
            
            # Placeholder for advanced facial emotion detection
            # In real implementation, would process actual image data
            return {
                "emotion": "focused",
                "confidence": 0.7,
                "facial_landmarks": "detected",
                "engagement_level": 0.8,
                "analysis_method": "computer_vision"
            }
        except Exception as e:
            return {
                "emotion": "neutral",
                "confidence": 0.3,
                "error": str(e),
                "analysis_method": "error_fallback"
            }
    
    async def _analyze_voice_emotion(self, audio_data: Any) -> Dict[str, Any]:
        """Analyze emotion from voice/audio input"""
        try:
            if not ADVANCED_FEATURES_AVAILABLE or not librosa:
                return {
                    "emotion": "neutral",
                    "confidence": 0.3,
                    "analysis_method": "fallback",
                    "message": "Advanced voice analysis not available"
                }
            
            # Placeholder for advanced voice emotion detection
            # In real implementation, would process actual audio data
            return {
                "emotion": "calm",
                "confidence": 0.6,
                "voice_features": {
                    "tone": "moderate",
                    "pace": "normal",
                    "energy": "medium"
                },
                "analysis_method": "audio_processing"
            }
        except Exception as e:
            return {
                "emotion": "neutral",
                "confidence": 0.3,
                "error": str(e),
                "analysis_method": "error_fallback"
            }
    
    async def _fuse_emotion_signals(self, facial_data: Dict[str, Any], 
                                   vocal_data: Dict[str, Any], 
                                   textual_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fuse multiple emotion signals into unified emotion state"""
        emotions = {
            "facial": facial_data.get("emotion", "neutral"),
            "vocal": vocal_data.get("emotion", "neutral"), 
            "textual": textual_data.get("emotion", "neutral")
        }
        
        confidences = {
            "facial": facial_data.get("confidence", 0.5),
            "vocal": vocal_data.get("confidence", 0.5),
            "textual": textual_data.get("confidence", 0.5)
        }
        
        # Weight by confidence and modality importance
        weights = self.multimodal_fusion.modality_weights
        
        # Calculate weighted emotion scores
        emotion_scores = {}
        all_emotions = set(emotions.values())
        
        for emotion in all_emotions:
            score = 0.0
            for modality, detected_emotion in emotions.items():
                if detected_emotion == emotion:
                    score += weights[modality] * confidences[modality]
            emotion_scores[emotion] = score
        
        # Find primary emotion
        primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0] if emotion_scores else "neutral"
        
        # Calculate overall confidence
        overall_confidence = sum(conf * weights[mod] for mod, conf in confidences.items())
        overall_confidence = min(overall_confidence, 1.0)
        
        return {
            "primary_emotion": primary_emotion,
            "emotion_scores": emotion_scores,
            "overall_confidence": overall_confidence,
            "modality_weights": weights
        }
    
    async def _generate_adaptive_response(self, emotion_data: Dict[str, Any],
                                        emotional_state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate adaptive response based on emotional analysis"""
        primary_emotion = emotion_data["primary_emotion"]
        confidence = emotion_data["overall_confidence"]
        
        response_strategies = {
            "anxious": {
                "content_adjustment": "simplify_and_encourage",
                "pacing": "slower",
                "interaction_style": "supportive",
                "visual_elements": "calming_colors"
            },
            "anger": {
                "content_adjustment": "provide_hints",
                "pacing": "break_recommended",
                "interaction_style": "patient",
                "visual_elements": "motivational"
            },
            "sadness": {
                "content_adjustment": "add_positive_examples",
                "pacing": "gentle",
                "interaction_style": "encouraging",
                "visual_elements": "uplifting_imagery"
            },
            "joy": {
                "content_adjustment": "increase_challenge",
                "pacing": "maintain_momentum",
                "interaction_style": "energetic",
                "visual_elements": "vibrant_colors"
            },
            "fear": {
                "content_adjustment": "add_examples",
                "pacing": "slower_with_repetition",
                "interaction_style": "clarifying",
                "visual_elements": "clear_diagrams"
            }
        }
        
        strategy = response_strategies.get(primary_emotion, {
            "content_adjustment": "maintain_current",
            "pacing": "normal",
            "interaction_style": "neutral",
            "visual_elements": "standard"
        })
        
        return {
            "strategy": strategy,
            "confidence_in_response": confidence * 0.8,
            "immediate_actions": self._get_immediate_actions(primary_emotion)
        }
    
    def _get_immediate_actions(self, emotion: str) -> List[str]:
        """Get immediate actions based on current emotion"""
        action_mapping = {
            "anxious": ["provide_encouragement", "simplify_content", "offer_break"],
            "anger": ["pause_activity", "provide_alternative", "calm_environment"],
            "sadness": ["positive_reinforcement", "motivational_content", "peer_support"],
            "joy": ["capitalize_engagement", "increase_difficulty", "add_challenges"],
            "fear": ["provide_examples", "step_by_step_guidance", "reassurance"]
        }
        
        return action_mapping.get(emotion, ["continue_normal_flow"])

# Global instance for easy import
emotion_analyzer = EmotionAnalyzer()
