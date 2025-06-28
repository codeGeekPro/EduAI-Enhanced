"""
🎓 EduAI Enhanced - Routes de Traduction
API pour la traduction multilingue en temps réel (50+ langues)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime
import logging

from ...core.config import get_settings, LANGUAGE_REGIONS
from ...core.database import get_database, save_learning_analytics

settings = get_settings()
router = APIRouter()
logger = logging.getLogger(__name__)

# 📝 Modèles de données

class TranslationRequest(BaseModel):
    """Requête de traduction"""
    text: str
    source_language: str
    target_language: str
    context: Optional[str] = "educational"  # educational, casual, formal
    user_id: Optional[str] = None
    preserve_formatting: bool = True

class TranslationResponse(BaseModel):
    """Réponse de traduction"""
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float
    context_used: str
    alternatives: Optional[List[str]] = None
    pronunciation: Optional[str] = None

class BatchTranslationRequest(BaseModel):
    """Requête de traduction en lot"""
    texts: List[str]
    source_language: str
    target_language: str
    context: str = "educational"
    user_id: Optional[str] = None

class LanguageDetectionRequest(BaseModel):
    """Requête de détection de langue"""
    text: str
    user_id: Optional[str] = None

class LanguageDetectionResponse(BaseModel):
    """Réponse de détection de langue"""
    detected_language: str
    confidence_score: float
    possible_languages: List[Dict[str, float]]

class SupportedLanguagesResponse(BaseModel):
    """Langues supportées par région"""
    total_languages: int
    languages_by_region: Dict[str, List[Dict]]
    popular_languages: List[Dict]

# 🌐 Routes de traduction

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    🌐 Traduire un texte entre deux langues
    
    Support de 50+ langues avec optimisation pour le contenu éducatif
    """
    try:
        # Valider les langues
        if request.source_language not in settings.supported_languages:
            raise HTTPException(
                status_code=400,
                detail=f"Langue source non supportée: {request.source_language}"
            )
        
        if request.target_language not in settings.supported_languages:
            raise HTTPException(
                status_code=400,
                detail=f"Langue cible non supportée: {request.target_language}"
            )
        
        # Si même langue, retourner le texte original
        if request.source_language == request.target_language:
            return TranslationResponse(
                original_text=request.text,
                translated_text=request.text,
                source_language=request.source_language,
                target_language=request.target_language,
                confidence_score=1.0,
                context_used=request.context,
                alternatives=[],
                pronunciation=None
            )
        
        # Effectuer la traduction
        translation_result = await perform_translation(
            text=request.text,
            source_lang=request.source_language,
            target_lang=request.target_language,
            context=request.context
        )
        
        # Générer la prononciation si demandée
        pronunciation = None
        if request.target_language in ["zh", "ja", "ko", "ar", "hi"]:
            pronunciation = await generate_pronunciation(
                translation_result["translated_text"],
                request.target_language
            )
        
        # Sauvegarder les analytics si user_id fourni
        if request.user_id:
            await save_learning_analytics(request.user_id, {
                "event_type": "translation",
                "source_language": request.source_language,
                "target_language": request.target_language,
                "text_length": len(request.text),
                "context": request.context,
                "confidence": translation_result["confidence"]
            })
        
        return TranslationResponse(
            original_text=request.text,
            translated_text=translation_result["translated_text"],
            source_language=request.source_language,
            target_language=request.target_language,
            confidence_score=translation_result["confidence"],
            context_used=request.context,
            alternatives=translation_result.get("alternatives", []),
            pronunciation=pronunciation
        )
        
    except Exception as e:
        logger.error(f"Erreur traduction: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de traduction: {str(e)}")

