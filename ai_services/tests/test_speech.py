import unittest
import asyncio
from speech.speech_processor import SpeechProcessor

class TestSpeechProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = SpeechProcessor()

    def test_speech_to_text(self):
        audio_data = b""  # Exemple de données audio
        result = asyncio.run(self.processor.speech_to_text(audio_data))
        self.assertIsInstance(result, dict)
        self.assertIn("transcription", result)

    def test_synthesize_speech(self):
        # Vérifie si la méthode existe
        self.assertTrue(hasattr(self.processor, "synthesize_speech"))

if __name__ == "__main__":
    unittest.main()
