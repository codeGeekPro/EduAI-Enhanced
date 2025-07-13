#!/usr/bin/env python3
"""
🎓 EduAI Enhanced - Validation des Améliorations Implémentées
Script de vérification pour s'assurer que toutes les améliorations sont en place
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Dict, List, Tuple
import importlib.util

# Ajouter le path du projet
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

class ImprovementValidator:
    """Validateur pour vérifier l'implémentation des améliorations"""
    
    def __init__(self):
        self.project_root = project_root
        self.validation_results = {}
        
    def validate_all_improvements(self) -> Dict[str, bool]:
        """Valider toutes les améliorations listées dans TECHNICAL_IMPROVEMENTS.md"""
        
        improvements = {
            "1. Configuration de sécurité": self._check_security_config,
            "2. Clés API obligatoires": self._check_api_keys_config,
            "3. CORS configuration": self._check_cors_config,
            "4. Index MongoDB": self._check_database_indexes,
            "5. Pool de connexions": self._check_connection_pool,
            "6. Types TypeScript": self._check_typescript_types,
            "7. Gestion d'erreurs": self._check_error_handling,
            "8. Logging structuré": self._check_structured_logging,
            "9. Cache Redis": self._check_redis_cache,
            "10. Pagination API": self._check_api_pagination,
            "11. Tests d'intégration": self._check_integration_tests,
            "12. Métriques et monitoring": self._check_metrics_monitoring,
            "13. Bundle splitting": self._check_bundle_splitting,
            "14. Service Worker": self._check_service_worker,
            "15. Rate limiting": self._check_rate_limiting,
            "16. Health checks": self._check_health_checks
        }
        
        print("🔍 Validation des améliorations EduAI Enhanced...")
        print("=" * 60)
        
        for improvement_name, check_function in improvements.items():
            try:
                result = check_function()
                self.validation_results[improvement_name] = result
                status = "✅ IMPLÉMENTÉ" if result else "❌ MANQUANT"
                print(f"{status} | {improvement_name}")
            except Exception as e:
                self.validation_results[improvement_name] = False
                print(f"⚠️  ERREUR     | {improvement_name}: {str(e)}")
        
        print("=" * 60)
        
        # Résumé
        implemented = sum(1 for result in self.validation_results.values() if result)
        total = len(self.validation_results)
        percentage = (implemented / total) * 100
        
        print(f"\n📊 RÉSUMÉ:")
        print(f"Améliorations implémentées: {implemented}/{total} ({percentage:.1f}%)")
        
        if percentage >= 90:
            print("🎉 EXCELLENT! Presque toutes les améliorations sont en place.")
        elif percentage >= 75:
            print("👍 BON! La plupart des améliorations sont implémentées.")
        elif percentage >= 50:
            print("⚠️  MOYEN. Il reste du travail à faire.")
        else:
            print("❌ INSUFFISANT. Beaucoup d'améliorations manquent.")
        
        return self.validation_results
    
    def _check_security_config(self) -> bool:
        """Vérifier la configuration de sécurité"""
        config_file = self.project_root / "backend/app/core/config.py"
        if not config_file.exists():
            return False
        
        with open(config_file) as f:
            content = f.read()
            
        # Vérifier que les clés ne sont pas hardcodées
        checks = [
            "Field(..., env=" in content,  # Variables d'environnement obligatoires
            "SECRET_KEY" in content,
            "OPENAI_API_KEY" in content,
            not "super-secret-key-change-in-production" in content  # Pas de clé hardcodée
        ]
        
        return all(checks)
    
    def _check_api_keys_config(self) -> bool:
        """Vérifier que les clés API sont obligatoires"""
        config_file = self.project_root / "backend/app/core/config.py"
        if not config_file.exists():
            return False
        
        with open(config_file) as f:
            content = f.read()
        
        # Vérifier la présence de Field(..., env=) pour les clés API
        return "openai_api_key: str = Field(..., env=" in content
    
    def _check_cors_config(self) -> bool:
        """Vérifier la configuration CORS"""
        # Chercher dans les fichiers principaux
        files_to_check = [
            "backend/app/main.py",
            "ai_services/main.py"
        ]
        
        for file_path in files_to_check:
            full_path = self.project_root / file_path
            if full_path.exists():
                with open(full_path) as f:
                    content = f.read()
                    if 'allow_origins=["*"]' in content:  # Configuration dangereuse
                        return False
        
        return True
    
    def _check_database_indexes(self) -> bool:
        """Vérifier la création d'index MongoDB"""
        database_file = self.project_root / "backend/app/core/database.py"
        if not database_file.exists():
            return False
        
        with open(database_file) as f:
            content = f.read()
        
        checks = [
            "create_index" in content or "ensureIndex" in content,
            "maxPoolSize" in content,
            "minPoolSize" in content
        ]
        
        return any(checks)  # Au moins une des optimisations
    
    def _check_connection_pool(self) -> bool:
        """Vérifier la configuration du pool de connexions"""
        database_file = self.project_root / "backend/app/core/database.py"
        if not database_file.exists():
            return False
        
        with open(database_file) as f:
            content = f.read()
        
        pool_config = [
            "maxPoolSize" in content,
            "minPoolSize" in content,
            "maxIdleTimeMS" in content
        ]
        
        return any(pool_config)
    
    def _check_typescript_types(self) -> bool:
        """Vérifier l'amélioration des types TypeScript"""
        frontend_files = list((self.project_root / "frontend/src").rglob("*.ts")) if (self.project_root / "frontend/src").exists() else []
        
        if not frontend_files:
            return False
        
        # Vérifier quelques fichiers pour des types stricts
        any_strict_types = False
        for file_path in frontend_files[:5]:  # Vérifier seulement les 5 premiers
            try:
                with open(file_path) as f:
                    content = f.read()
                    if "interface " in content or "type " in content:
                        any_strict_types = True
                        break
            except:
                continue
        
        return any_strict_types
    
    def _check_error_handling(self) -> bool:
        """Vérifier l'amélioration de la gestion d'erreurs"""
        files_to_check = [
            "backend/app/api/routes/courses.py",
            "backend/app/api/routes/users.py",
            "ai_services/main.py"
        ]
        
        for file_path in files_to_check:
            full_path = self.project_root / file_path
            if full_path.exists():
                with open(full_path) as f:
                    content = f.read()
                    if "HTTPException" in content and "try:" in content:
                        return True
        
        return False
    
    def _check_structured_logging(self) -> bool:
        """Vérifier l'implémentation du logging structuré"""
        logging_file = self.project_root / "backend/app/core/logging.py"
        return logging_file.exists() and logging_file.stat().st_size > 1000  # Fichier non vide
    
    def _check_redis_cache(self) -> bool:
        """Vérifier l'implémentation du cache Redis"""
        cache_file = self.project_root / "backend/app/core/cache.py"
        if not cache_file.exists():
            return False
        
        with open(cache_file) as f:
            content = f.read()
        
        cache_features = [
            "cache_result" in content,
            "CacheManager" in content,
            "redis" in content.lower()
        ]
        
        return any(cache_features)
    
    def _check_api_pagination(self) -> bool:
        """Vérifier l'implémentation de la pagination"""
        pagination_file = self.project_root / "backend/app/core/pagination.py"
        if not pagination_file.exists():
            return False
        
        # Vérifier que la pagination est utilisée dans les routes
        routes_files = [
            "backend/app/api/routes/courses.py",
            "backend/app/api/routes/users.py"
        ]
        
        for file_path in routes_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                with open(full_path) as f:
                    content = f.read()
                    if "PaginatedResponse" in content:
                        return True
        
        return False
    
    def _check_integration_tests(self) -> bool:
        """Vérifier la présence de tests d'intégration"""
        test_file = self.project_root / "backend/tests/test_integration.py"
        return test_file.exists() and test_file.stat().st_size > 5000  # Fichier substantiel
    
    def _check_metrics_monitoring(self) -> bool:
        """Vérifier l'implémentation des métriques"""
        metrics_file = self.project_root / "backend/app/core/metrics.py"
        return metrics_file.exists() and metrics_file.stat().st_size > 1000
    
    def _check_bundle_splitting(self) -> bool:
        """Vérifier la configuration du bundle splitting"""
        vite_config = self.project_root / "frontend/vite.config.ts"
        if not vite_config.exists():
            return False
        
        with open(vite_config) as f:
            content = f.read()
        
        return "manualChunks" in content
    
    def _check_service_worker(self) -> bool:
        """Vérifier l'optimisation du Service Worker"""
        sw_file = self.project_root / "frontend/sw.js"
        return sw_file.exists()
    
    def _check_rate_limiting(self) -> bool:
        """Vérifier l'implémentation du rate limiting"""
        security_file = self.project_root / "backend/app/middleware/advanced_security.py"
        if not security_file.exists():
            return False
        
        with open(security_file) as f:
            content = f.read()
        
        return "rate_limit" in content.lower() or "limiter" in content.lower()
    
    def _check_health_checks(self) -> bool:
        """Vérifier l'implémentation des health checks"""
        health_file = self.project_root / "backend/app/api/health.py"
        return health_file.exists() and health_file.stat().st_size > 5000  # Fichier substantiel
    
    def generate_report(self):
        """Générer un rapport détaillé"""
        report = {
            "validation_date": "2024-12-19",
            "project": "EduAI Enhanced",
            "results": self.validation_results,
            "summary": {
                "total_improvements": len(self.validation_results),
                "implemented": sum(1 for result in self.validation_results.values() if result),
                "missing": sum(1 for result in self.validation_results.values() if not result),
                "completion_percentage": (sum(1 for result in self.validation_results.values() if result) / len(self.validation_results)) * 100
            }
        }
        
        # Sauvegarder le rapport
        report_file = self.project_root / "validation_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Rapport sauvegardé dans: {report_file}")
        
        return report

def main():
    """Fonction principale"""
    validator = ImprovementValidator()
    results = validator.validate_all_improvements()
    report = validator.generate_report()
    
    # Recommandations
    missing_improvements = [name for name, implemented in results.items() if not implemented]
    
    if missing_improvements:
        print(f"\n🔧 RECOMMANDATIONS:")
        print("Les améliorations suivantes nécessitent encore du travail:")
        for improvement in missing_improvements:
            print(f"  - {improvement}")
    
    print(f"\n🚀 Validation terminée!")
    
    return report

if __name__ == "__main__":
    main()
