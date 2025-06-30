# Initialize ai_services as a Python package

from .nlp import NLPProcessor, OpenRouterClient
from .emotion import EmotionAnalyzer, emotion_analyzer
from .speech import SpeechProcessor, speech_processor
from .vision import VisionProcessor, vision_processor

__all__ = [
    'NLPProcessor', 'OpenRouterClient',
    'EmotionAnalyzer', 'emotion_analyzer',
    'SpeechProcessor', 'speech_processor', 
    'VisionProcessor', 'vision_processor'
]
