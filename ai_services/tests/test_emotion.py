import unittest
import asyncio
from emotion.emotion_analyzer import EmotionAnalyzer

class TestEmotionAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = EmotionAnalyzer()

    def test_analyze_text_emotion(self):
        text = "Je suis très heureux aujourd'hui."
        result = asyncio.run(self.analyzer.analyze_text_emotion(text))
        self.assertIsInstance(result, dict)
        self.assertIn("emotions", result)

    def test_analyze_speech_emotion(self):
        audio_data = b""  # Exemple de données audio
        result = asyncio.run(self.analyzer.analyze_speech_emotion(audio_data))
        self.assertIsInstance(result, dict)
        self.assertIn("error", result)  # Vérifie si le modèle est disponible

if __name__ == "__main__":
    unittest.main()
