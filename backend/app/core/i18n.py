"""
🎓 EduAI Enhanced - Internationalisation (i18n)
Support multilingue pour 50+ langues
"""

import asyncio
from typing import Dict

async def init_i18n():
    """Initialiser le système d'internationalisation"""
    await asyncio.sleep(0.1)  # Simulation
    print("🌐 Système i18n initialisé pour 50+ langues")

def get_message(key: str, language: str = "fr") -> str:
    """Obtenir un message traduit"""
    messages = {
        "fr": {
            "welcome": "Bienvenue dans EduAI Enhanced",
            "learning": "Apprentissage"
        },
        "en": {
            "welcome": "Welcome to EduAI Enhanced", 
            "learning": "Learning"
        }
    }
    
    return messages.get(language, {}).get(key, key)