@router.post("/translate/batch")
async def translate_batch(request: BatchTranslationRequest):
    """
    📦 Traduire plusieurs textes en une seule requête
    
    Optimisé pour la traduction de contenu éducatif en masse
    """
    try:
        if len(request.texts) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 textes par requête"
            )
        
        # Traiter les traductions en parallèle
        translation_tasks = [
            perform_translation(
                text=text,
                source_lang=request.source_language,
                target_lang=request.target_language,
                context=request.context
            )
            for text in request.texts
        ]
        
        results = await asyncio.gather(*translation_tasks)
        
        # Formater les résultats
        translations = []
        for i, (original_text, result) in enumerate(zip(request.texts, results)):
            translations.append({
                "index": i,
                "original_text": original_text,
                "translated_text": result["translated_text"],
                "confidence_score": result["confidence"]
            })
        
        # Analytics
        if request.user_id:
            await save_learning_analytics(request.user_id, {
                "event_type": "batch_translation",
                "source_language": request.source_language,
                "target_language": request.target_language,
                "texts_count": len(request.texts),
                "context": request.context
            })
        
        return {
            "total_translations": len(translations),
            "source_language": request.source_language,
            "target_language": request.target_language,
            "translations": translations
        }
        
    except Exception as e:
        logger.error(f"Erreur traduction batch: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de traduction en lot: {str(e)}")

@router.post("/detect-language", response_model=LanguageDetectionResponse)
async def detect_language(request: LanguageDetectionRequest):
    """
    🔍 Détecter automatiquement la langue d'un texte
    
    Utile pour l'auto-adaptation de l'interface
    """
    try:
        detection_result = await perform_language_detection(request.text)
        
        # Analytics
        if request.user_id:
            await save_learning_analytics(request.user_id, {
                "event_type": "language_detection",
                "detected_language": detection_result["language"],
                "confidence": detection_result["confidence"],
                "text_length": len(request.text)
            })
        
        return LanguageDetectionResponse(
            detected_language=detection_result["language"],
            confidence_score=detection_result["confidence"],
            possible_languages=detection_result["alternatives"]
        )
        
    except Exception as e:
        logger.error(f"Erreur détection langue: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de détection: {str(e)}")

@router.get("/languages", response_model=SupportedLanguagesResponse)
async def get_supported_languages():
    """
    🌍 Obtenir la liste des langues supportées par région
    
    Organisé par régions géographiques pour faciliter la sélection
    """
    try:
        # Construire la liste détaillée des langues
        languages_by_region = {}
        
        for region, lang_codes in LANGUAGE_REGIONS.items():
            languages_by_region[region] = []
            for code in lang_codes:
                lang_info = get_language_info(code)
                if lang_info:
                    languages_by_region[region].append(lang_info)
        
        # Langues populaires (basé sur l'usage global)
        popular_languages = [
            get_language_info("en"),  # Anglais
            get_language_info("fr"),  # Français
            get_language_info("es"),  # Espagnol
            get_language_info("zh"),  # Chinois
            get_language_info("ar"),  # Arabe
            get_language_info("sw"),  # Swahili
            get_language_info("wo"),  # Wolof
            get_language_info("ha"),  # Hausa
        ]
        
        return SupportedLanguagesResponse(
            total_languages=len(settings.supported_languages),
            languages_by_region=languages_by_region,
            popular_languages=[lang for lang in popular_languages if lang]
        )
        
    except Exception as e:
        logger.error(f"Erreur récupération langues: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/languages/{language_code}")
async def get_language_details(language_code: str):
    """
    📋 Obtenir les détails d'une langue spécifique
    
    Informations complètes sur une langue (région, locuteurs, etc.)
    """
    try:
        if language_code not in settings.supported_languages:
            raise HTTPException(
                status_code=404,
                detail=f"Langue non supportée: {language_code}"
            )
        
        lang_info = get_language_info(language_code)
        
        if not lang_info:
            raise HTTPException(
                status_code=404,
                detail=f"Informations indisponibles pour: {language_code}"
            )
        
        # Ajouter des informations supplémentaires
        lang_info.update({
            "educational_resources_available": True,
            "tts_support": language_code in ["en", "fr", "es", "de", "it", "pt"],
            "stt_support": language_code in ["en", "fr", "es", "de", "it", "pt", "zh", "ja"],
            "offline_support": language_code in ["en", "fr", "es", "sw", "wo", "ha"]
        })
        
        return lang_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur détails langue: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.post("/translate/educational")
