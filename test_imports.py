#!/usr/bin/env python3
"""
Script de test pour vérifier que tous les imports fonctionnent correctement
"""

def test_imports():
    """Test tous les imports critiques"""
    try:
        # Test cache
        from backend.app.core.cache import CacheManager
        print("✅ Cache système: OK")
        
        # Test configuration
        from backend.app.core.config import get_settings
        settings = get_settings()
        print(f"✅ Configuration: OK (env: {settings.environment})")
        print(f"   CORS Origins: {settings.cors_origins}")
        print(f"   Trusted Hosts: {settings.trusted_hosts}")
        
        # Test pagination
        from backend.app.core.pagination import PaginationParams
        print("✅ Système de pagination: OK")
        
        # Test logging
        from backend.app.core.logging import get_logger
        print("✅ Système de logging: OK")
        
        # Test metrics
        from backend.app.core.metrics import MetricsCollector
        print("✅ Système de métriques: OK")
        
        # Test security
        from backend.app.middleware.advanced_security import AdvancedSecurityMiddleware
        print("✅ Middleware de sécurité: OK")
        
        # Test health
        from backend.app.api.health import health_router
        print("✅ Health checks: OK")
        
        print("\n🎉 TOUS LES IMPORTS SONT FONCTIONNELS!")
        print("✅ La correction de la configuration CORS a résolu le problème.")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")
        return False

if __name__ == "__main__":
    test_imports()
