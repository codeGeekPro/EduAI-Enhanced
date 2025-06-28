import sys
import os

# Add the parent directory of ai_services to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import unittest
from ai_services.nlp.text_processor import NLPProcessor as TextProcessor

class TestTextProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = TextProcessor()

    def test_analyze_complexity(self):
        text = "Ceci est une phrase complexe."
        result = self.processor.analyze_complexity(text)
        self.assertIsInstance(result, dict)
        self.assertIn("complexity_score", result)

    def test_generate_content(self):
        prompt = "Expliquez la gravité."
        result = self.processor.generate_content(prompt)
        self.assertIsInstance(result, str)

if __name__ == "__main__":
    unittest.main()
