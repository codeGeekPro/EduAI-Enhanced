"""
🎓 EduAI Enhanced - Configuration Logging
Système de logs pour l'application IA éducative
"""

import logging
import sys
from pathlib import Path

def setup_logging():
    """Configurer le système de logging"""
    
    # Créer le dossier logs s'il n'existe pas
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configuration du logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_dir / "eduai.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Logger spécifique pour l'application
    logger = logging.getLogger("eduai")
    logger.info("🎓 Système de logging EduAI Enhanced initialisé")
