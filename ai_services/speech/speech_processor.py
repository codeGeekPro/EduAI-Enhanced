"""
Advanced Speech Processing Module for EduAI Enhanced
Multilingual speech recognition, adaptive speech synthesis,
pronunciation analysis and phonetic correction
"""

import asyncio
import numpy as np
import librosa
import soundfile as sf
from typing import Dict, List, Optional, Any, Tuple
import torch
import speech_recognition as sr
from transformers import (
    Wav2Vec2ForCTC, Wav2Vec2Processor,
    SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan,
    AutoTokenizer, AutoModelForSequenceClassification
)
import tempfile
import io
import logging
from datetime import datetime
import json
import re
from pydub import AudioSegment
from pydub.silence import split_on_silence
import phoneme
from scipy.spatial.distance import cosine
import whisper

logger = logging.getLogger(__name__)

class AdaptiveLearningEngine:
    """Adaptive speech learning engine for personalized pronunciation training"""
    
    def __init__(self):
        self.learning_history = {}
        self.difficulty_levels = {
            "beginner": {"threshold": 0.5, "repetitions": 3},
            "intermediate": {"threshold": 0.7, "repetitions": 2},
            "advanced": {"threshold": 0.85, "repetitions": 1}
        }
        
    def assess_level(self, user_id: str, accuracy_scores: List[float]) -> str:
        """Assess user's current speech learning level"""
        if not accuracy_scores:
            return "beginner"
            
        avg_accuracy = np.mean(accuracy_scores)
        if avg_accuracy >= 0.85:
            return "advanced"
        elif avg_accuracy >= 0.7:
            return "intermediate"
        else:
            return "beginner"
            
    def adapt_difficulty(self, user_id: str, performance: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamically adapt learning difficulty based on performance"""
        level = self.assess_level(user_id, performance.get("scores", []))
        settings = self.difficulty_levels[level].copy()
        
        # Adjust based on recent performance
        recent_scores = performance.get("scores", [])[-5:]
        if recent_scores:
            trend = np.mean(recent_scores)
            if trend > 0.9:
                settings["threshold"] *= 1.1
                settings["repetitions"] = max(1, settings["repetitions"] - 1)
            elif trend < 0.4:
                settings["threshold"] *= 0.9
                settings["repetitions"] += 1
                
        return {"level": level, "settings": settings}

class PhoneticAnalyzer:
    """Advanced phonetic analysis for pronunciation training"""
    
    def __init__(self):
        self.phoneme_embeddings = {}
        self.language_phoneme_maps = {
            "en": ["æ", "ɑ", "ʌ", "ɔ", "ɪ", "i", "ʊ", "u", "e", "o"],
            "fr": ["a", "e", "ɛ", "i", "o", "ɔ", "u", "y", "ø", "œ"],
            "es": ["a", "e", "i", "o", "u", "r", "rr", "ñ"],
            "de": ["a", "ɛ", "i", "o", "u", "y", "ø", "œ", "ʏ", "ʊ"]
        }
        
    def extract_phonemes(self, audio_data: np.ndarray, language: str = "en") -> List[str]:
        """Extract phonemes from audio data"""
        try:
            # Use advanced phoneme extraction
            phonemes = phoneme.extract_phonemes(audio_data, language=language)
            return phonemes
        except Exception as e:
            logger.warning(f"Phoneme extraction failed: {e}")
            return []
            
    def compare_pronunciation(self, target_phonemes: List[str], 
                            spoken_phonemes: List[str]) -> Dict[str, Any]:
        """Compare target and spoken phonemes for pronunciation accuracy"""
        if not target_phonemes or not spoken_phonemes:
            return {"accuracy": 0.0, "errors": [], "suggestions": []}
            
        # Dynamic Time Warping for sequence alignment
        accuracy = self._dtw_phoneme_similarity(target_phonemes, spoken_phonemes)
        errors = self._identify_pronunciation_errors(target_phonemes, spoken_phonemes)
        suggestions = self._generate_pronunciation_tips(errors)
        
        return {
            "accuracy": accuracy,
            "errors": errors,
            "suggestions": suggestions,
            "detailed_analysis": self._detailed_phoneme_analysis(target_phonemes, spoken_phonemes)
        }
        
    def _dtw_phoneme_similarity(self, target: List[str], spoken: List[str]) -> float:
        """Calculate similarity using Dynamic Time Warping"""
        if not target or not spoken:
            return 0.0
            
        # Simple edit distance for now (can be enhanced with DTW)
        m, n = len(target), len(spoken)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
            
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if target[i-1] == spoken[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
                    
        max_len = max(m, n)
        similarity = 1 - (dp[m][n] / max_len) if max_len > 0 else 0
        return max(0, similarity)
        
    def _identify_pronunciation_errors(self, target: List[str], spoken: List[str]) -> List[Dict[str, Any]]:
        """Identify specific pronunciation errors"""
        errors = []
        # Simplified error detection (can be enhanced)
        for i, (t_phoneme, s_phoneme) in enumerate(zip(target, spoken)):
            if t_phoneme != s_phoneme:
                errors.append({
                    "position": i,
                    "expected": t_phoneme,
                    "actual": s_phoneme,
                    "error_type": self._classify_error_type(t_phoneme, s_phoneme)
                })
        return errors
        
    def _classify_error_type(self, expected: str, actual: str) -> str:
        """Classify the type of pronunciation error"""
        vowel_phonemes = ["a", "e", "i", "o", "u", "æ", "ɑ", "ʌ", "ɔ", "ɪ", "ʊ"]
        
        if expected in vowel_phonemes and actual in vowel_phonemes:
            return "vowel_substitution"
        elif expected not in vowel_phonemes and actual not in vowel_phonemes:
            return "consonant_substitution"
        else:
            return "category_confusion"
            
    def _generate_pronunciation_tips(self, errors: List[Dict[str, Any]]) -> List[str]:
        """Generate helpful pronunciation tips based on errors"""
        tips = []
        error_types = [error["error_type"] for error in errors]
        
        if "vowel_substitution" in error_types:
            tips.append("Focus on vowel sounds - practice mouth positioning for different vowels")
        if "consonant_substitution" in error_types:
            tips.append("Practice consonant articulation - pay attention to tongue placement")
        if "category_confusion" in error_types:
            tips.append("Work on distinguishing between vowels and consonants")
            
        return tips
        
    def _detailed_phoneme_analysis(self, target: List[str], spoken: List[str]) -> Dict[str, Any]:
        """Provide detailed phoneme-by-phoneme analysis"""
        analysis = {
            "total_phonemes": len(target),
            "correct_phonemes": 0,
            "phoneme_details": []
        }
        
        for i, (t_phoneme, s_phoneme) in enumerate(zip(target, spoken)):
            is_correct = t_phoneme == s_phoneme
            if is_correct:
                analysis["correct_phonemes"] += 1
                
            analysis["phoneme_details"].append({
                "position": i,
                "target": t_phoneme,
                "spoken": s_phoneme,
                "correct": is_correct,
                "confidence": 1.0 if is_correct else 0.5  # Simplified confidence
            })
            
        return analysis

class MultiModalSpeechEngine:
    """Multimodal speech processing engine combining speech, text, and visual cues"""
    
    def __init__(self):
        self.speech_embeddings = {}
        self.text_embeddings = {}
        
    def process_multimodal_input(self, audio_data: np.ndarray, 
                                text_context: str, 
                                visual_cues: Optional[Dict] = None) -> Dict[str, Any]:
        """Process speech with multimodal context"""
        speech_features = self._extract_speech_features(audio_data)
        text_features = self._extract_text_features(text_context)
        
        # Fusion of modalities
        fused_features = self._fuse_modalities(speech_features, text_features, visual_cues)
        
        return {
            "speech_features": speech_features,
            "text_features": text_features,
            "fused_representation": fused_features,
            "confidence": self._calculate_multimodal_confidence(fused_features)
        }
        
    def _extract_speech_features(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """Extract comprehensive speech features"""
        # Prosodic features
        fundamental_freq = librosa.yin(audio_data, fmin=80, fmax=400)
        energy = librosa.feature.rms(y=audio_data)[0]
        
        # Spectral features
        mfccs = librosa.feature.mfcc(y=audio_data, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_data)[0]
        
        return {
            "prosodic": {
                "f0": fundamental_freq,
                "energy": energy,
                "duration": len(audio_data) / 22050  # Assuming 22050 Hz
            },
            "spectral": {
                "mfccs": mfccs,
                "spectral_centroid": spectral_centroid
            }
        }
        
    def _extract_text_features(self, text: str) -> Dict[str, Any]:
        """Extract text-based features for multimodal fusion"""
        return {
            "length": len(text),
            "complexity": len(text.split()),
            "sentiment": 0.5,  # Placeholder for sentiment analysis
            "semantic_density": len(set(text.split())) / len(text.split()) if text else 0
        }
        
    def _fuse_modalities(self, speech_features: Dict, text_features: Dict, 
                        visual_cues: Optional[Dict]) -> np.ndarray:
        """Fuse different modalities into unified representation"""
        # Simplified fusion - in practice would use learned fusion networks
        speech_vector = np.concatenate([
            speech_features["prosodic"]["energy"][:10],  # Take first 10 energy values
            speech_features["spectral"]["mfccs"].mean(axis=1)  # Average MFCCs
        ])
        
        text_vector = np.array([
            text_features["length"],
            text_features["complexity"],
            text_features["sentiment"],
            text_features["semantic_density"]
        ])
        
        # Normalize and concatenate
        speech_vector = speech_vector / (np.linalg.norm(speech_vector) + 1e-8)
        text_vector = text_vector / (np.linalg.norm(text_vector) + 1e-8)
        
        return np.concatenate([speech_vector, text_vector])
        
    def _calculate_multimodal_confidence(self, fused_features: np.ndarray) -> float:
        """Calculate confidence based on multimodal features"""
        # Simplified confidence calculation
        feature_variance = np.var(fused_features)
        confidence = min(1.0, feature_variance * 10)  # Scale appropriately
        return confidence

class SpeechProcessor:
    """Advanced Speech Processor for Interactive Learning"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._initialize_models()
        self.adaptive_engine = AdaptiveLearningEngine()
        self.phonetic_analyzer = PhoneticAnalyzer()
        self.multimodal_engine = MultiModalSpeechEngine()
        self.supported_languages = {
            "en": "English",
            "fr": "French", 
            "es": "Spanish",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "zh": "Chinese",
            "ja": "Japanese",
            "ar": "Arabic"
        }
        
    def _initialize_models(self):
        """Initialize all speech processing models"""
        try:
            # Speech recognition with Whisper (more robust)
            self.whisper_model = whisper.load_model("base")
            
            # Speech synthesis with SpeechT5
            self.tts_processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
            self.tts_model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
            self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
            
            # Multilingual models
            try:
                self.multilingual_asr_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-xlsr-53")
                self.multilingual_asr_model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-xlsr-53")
            except Exception as e:
                logger.warning(f"Multilingual ASR model not available: {e}")
                self.multilingual_asr_processor = None
                self.multilingual_asr_model = None
            
            # Speech synthesis with SpeechT5
            try:
                self.tts_processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
                self.tts_model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
                self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
            except Exception as e:
                logger.warning(f"TTS model not available: {e}")
                self.tts_processor = None
                self.tts_model = None
                self.vocoder = None
            
            # Speech recognition with SpeechRecognition as fallback
            self.sr_recognizer = sr.Recognizer()
            
            # Phonemes for pronunciation analysis
            self.phoneme_mapping = self._load_phoneme_mapping()
            
            logger.info("Speech processing models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing speech models: {e}")
            raise

    async def speech_to_text(self, audio_data: bytes, language: str = "en", 
                           enhance_quality: bool = True) -> Dict[str, Any]:
        """Convert speech to text with detailed analysis"""
        try:
            # Audio preprocessing
            audio_array, sample_rate = await self._preprocess_audio(audio_data, enhance_quality)
            
            if audio_array is None:
                return {"error": "Invalid audio data"}
            
            # Model selection based on language
            if language == "en" or not self.multilingual_asr_processor:
                processor = self.asr_processor
                model = self.asr_model
            else:
                processor = self.multilingual_asr_processor
                model = self.multilingual_asr_model
            
            # Recognition with Wav2Vec2
            inputs = processor(audio_array, sampling_rate=sample_rate, return_tensors="pt", padding=True)
            
            with torch.no_grad():
                logits = model(**inputs).logits
            
            # Decoding
            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = processor.batch_decode(predicted_ids)[0]
            
            # Confidence analysis
            confidence_scores = await self._calculate_confidence(logits)
            
            # Fallback with SpeechRecognition if low confidence
            fallback_transcription = None
            if confidence_scores["average"] < 0.7:
                fallback_transcription = await self._fallback_speech_recognition(audio_data, language)
            
            # Audio quality analysis
            audio_quality = await self._analyze_audio_quality(audio_array, sample_rate)
            
            # Speech segment detection
            speech_segments = await self._detect_speech_segments(audio_array, sample_rate)
            
            # Pronunciation analysis if requested
            pronunciation_analysis = await self._analyze_pronunciation(
                transcription, audio_array, sample_rate, language
            )
            
            result = {
                "transcription": transcription.strip(),
                "language": language,
                "confidence": confidence_scores,
                "audio_quality": audio_quality,
                "speech_segments": speech_segments,
                "pronunciation_analysis": pronunciation_analysis,
                "fallback_transcription": fallback_transcription,
                "duration": len(audio_array) / sample_rate,
                "sample_rate": sample_rate,
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error during speech-to-text conversion: {e}")
            return {"error": str(e)}

    async def text_to_speech(self, text: str, language: str = "en", 
                           voice_style: str = "neutral", speed: float = 1.0) -> Dict[str, Any]:
        """Convert text to speech with adaptive styling"""
        try:
            if not self.tts_processor or not self.tts_model:
                return {"error": "Speech synthesis model not available"}
            
            # Text preprocessing
            processed_text = await self._preprocess_text_for_tts(text, language)
            
            # Generation with SpeechT5
            inputs = self.tts_processor(text=processed_text, return_tensors="pt")
            
            # Speaker embedding (voice style)
            speaker_embeddings = await self._get_speaker_embeddings(voice_style)
            
            # Speech generation
            with torch.no_grad():
                speech = self.tts_model.generate_speech(
                    inputs["input_ids"], 
                    speaker_embeddings, 
                    vocoder=self.vocoder
                )
            
            # Speed adjustment
            if speed != 1.0:
                speech = await self._adjust_speech_speed(speech, speed)
            
            # Convert to bytes
            audio_bytes = await self._speech_to_bytes(speech, sample_rate=16000)
            
            # Generated speech quality analysis
            quality_metrics = await self._analyze_generated_speech_quality(speech)
            
            result = {
                "audio_data": audio_bytes,
                "text": text,
                "processed_text": processed_text,
                "language": language,
                "voice_style": voice_style,
                "speed": speed,
                "duration": len(speech) / 16000,
                "quality_metrics": quality_metrics,
                "sample_rate": 16000,
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error during speech synthesis: {e}")
            return {"error": str(e)}

    async def analyze_pronunciation(self, reference_text: str, audio_data: bytes, 
                                  language: str = "en") -> Dict[str, Any]:
        """Detailed pronunciation analysis"""
        try:
            # Recognition of what was said
            asr_result = await self.speech_to_text(audio_data, language, enhance_quality=True)
            
            if "error" in asr_result:
                return asr_result
            
            spoken_text = asr_result["transcription"]
            
            # Audio preprocessing
            audio_array, sample_rate = await self._preprocess_audio(audio_data, enhance_quality=True)
            
            # Phonetic alignment
            phonetic_alignment = await self._align_phonemes(reference_text, spoken_text, 
                                                          audio_array, sample_rate, language)
            
            # Pronunciation error analysis
            pronunciation_errors = await self._detect_pronunciation_errors(
                reference_text, spoken_text, phonetic_alignment, language
            )
            
            # Overall pronunciation score
            pronunciation_score = await self._calculate_pronunciation_score(
                phonetic_alignment, pronunciation_errors
            )
            
            # Improvement recommendations
            improvement_suggestions = await self._generate_pronunciation_feedback(
                pronunciation_errors, language
            )
            
            # Prosodic analysis
            prosodic_analysis = await self._analyze_prosody(audio_array, sample_rate, language)
            
            result = {
                "reference_text": reference_text,
                "spoken_text": spoken_text,
                "language": language,
                "pronunciation_score": pronunciation_score,
                "phonetic_alignment": phonetic_alignment,
                "pronunciation_errors": pronunciation_errors,
                "improvement_suggestions": improvement_suggestions,
                "prosodic_analysis": prosodic_analysis,
                "overall_assessment": self._generate_overall_assessment(pronunciation_score),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error during pronunciation analysis: {e}")
            return {"error": str(e)}

    async def detect_language(self, audio_data: bytes) -> Dict[str, Any]:
        """Automatically detect spoken language"""
        try:
            # Audio preprocessing
            audio_array, sample_rate = await self._preprocess_audio(audio_data)
            
            language_scores = {}
            
            # Test with multiple language models
            for lang_code, lang_name in self.supported_languages.items():
                try:
                    # Recognition with each language model
                    result = await self.speech_to_text(audio_data, lang_code, enhance_quality=False)
                    
                    if "error" not in result and result["confidence"]["average"] > 0.3:
                        language_scores[lang_code] = {
                            "confidence": result["confidence"]["average"],
                            "transcription_length": len(result["transcription"]),
                            "language_name": lang_name
                        }
                        
                except Exception as e:
                    logger.debug(f"Error for language {lang_code}: {e}")
                    continue
            
            # Detection based on audio features
            audio_features = await self._extract_language_features(audio_array, sample_rate)
            
            # Select most probable language
            if language_scores:
                best_language = max(language_scores.items(), 
                                  key=lambda x: x[1]["confidence"] * (x[1]["transcription_length"] / 100))
                
                detected_language = {
                    "language_code": best_language[0],
                    "language_name": best_language[1]["language_name"],
                    "confidence": best_language[1]["confidence"],
                    "certainty": "high" if best_language[1]["confidence"] > 0.8 else "medium" if best_language[1]["confidence"] > 0.5 else "low"
                }
            else:
                detected_language = {
                    "language_code": "unknown",
                    "language_name": "Unknown",
                    "confidence": 0,
                    "certainty": "none"
                }
            
            result = {
                "detected_language": detected_language,
                "all_language_scores": language_scores,
                "audio_features": audio_features,
                "supported_languages": self.supported_languages,
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error during language detection: {e}")
            return {"error": str(e)}

    async def create_pronunciation_exercise(self, target_words: List[str], 
                                          language: str = "en", 
                                          difficulty: str = "intermediate") -> Dict[str, Any]:
        """Create personalized pronunciation exercise"""
        try:
            exercise_data = {
                "target_words": target_words,
                "language": language,
                "difficulty": difficulty,
                "exercises": []
            }
            
            for word in target_words:
                # Reference audio generation
                reference_audio = await self.text_to_speech(word, language, voice_style="clear")
                
                # Phonétique du mot
                phonetic_transcription = await self._get_phonetic_transcription(word, language)
                
                # Conseils de prononciation
                pronunciation_tips = await self._generate_pronunciation_tips(word, language)
                
                # Exercices progressifs
                progressive_exercises = await self._create_progressive_exercises(word, language, difficulty)
                
                word_exercise = {
                    "word": word,
                    "phonetic": phonetic_transcription,
                    "reference_audio": reference_audio.get("audio_data"),
                    "pronunciation_tips": pronunciation_tips,
                    "progressive_exercises": progressive_exercises,
                    "difficulty_level": difficulty
                }
                
                exercise_data["exercises"].append(word_exercise)
            
            # Instructions générales
            exercise_data["instructions"] = await self._generate_exercise_instructions(language, difficulty)
            
            # Critères d'évaluation
            exercise_data["evaluation_criteria"] = {
                "pronunciation_accuracy": 0.4,
                "fluency": 0.3,
                "intonation": 0.2,
                "clarity": 0.1
            }
            
            return exercise_data
            
        except Exception as e:
            logger.error(f"Erreur lors de la création d'exercice: {e}")
            return {"error": str(e)}

    async def _preprocess_audio(self, audio_data: bytes, enhance_quality: bool = False) -> Tuple[Optional[np.ndarray], int]:
        """Préprocesse les données audio"""
        try:
            # Conversion en array numpy
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
            
            # Normalisation du format
            audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
            
            # Conversion en array
            audio_array = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
            audio_array = audio_array / np.max(np.abs(audio_array))  # Normalisation
            
            if enhance_quality:
                # Réduction du bruit
                audio_array = await self._reduce_noise(audio_array)
                
                # Amélioration de la qualité
                audio_array = await self._enhance_audio_quality(audio_array)
            
            return audio_array, 16000
            
        except Exception as e:
            logger.error(f"Erreur lors du préprocessing audio: {e}")
            return None, 0

    async def _reduce_noise(self, audio_array: np.ndarray) -> np.ndarray:
        """Réduit le bruit dans l'audio"""
        try:
            # Simple réduction de bruit par seuillage
            noise_threshold = np.percentile(np.abs(audio_array), 10)
            audio_array = np.where(np.abs(audio_array) < noise_threshold, 0, audio_array)
            return audio_array
        except Exception:
            return audio_array

    async def _enhance_audio_quality(self, audio_array: np.ndarray) -> np.ndarray:
        """Améliore la qualité audio"""
        try:
            # Filtre passe-bande pour la voix humaine (80Hz - 8kHz)
            from scipy import signal
            nyquist = 8000
            low = 80 / nyquist
            high = min(3400 / nyquist, 0.99)
            b, a = signal.butter(4, [low, high], btype='band')
            filtered_audio = signal.filtfilt(b, a, audio_array)
            return filtered_audio
        except Exception:
            return audio_array

    async def _calculate_confidence(self, logits: torch.Tensor) -> Dict[str, float]:
        """Calcule les scores de confiance"""
        probabilities = torch.softmax(logits, dim=-1)
        max_probs = torch.max(probabilities, dim=-1)[0]
        
        return {
            "average": float(torch.mean(max_probs)),
            "minimum": float(torch.min(max_probs)),
            "maximum": float(torch.max(max_probs)),
            "variance": float(torch.var(max_probs))
        }

    async def _fallback_speech_recognition(self, audio_data: bytes, language: str) -> Optional[str]:
        """Reconnaissance vocale de fallback avec SpeechRecognition"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                with sr.AudioFile(temp_file.name) as source:
                    audio = self.sr_recognizer.record(source)
                
                # Reconnaissance avec Google (gratuit avec limite)
                lang_map = {"en": "en-US", "fr": "fr-FR", "es": "es-ES"}
                recognition_language = lang_map.get(language, "en-US")
                
                text = self.sr_recognizer.recognize_google(audio, language=recognition_language)
                return text
                
        except Exception as e:
            logger.debug(f"Fallback recognition failed: {e}")
            return None

    async def _analyze_audio_quality(self, audio_array: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """Analyse la qualité de l'audio"""
        try:
            # Signal-to-noise ratio approximatif
            signal_power = np.mean(audio_array ** 2)
            noise_estimation = np.percentile(audio_array ** 2, 10)
            snr = 10 * np.log10(signal_power / (noise_estimation + 1e-10))
            
            # Détection de clipping
            clipping_ratio = np.sum(np.abs(audio_array) > 0.95) / len(audio_array)
            
            # Énergie du signal
            energy = np.sum(audio_array ** 2)
            
            return {
                "snr": float(snr),
                "clipping_ratio": float(clipping_ratio),
                "energy": float(energy),
                "quality_score": max(0, min(100, snr * 5 - clipping_ratio * 50))
            }
            
        except Exception as e:
            logger.error(f"Erreur analyse qualité audio: {e}")
            return {"quality_score": 50}

    async def _detect_speech_segments(self, audio_array: np.ndarray, sample_rate: int) -> List[Dict[str, float]]:
        """Détecte les segments de parole dans l'audio"""
        try:
            # Conversion en AudioSegment pour utiliser pydub
            audio_segment = AudioSegment(
                audio_array.tobytes(), 
                frame_rate=sample_rate,
                sample_width=audio_array.dtype.itemsize,
                channels=1
            )
            
            # Division sur les silences
            chunks = split_on_silence(
                audio_segment,
                min_silence_len=300,
                silence_thresh=audio_segment.dBFS - 14,
                keep_silence=100
            )
            
            segments = []
            current_time = 0
            
            for i, chunk in enumerate(chunks):
                segment_duration = len(chunk) / 1000  # en secondes
                segments.append({
                    "segment_id": i,
                    "start_time": current_time,
                    "end_time": current_time + segment_duration,
                    "duration": segment_duration
                })
                current_time += segment_duration
            
            return segments
            
        except Exception as e:
            logger.error(f"Erreur détection segments: {e}")
            return []

    def _load_phoneme_mapping(self) -> Dict[str, Dict]:
        """Charge le mapping des phonèmes pour chaque langue"""
        # Mapping simplifié - dans un vrai système, ceci serait dans un fichier externe
        return {
            "en": {
                "vowels": ["æ", "ɑ", "ɔ", "ε", "ɪ", "i", "ʊ", "u", "ʌ", "ə"],
                "consonants": ["p", "b", "t", "d", "k", "g", "f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ", "h", "m", "n", "ŋ", "l", "r", "w", "j"]
            },
            "fr": {
                "vowels": ["a", "ɑ", "e", "ε", "ə", "i", "o", "ɔ", "u", "y", "ø", "œ", "ɛ̃", "ɔ̃", "ã", "œ̃"],
                "consonants": ["p", "b", "t", "d", "k", "g", "f", "v", "s", "z", "ʃ", "ʒ", "m", "n", "ɲ", "ŋ", "l", "ʁ", "w", "ɥ", "j"]
            }
        }

    # Méthodes additionnelles pour les fonctionnalités avancées
    async def _analyze_pronunciation(self, text: str, audio_array: np.ndarray, 
                                   sample_rate: int, language: str) -> Dict[str, Any]:
        """Analyse détaillée de la prononciation"""
        # Implementation simplifiée - nécessiterait des modèles phonétiques avancés
        return {
            "phonetic_accuracy": 0.85,
            "common_errors": [],
            "suggestions": ["Focus on vowel sounds", "Work on consonant clusters"]
        }

    async def _preprocess_text_for_tts(self, text: str, language: str) -> str:
        """Préprocesse le texte pour la synthèse vocale"""
        # Nettoyage et normalisation du texte
        text = re.sub(r'[^\w\s\.,!?;:]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    async def _get_speaker_embeddings(self, voice_style: str) -> torch.Tensor:
        """Retourne les embeddings de locuteur pour le style de voix"""
        # Embeddings prédéfinis pour différents styles
        # Dans un vrai système, ceci serait plus sophistiqué
        default_embedding = torch.randn(512)  # Dimension typique pour SpeechT5
        return default_embedding.unsqueeze(0)

    async def _adjust_speech_speed(self, speech: torch.Tensor, speed: float) -> torch.Tensor:
        """Ajuste la vitesse de la parole générée"""
        try:
            # Rééchantillonnage simple pour changer la vitesse
            if speed != 1.0:
                new_length = int(len(speech) / speed)
                indices = torch.linspace(0, len(speech) - 1, new_length)
                speech = torch.index_select(speech, 0, indices.long())
            return speech
        except Exception:
            return speech

    async def _speech_to_bytes(self, speech: torch.Tensor, sample_rate: int) -> bytes:
        """Convertit le tensor audio en bytes"""
        try:
            # Conversion en numpy puis en bytes
            audio_np = speech.cpu().numpy()
            
            # Sauvegarde temporaire
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                sf.write(temp_file.name, audio_np, sample_rate)
                
                # Lecture en bytes
                with open(temp_file.name, "rb") as f:
                    audio_bytes = f.read()
                
                return audio_bytes
                
        except Exception as e:
            logger.error(f"Erreur conversion speech to bytes: {e}")
            return b""

    async def _analyze_generated_speech_quality(self, speech: torch.Tensor) -> Dict[str, float]:
        """Analyse la qualité de la parole générée"""
        try:
            audio_np = speech.cpu().numpy()
            
            # Métriques de base
            energy = float(np.sum(audio_np ** 2))
            max_amplitude = float(np.max(np.abs(audio_np)))
            
            return {
                "energy": energy,
                "max_amplitude": max_amplitude,
                "quality_score": min(100, energy * 1000)  # Score simplifié
            }
        except Exception:
            return {"quality_score": 75}

    def text_to_speech_sync(self, text: str, language: str = "en", voice_style: str = "neutral", speed: float = 1.0) -> Dict[str, Any]:
        """Wrapper synchrone pour la méthode text_to_speech."""
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(self.text_to_speech(text, language, voice_style, speed))

# Instance globale
speech_processor = SpeechProcessor()
