import unittest
from ai_services.vision.vision_processor import VisionProcessor

class TestVisionProcessor(unittest.TestCase):

    def setUp(self):
        self.processor = VisionProcessor()

    def test_generate_educational_visualization(self):
        # Exemple de données d'entrée
        input_data = {"images": ["image1.jpg", "image2.jpg"], "annotations": ["annotation1", "annotation2"]}
        
        # Appel de la méthode
        result = self.processor.generate_educational_visualization(input_data)
        
        # Vérifications
        self.assertIsNotNone(result)
        self.assertIn("visualization", result)
        self.assertIsInstance(result["visualization"], str)

    def test_multimodal_analysis(self):
        # Exemple de données d'entrée
        input_data = {"text": "Exemple de texte", "image": "image.jpg", "audio": "audio.mp3"}
        
        # Appel de la méthode
        result = self.processor.multimodal_analysis(input_data)
        
        # Vérifications
        self.assertIsNotNone(result)
        self.assertIn("analysis", result)
        self.assertIsInstance(result["analysis"], dict)

if __name__ == "__main__":
    unittest.main()
