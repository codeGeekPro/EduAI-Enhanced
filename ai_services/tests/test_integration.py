import sys
import os
import pytest
import asyncio

# Add the parent directory of ai_services to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

class TestIntegration:
    @pytest.mark.asyncio
    async def test_multimodal_analysis_integration(self, integration_setup):
        nlp = integration_setup["nlp"]
        emotion = integration_setup["emotion"]

        if not nlp or not emotion:
            pytest.skip("Required modules for NLP or EmotionAnalyzer are not available.")

        text = "Bonjour, comment allez-vous ?"
        nlp_result = await nlp.process_text(text) if nlp else None
        emotion_result = await emotion.analyze_emotion(text) if emotion else None

        assert nlp_result is not None
        assert emotion_result is not None
        assert "sentiment" in emotion_result

    @pytest.mark.asyncio
    async def test_speech_to_text_integration(self, integration_setup):
        speech = integration_setup["speech"]
        nlp = integration_setup["nlp"]

        if not speech or not nlp:
            pytest.skip("Required modules for SpeechProcessor or NLP are not available.")

        audio_data = b"fake_audio_data"
        text_result = await speech.speech_to_text(audio_data) if speech else None

        if text_result:
            nlp_result = await nlp.process_text(text_result) if nlp else None
            assert nlp_result is not None

    def test_vision_text_integration(self, integration_setup):
        vision = integration_setup["vision"]

        if not vision:
            pytest.skip("VisionProcessor module is not available.")

        image_data = {"image": "test_image.jpg"}
        text_data = "Description de l'image"

        result = vision.multimodal_analysis({
            "image": image_data,
            "text": text_data
        })

        assert result is not None
        assert "analysis" in result

@pytest.fixture
def integration_setup():
    try:
        from ai_services.nlp.text_processor import TextProcessor
    except ModuleNotFoundError:
        TextProcessor = None
    try:
        from ai_services.emotion.emotion_analyzer import EmotionAnalyzer
    except ModuleNotFoundError:
        EmotionAnalyzer = None
    try:
        from ai_services.speech.speech_processor import SpeechProcessor
    except ModuleNotFoundError:
        SpeechProcessor = None
    try:
        from ai_services.vision.vision_processor import VisionProcessor
    except ModuleNotFoundError:
        VisionProcessor = None

    return {
        "nlp": TextProcessor() if TextProcessor else None,
        "emotion": EmotionAnalyzer() if EmotionAnalyzer else None,
        "speech": SpeechProcessor() if SpeechProcessor else None,
        "vision": VisionProcessor() if VisionProcessor else None
    }

if __name__ == "__main__":
    pytest.main([__file__])