async def translate_educational_content(
    text: str,
    source_language: str,
    target_language: str,
    subject: str,
    grade_level: str = "intermediate",
    user_id: Optional[str] = None
):
    """
    🎓 Traduction spécialisée pour le contenu éducatif
    
    Optimisée pour préserver la terminologie éducative et les concepts
    """
    try:
        # Contexte éducatif spécialisé
        educational_context = f"educational_{subject}_{grade_level}"
        
        # Traduction avec contexte spécialisé
        result = await perform_educational_translation(
            text=text,
            source_lang=source_language,
            target_lang=target_language,
            subject=subject,
            grade_level=grade_level
        )
        
        # Analytics éducatives
        if user_id:
            await save_learning_analytics(user_id, {
                "event_type": "educational_translation",
                "source_language": source_language,
                "target_language": target_language,
                "subject": subject,
                "grade_level": grade_level,
                "text_length": len(text)
            })
        
        return {
            "original_text": text,
            "translated_text": result["translated_text"],
            "subject": subject,
            "grade_level": grade_level,
            "educational_terms_preserved": result["terms_preserved"],
            "cultural_adaptations": result["cultural_notes"],
            "confidence_score": result["confidence"]
        }
        
    except Exception as e:
        logger.error(f"Erreur traduction éducative: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# 🛠️ Fonctions utilitaires

async def perform_translation(
    text: str, 
    source_lang: str, 
    target_lang: str, 
    context: str = "educational"
) -> Dict[str, Any]:
    """Effectuer la traduction avec le service approprié"""
    
    # Simulation - en réalité, utiliser Google Translate, DeepL, ou modèles Hugging Face
    await asyncio.sleep(0.1)  # Simuler le délai réseau
    
    # Traductions de base pour simulation
    sample_translations = {
        ("fr", "en"): {
            "Bonjour": "Hello",
            "Comment allez-vous ?": "How are you?",
            "mathématiques": "mathematics",
            "sciences": "sciences"
        },
        ("en", "fr"): {
            "Hello": "Bonjour",
            "How are you?": "Comment allez-vous ?",
            "mathematics": "mathématiques",
            "sciences": "sciences"
        },
        ("fr", "wo"): {  # Français vers Wolof
            "Bonjour": "Asalaa malekum",
            "Comment allez-vous ?": "Nanga def ?",
            "mathématiques": "xayma",
            "sciences": "saayans"
        }
    }
    
    # Rechercher une traduction existante
    lang_pair = (source_lang, target_lang)
    if lang_pair in sample_translations and text in sample_translations[lang_pair]:
        translated = sample_translations[lang_pair][text]
        confidence = 0.95
    else:
        # Simulation d'une traduction générique
        translated = f"[{target_lang.upper()}] {text}"
        confidence = 0.75
    
    return {
        "translated_text": translated,
        "confidence": confidence,
        "alternatives": [f"Alt: {translated}"] if confidence < 0.9 else []
    }

async def perform_language_detection(text: str) -> Dict[str, Any]:
    """Détecter la langue d'un texte"""
    
    # Simulation - en réalité, utiliser langdetect ou Google Translate API
    await asyncio.sleep(0.05)
    
    # Détection basique par mots-clés
    language_keywords = {
        "fr": ["le", "la", "les", "de", "du", "et", "est", "que", "comment", "bonjour"],
        "en": ["the", "and", "is", "to", "of", "in", "you", "hello", "how", "what"],
        "es": ["el", "la", "los", "de", "del", "y", "es", "que", "como", "hola"],
        "wo": ["li", "ci", "ak", "def", "nit", "asalaa", "nanga", "lu"],
        "sw": ["na", "ya", "wa", "ni", "hii", "jambo", "habari", "nzuri"]
    }
    
    text_lower = text.lower()
    scores = {}
    
    for lang, keywords in language_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            scores[lang] = score / len(keywords)
    
    if scores:
        detected_lang = max(scores, key=scores.get)
        confidence = scores[detected_lang]
    else:
        detected_lang = "en"  # Par défaut
        confidence = 0.3
    
    # Alternatives
    alternatives = [
        {"language": lang, "confidence": score}
        for lang, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    ]
    
    return {
        "language": detected_lang,
        "confidence": confidence,
        "alternatives": alternatives
    }

async def perform_educational_translation(
    text: str,
    source_lang: str,
    target_lang: str,
    subject: str,
    grade_level: str
) -> Dict[str, Any]:
    """Traduction spécialisée pour contenu éducatif"""
    
    # Simulation d'une traduction avec préservation des termes éducatifs
    await asyncio.sleep(0.2)
    
    # Termes éducatifs à préserver
    educational_terms = {
        "mathematics": ["équation", "théorème", "algorithme", "fonction"],
        "science": ["hypothèse", "expérience", "molécule", "cellule"],
        "history": ["civilisation", "empire", "révolution", "dynastie"],
        "literature": ["métaphore", "allégorie", "narrateur", "protagoniste"]
    }
    
    # Effectuer la traduction de base
    base_translation = await perform_translation(text, source_lang, target_lang, "educational")
    
    # Identifier les termes préservés
    terms_in_text = []
    if subject in educational_terms:
        terms_in_text = [
            term for term in educational_terms[subject]
            if term.lower() in text.lower()
        ]
    
    # Notes culturelles pour adaptation
    cultural_notes = []
    if target_lang in ["wo", "sw", "ha"]:  # Langues africaines
        cultural_notes.append("Adaptation au contexte africain effectuée")
    
    return {
        "translated_text": base_translation["translated_text"],
        "confidence": base_translation["confidence"],
        "terms_preserved": terms_in_text,
        "cultural_notes": cultural_notes
    }

def get_language_info(language_code: str) -> Optional[Dict[str, Any]]:
    """Obtenir les informations détaillées d'une langue"""
    
    # Base de données des langues (simulation)
    language_database = {
        "fr": {
            "code": "fr",
            "name": "Français",
            "native_name": "Français",
            "region": "Europe",
            "speakers": "280 millions",
            "countries": ["France", "Canada", "Sénégal", "Côte d'Ivoire"],
            "writing_system": "Latin",
            "rtl": False
        },
        "en": {
            "code": "en",
            "name": "Anglais",
            "native_name": "English",
            "region": "Global",
            "speakers": "1.5 milliard",
            "countries": ["États-Unis", "Royaume-Uni", "Canada", "Australie"],
            "writing_system": "Latin",
            "rtl": False
        },
        "wo": {
            "code": "wo",
            "name": "Wolof",
            "native_name": "Wolof",
            "region": "Afrique de l'Ouest",
            "speakers": "5.2 millions",
            "countries": ["Sénégal", "Gambie", "Mauritanie"],
            "writing_system": "Latin",
            "rtl": False
        },
        "sw": {
            "code": "sw",
            "name": "Swahili",
            "native_name": "Kiswahili",
            "region": "Afrique de l'Est",
            "speakers": "200 millions",
            "countries": ["Tanzanie", "Kenya", "Ouganda", "RDC"],
            "writing_system": "Latin",
            "rtl": False
        },
        "ha": {
            "code": "ha",
            "name": "Hausa",
            "native_name": "Harshen Hausa",
            "region": "Afrique de l'Ouest",
            "speakers": "70 millions",
            "countries": ["Nigeria", "Niger", "Ghana", "Cameroun"],
            "writing_system": "Latin/Arabe",
            "rtl": False
        }
    }
    
    return language_database.get(language_code)

async def generate_pronunciation(text: str, language: str) -> Optional[str]:
    """Générer la prononciation pour les langues avec scripts différents"""
    
    # Simulation - en réalité, utiliser des services de romanisation
    await asyncio.sleep(0.1)
    
    pronunciation_maps = {
        "zh": "Nǐ hǎo",  # Pinyin pour chinois
        "ja": "Konnichiwa",  # Romaji pour japonais
        "ar": "Ahlan wa sahlan",  # Romanisation pour arabe
        "hi": "Namaste"  # Romanisation pour hindi
    }
    
    return pronunciation_maps.get(language)

logger.info("🌐 Module de traduction EduAI Enhanced initialisé")
