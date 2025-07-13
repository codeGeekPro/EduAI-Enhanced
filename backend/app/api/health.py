"""
🎓 EduAI Enhanced - Health Checks Complets
Monitoring de santé pour tous les services et dépendances
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import asyncio
import time
import logging
import psutil
import platform
from enum import Enum

# Configuration des health checks
from backend.app.core.config import settings
from backend.app.core.database import db
from backend.app.core.cache import redis_client

router = APIRouter()
logger = logging.getLogger("health")

class HealthStatus(str, Enum):
    """États de santé possibles"""
    HEALTHY = "healthy"
    DEGRADED = "degraded" 
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

class ServiceHealth(BaseModel):
    """État de santé d'un service"""
    status: HealthStatus
    response_time_ms: float
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    last_checked: datetime
    
class SystemHealth(BaseModel):
    """État de santé du système"""
    status: HealthStatus
    timestamp: datetime
    uptime_seconds: float
    version: str
    environment: str
    services: Dict[str, ServiceHealth]
    system_metrics: Dict[str, Any]

class HealthChecker:
    """Classe principale pour les vérifications de santé"""
    
    def __init__(self):
        self.start_time = datetime.utcnow()
        self.service_checkers = {
            "database": self._check_database,
            "redis": self._check_redis,
            "ai_services": self._check_ai_services,
            "external_apis": self._check_external_apis,
            "disk_space": self._check_disk_space,
            "memory": self._check_memory,
            "cpu": self._check_cpu
        }
    
    async def check_all_services(self) -> SystemHealth:
        """Vérifier tous les services"""
        start_time = time.time()
        
        # Exécuter tous les checks en parallèle
        tasks = {
            name: self._run_check_with_timeout(checker, timeout=10.0)
            for name, checker in self.service_checkers.items()
        }
        
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        
        # Combiner les résultats
        services = {}
        for (name, _), result in zip(tasks.items(), results):
            if isinstance(result, Exception):
                services[name] = ServiceHealth(
                    status=HealthStatus.UNHEALTHY,
                    response_time_ms=0.0,
                    message=f"Check failed: {str(result)}",
                    last_checked=datetime.utcnow()
                )
            else:
                services[name] = result
        
        # Déterminer le statut global
        overall_status = self._calculate_overall_status(services)
        
        # Métriques système
        system_metrics = self._get_system_metrics()
        
        # Temps de fonctionnement
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        return SystemHealth(
            status=overall_status,
            timestamp=datetime.utcnow(),
            uptime_seconds=uptime,
            version=getattr(settings, 'app_version', '1.0.0'),
            environment=getattr(settings, 'environment', 'development'),
            services=services,
            system_metrics=system_metrics
        )
    
    async def _run_check_with_timeout(self, checker, timeout: float) -> ServiceHealth:
        """Exécuter un check avec timeout"""
        try:
            return await asyncio.wait_for(checker(), timeout=timeout)
        except asyncio.TimeoutError:
            return ServiceHealth(
                status=HealthStatus.UNHEALTHY,
                response_time_ms=timeout * 1000,
                message=f"Health check timed out after {timeout}s",
                last_checked=datetime.utcnow()
            )
    
    async def _check_database(self) -> ServiceHealth:
        """Vérifier la santé de MongoDB"""
        start_time = time.time()
        
        try:
            # Test de connexion basique
            await db.command("ping")
            
            # Test d'écriture/lecture
            test_doc = {"test": True, "timestamp": datetime.utcnow()}
            result = await db.health_test.insert_one(test_doc)
            await db.health_test.delete_one({"_id": result.inserted_id})
            
            # Statistiques de la base
            stats = await db.command("dbstats")
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=HealthStatus.HEALTHY,
                response_time_ms=response_time,
                message="Database connection successful",
                details={
                    "collections": stats.get("collections", 0),
                    "data_size_mb": round(stats.get("dataSize", 0) / 1024 / 1024, 2),
                    "index_size_mb": round(stats.get("indexSize", 0) / 1024 / 1024, 2)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.UNHEALTHY,
                response_time_ms=response_time,
                message=f"Database check failed: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    async def _check_redis(self) -> ServiceHealth:
        """Vérifier la santé de Redis"""
        start_time = time.time()
        
        try:
            # Test ping
            pong = await redis_client.ping()
            if not pong:
                raise Exception("Redis ping failed")
            
            # Test set/get
            test_key = "health_check_test"
            test_value = f"test_{int(time.time())}"
            
            await redis_client.set(test_key, test_value, ex=10)
            retrieved_value = await redis_client.get(test_key)
            await redis_client.delete(test_key)
            
            if retrieved_value.decode() != test_value:
                raise Exception("Redis set/get test failed")
            
            # Informations Redis
            info = await redis_client.info()
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=HealthStatus.HEALTHY,
                response_time_ms=response_time,
                message="Redis connection successful",
                details={
                    "version": info.get("redis_version"),
                    "used_memory_mb": round(info.get("used_memory", 0) / 1024 / 1024, 2),
                    "connected_clients": info.get("connected_clients", 0),
                    "total_commands_processed": info.get("total_commands_processed", 0)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.UNHEALTHY,
                response_time_ms=response_time,
                message=f"Redis check failed: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    async def _check_ai_services(self) -> ServiceHealth:
        """Vérifier la santé des services IA"""
        start_time = time.time()
        
        try:
            # Vérifier si le service IA est accessible
            import httpx
            
            ai_service_url = getattr(settings, 'ai_service_url', 'http://localhost:8001')
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{ai_service_url}/health")
                
                if response.status_code != 200:
                    raise Exception(f"AI service returned status {response.status_code}")
                
                ai_health = response.json()
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=HealthStatus.HEALTHY,
                response_time_ms=response_time,
                message="AI services accessible",
                details={
                    "ai_service_status": ai_health.get("status"),
                    "models_loaded": ai_health.get("models_loaded", 0),
                    "gpu_available": ai_health.get("gpu_available", False)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            
            # Service IA non accessible n'est pas critique
            status = HealthStatus.DEGRADED if "Connection" in str(e) else HealthStatus.UNHEALTHY
            
            return ServiceHealth(
                status=status,
                response_time_ms=response_time,
                message=f"AI services check failed: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    async def _check_external_apis(self) -> ServiceHealth:
        """Vérifier la santé des APIs externes"""
        start_time = time.time()
        
        checks = {}
        overall_healthy = True
        
        try:
            import httpx
            
            # Check OpenAI API si configuré
            if hasattr(settings, 'openai_api_key') and settings.openai_api_key:
                try:
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        response = await client.get(
                            "https://api.openai.com/v1/models",
                            headers={"Authorization": f"Bearer {settings.openai_api_key}"}
                        )
                        checks["openai"] = response.status_code == 200
                except:
                    checks["openai"] = False
                    overall_healthy = False
            
            # Check autres APIs critiques
            # Ajouter ici d'autres vérifications d'APIs externes
            
            response_time = (time.time() - start_time) * 1000
            
            status = HealthStatus.HEALTHY if overall_healthy else HealthStatus.DEGRADED
            
            return ServiceHealth(
                status=status,
                response_time_ms=response_time,
                message="External APIs checked",
                details=checks,
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.DEGRADED,
                response_time_ms=response_time,
                message=f"External API checks failed: {str(e)}",
                details=checks,
                last_checked=datetime.utcnow()
            )
    
    async def _check_disk_space(self) -> ServiceHealth:
        """Vérifier l'espace disque"""
        start_time = time.time()
        
        try:
            disk_usage = psutil.disk_usage('/')
            
            total_gb = disk_usage.total / (1024**3)
            used_gb = disk_usage.used / (1024**3)
            free_gb = disk_usage.free / (1024**3)
            usage_percent = (used_gb / total_gb) * 100
            
            # Déterminer le statut basé sur l'usage
            if usage_percent < 80:
                status = HealthStatus.HEALTHY
                message = "Disk space sufficient"
            elif usage_percent < 90:
                status = HealthStatus.DEGRADED
                message = "Disk space getting low"
            else:
                status = HealthStatus.UNHEALTHY
                message = "Disk space critically low"
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "total_gb": round(total_gb, 2),
                    "used_gb": round(used_gb, 2),
                    "free_gb": round(free_gb, 2),
                    "usage_percent": round(usage_percent, 2)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.UNKNOWN,
                response_time_ms=response_time,
                message=f"Could not check disk space: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    async def _check_memory(self) -> ServiceHealth:
        """Vérifier l'utilisation mémoire"""
        start_time = time.time()
        
        try:
            memory = psutil.virtual_memory()
            
            usage_percent = memory.percent
            available_gb = memory.available / (1024**3)
            total_gb = memory.total / (1024**3)
            used_gb = memory.used / (1024**3)
            
            # Déterminer le statut
            if usage_percent < 70:
                status = HealthStatus.HEALTHY
                message = "Memory usage normal"
            elif usage_percent < 85:
                status = HealthStatus.DEGRADED
                message = "Memory usage elevated"
            else:
                status = HealthStatus.UNHEALTHY
                message = "Memory usage critical"
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "total_gb": round(total_gb, 2),
                    "used_gb": round(used_gb, 2),
                    "available_gb": round(available_gb, 2),
                    "usage_percent": round(usage_percent, 2)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.UNKNOWN,
                response_time_ms=response_time,
                message=f"Could not check memory: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    async def _check_cpu(self) -> ServiceHealth:
        """Vérifier l'utilisation CPU"""
        start_time = time.time()
        
        try:
            # Moyenne sur 1 seconde
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            load_avg = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else (0, 0, 0)
            
            # Déterminer le statut
            if cpu_percent < 70:
                status = HealthStatus.HEALTHY
                message = "CPU usage normal"
            elif cpu_percent < 85:
                status = HealthStatus.DEGRADED
                message = "CPU usage elevated"
            else:
                status = HealthStatus.UNHEALTHY
                message = "CPU usage critical"
            
            response_time = (time.time() - start_time) * 1000
            
            return ServiceHealth(
                status=status,
                response_time_ms=response_time,
                message=message,
                details={
                    "usage_percent": round(cpu_percent, 2),
                    "cpu_count": cpu_count,
                    "load_avg_1m": round(load_avg[0], 2),
                    "load_avg_5m": round(load_avg[1], 2),
                    "load_avg_15m": round(load_avg[2], 2)
                },
                last_checked=datetime.utcnow()
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return ServiceHealth(
                status=HealthStatus.UNKNOWN,
                response_time_ms=response_time,
                message=f"Could not check CPU: {str(e)}",
                last_checked=datetime.utcnow()
            )
    
    def _calculate_overall_status(self, services: Dict[str, ServiceHealth]) -> HealthStatus:
        """Calculer le statut global basé sur les services"""
        if not services:
            return HealthStatus.UNKNOWN
        
        statuses = [service.status for service in services.values()]
        
        # Si un service critique est unhealthy
        critical_services = ["database", "redis"]
        for service_name in critical_services:
            if service_name in services and services[service_name].status == HealthStatus.UNHEALTHY:
                return HealthStatus.UNHEALTHY
        
        # Si tous les services sont healthy
        if all(status == HealthStatus.HEALTHY for status in statuses):
            return HealthStatus.HEALTHY
        
        # Si au moins un service est unhealthy
        if any(status == HealthStatus.UNHEALTHY for status in statuses):
            return HealthStatus.UNHEALTHY
        
        # Si au moins un service est degraded
        if any(status == HealthStatus.DEGRADED for status in statuses):
            return HealthStatus.DEGRADED
        
        return HealthStatus.UNKNOWN
    
    def _get_system_metrics(self) -> Dict[str, Any]:
        """Obtenir les métriques système"""
        try:
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "python_version": platform.python_version(),
                "architecture": platform.architecture()[0],
                "hostname": platform.node(),
                "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat(),
                "process_count": len(psutil.pids())
            }
        except Exception as e:
            logger.error(f"Error getting system metrics: {e}")
            return {"error": str(e)}

# Instance globale du health checker
health_checker = HealthChecker()

# Routes FastAPI

@router.get("/health", response_model=SystemHealth)
async def health_check():
    """Point de terminaison de santé principal"""
    try:
        health = await health_checker.check_all_services()
        
        # Logger l'état de santé
        logger.info(f"Health check completed - Status: {health.status}")
        
        # Retourner le code HTTP approprié
        if health.status == HealthStatus.UNHEALTHY:
            raise HTTPException(status_code=503, detail=health)
        elif health.status == HealthStatus.DEGRADED:
            raise HTTPException(status_code=206, detail=health)
        
        return health
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": HealthStatus.UNKNOWN,
                "message": f"Health check failed: {str(e)}",
                "timestamp": datetime.utcnow()
            }
        )

@router.get("/health/quick")
async def quick_health_check():
    """Check rapide de santé (ping seulement)"""
    return {
        "status": HealthStatus.HEALTHY,
        "message": "Service is running",
        "timestamp": datetime.utcnow(),
        "uptime_seconds": (datetime.utcnow() - health_checker.start_time).total_seconds()
    }

@router.get("/health/database")
async def database_health():
    """Check spécifique de la base de données"""
    result = await health_checker._check_database()
    
    if result.status == HealthStatus.UNHEALTHY:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/redis")
async def redis_health():
    """Check spécifique de Redis"""
    result = await health_checker._check_redis()
    
    if result.status == HealthStatus.UNHEALTHY:
        raise HTTPException(status_code=503, detail=result)
    
    return result

@router.get("/health/system")
async def system_health():
    """Métriques système détaillées"""
    disk_check = await health_checker._check_disk_space()
    memory_check = await health_checker._check_memory()
    cpu_check = await health_checker._check_cpu()
    
    return {
        "disk": disk_check,
        "memory": memory_check,
        "cpu": cpu_check,
        "system_info": health_checker._get_system_metrics()
    }
