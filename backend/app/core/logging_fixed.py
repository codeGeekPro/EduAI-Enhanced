"""
🎓 EduAI Enhanced - Configuration Logging Simplifiée et Fonctionnelle
Système de logs optimisé pour l'application IA éducative
"""

import logging
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, Optional

def setup_logging(log_level: str = "INFO", environment: str = "development"):
    """Configurer le système de logging"""
    
    # Créer le dossier logs s'il n'existe pas
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Formatter pour les logs
    if environment == "production":
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    # Configuration du logger principal
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Handler pour la console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Handler pour le fichier principal
    file_handler = logging.FileHandler(log_dir / "eduai.log")
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Handler pour les erreurs
    error_handler = logging.FileHandler(log_dir / "errors.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    root_logger.addHandler(error_handler)
    
    # Configuration des loggers spécialisés
    setup_specialized_loggers(log_dir, formatter)
    
    logging.info(f"✅ Logging configuré - Niveau: {log_level} - Environnement: {environment}")

def setup_specialized_loggers(log_dir: Path, formatter: logging.Formatter):
    """Configurer des loggers spécialisés pour différents domaines"""
    
    # Logger pour les requêtes API
    api_logger = logging.getLogger("api")
    api_handler = logging.FileHandler(log_dir / "api_requests.log")
    api_handler.setFormatter(formatter)
    api_logger.addHandler(api_handler)
    api_logger.setLevel(logging.INFO)
    
    # Logger pour les événements de sécurité
    security_logger = logging.getLogger("security")
    security_handler = logging.FileHandler(log_dir / "security.log")
    security_handler.setFormatter(formatter)
    security_logger.addHandler(security_handler)
    security_logger.setLevel(logging.WARNING)
    
    # Logger pour les interactions IA
    ai_logger = logging.getLogger("ai")
    ai_handler = logging.FileHandler(log_dir / "ai_interactions.log")
    ai_handler.setFormatter(formatter)
    ai_logger.addHandler(ai_handler)
    ai_logger.setLevel(logging.INFO)
    
    # Logger pour les performances
    perf_logger = logging.getLogger("performance")
    perf_handler = logging.FileHandler(log_dir / "performance.log")
    perf_handler.setFormatter(formatter)
    perf_logger.addHandler(perf_handler)
    perf_logger.setLevel(logging.INFO)
    
    # Logger pour la base de données
    db_logger = logging.getLogger("database")
    db_handler = logging.FileHandler(log_dir / "database.log")
    db_handler.setFormatter(formatter)
    db_logger.addHandler(db_handler)
    db_logger.setLevel(logging.INFO)

# Fonctions utilitaires pour le logging structuré

def log_api_request(method: str, path: str, status_code: int, duration_ms: float, 
                   user_id: Optional[str] = None, ip_address: Optional[str] = None, 
                   user_agent: Optional[str] = None):
    """Logger une requête API avec contexte structuré"""
    logger = logging.getLogger("api")
    
    context = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
        "user_id": user_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    message = f"API {method} {path} -> {status_code} ({duration_ms:.2f}ms)"
    if user_id:
        message += f" [User: {user_id}]"
    if ip_address:
        message += f" [IP: {ip_address}]"
    
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")

def log_security_event(event_type: str, user_id: Optional[str] = None, 
                      ip_address: Optional[str] = None, details: Optional[Dict[str, Any]] = None, 
                      severity: str = "warning"):
    """Logger un événement de sécurité"""
    logger = logging.getLogger("security")
    
    context = {
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": ip_address,
        "details": details or {},
        "severity": severity,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    message = f"SECURITY [{severity.upper()}] {event_type}"
    if user_id:
        message += f" [User: {user_id}]"
    if ip_address:
        message += f" [IP: {ip_address}]"
    
    log_method = getattr(logger, severity.lower(), logger.warning)
    log_method(f"{message} | Context: {json.dumps(context, default=str)}")

def log_ai_interaction(model: str, prompt_length: int, response_length: int, 
                      duration_ms: float, user_id: Optional[str] = None, 
                      success: bool = True, error: Optional[str] = None,
                      tokens_used: Optional[int] = None, cost: Optional[float] = None):
    """Logger une interaction IA"""
    logger = logging.getLogger("ai")
    
    context = {
        "model": model,
        "prompt_length": prompt_length,
        "response_length": response_length,
        "duration_ms": round(duration_ms, 2),
        "user_id": user_id,
        "success": success,
        "error": error,
        "tokens_used": tokens_used,
        "cost": cost,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    status = "SUCCESS" if success else "ERROR"
    message = f"AI {status} [{model}] {prompt_length}→{response_length} chars ({duration_ms:.2f}ms)"
    
    if tokens_used:
        message += f" [{tokens_used} tokens]"
    if cost:
        message += f" [${cost:.4f}]"
    if user_id:
        message += f" [User: {user_id}]"
    if error:
        message += f" [Error: {error[:100]}]"
    
    if success:
        logger.info(f"{message} | Context: {json.dumps(context, default=str)}")
    else:
        logger.error(f"{message} | Context: {json.dumps(context, default=str)}")

def log_performance_metric(service: str, operation: str, duration_ms: float, 
                         success: bool = True, metadata: Optional[Dict[str, Any]] = None,
                         user_id: Optional[str] = None):
    """Logger une métrique de performance"""
    logger = logging.getLogger("performance")
    
    context = {
        "service": service,
        "operation": operation,
        "duration_ms": round(duration_ms, 2),
        "success": success,
        "user_id": user_id,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow().isoformat()
    }
    
    status = "SUCCESS" if success else "ERROR"
    message = f"PERF {status} [{service}] {operation} ({duration_ms:.2f}ms)"
    
    if user_id:
        message += f" [User: {user_id}]"
    
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")

def log_user_action(user_id: str, action: str, resource: Optional[str] = None, 
                   success: bool = True, details: Optional[Dict[str, Any]] = None,
                   ip_address: Optional[str] = None):
    """Logger une action utilisateur"""
    logger = logging.getLogger("user_actions")
    
    context = {
        "user_id": user_id,
        "action": action,
        "resource": resource,
        "success": success,
        "details": details or {},
        "ip_address": ip_address,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    status = "SUCCESS" if success else "ERROR"
    message = f"USER {status} [{user_id}] {action}"
    
    if resource:
        message += f" on {resource}"
    if ip_address:
        message += f" [IP: {ip_address}]"
    
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")

def log_database_operation(operation: str, collection: str, duration_ms: float,
                          records_affected: Optional[int] = None, success: bool = True,
                          error: Optional[str] = None, user_id: Optional[str] = None):
    """Logger une opération de base de données"""
    logger = logging.getLogger("database")
    
    context = {
        "operation": operation,
        "collection": collection,
        "duration_ms": round(duration_ms, 2),
        "records_affected": records_affected,
        "success": success,
        "error": error,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    status = "SUCCESS" if success else "ERROR"
    message = f"DB {status} [{operation}] {collection} ({duration_ms:.2f}ms)"
    
    if records_affected is not None:
        message += f" [{records_affected} records]"
    if user_id:
        message += f" [User: {user_id}]"
    if error:
        message += f" [Error: {error[:100]}]"
    
    if success:
        logger.info(f"{message} | Context: {json.dumps(context, default=str)}")
    else:
        logger.error(f"{message} | Context: {json.dumps(context, default=str)}")

def log_cache_operation(operation: str, key: str, hit: bool = None, duration_ms: float = None,
                       size_bytes: Optional[int] = None):
    """Logger une opération de cache"""
    logger = logging.getLogger("cache")
    
    context = {
        "operation": operation,
        "key": key,
        "hit": hit,
        "duration_ms": round(duration_ms, 2) if duration_ms else None,
        "size_bytes": size_bytes,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    message = f"CACHE [{operation}] {key}"
    
    if hit is not None:
        message += f" -> {'HIT' if hit else 'MISS'}"
    if duration_ms:
        message += f" ({duration_ms:.2f}ms)"
    if size_bytes:
        message += f" [{size_bytes} bytes]"
    
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")

# Décorateur pour logger automatiquement les appels de fonction
def log_function_call(logger_name: Optional[str] = None, log_args: bool = False, 
                     log_result: bool = False, log_duration: bool = True):
    """Décorateur pour logger automatiquement les appels de fonction"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name or func.__module__ or "functions")
            
            start_time = datetime.utcnow()
            
            context = {
                "function": func.__name__,
                "module": func.__module__,
                "start_time": start_time.isoformat()
            }
            
            if log_args and args:
                # Limiter la taille des arguments loggés
                context["args"] = str(args)[:200] + "..." if len(str(args)) > 200 else str(args)
            if log_args and kwargs:
                context["kwargs"] = {k: str(v)[:100] + "..." if len(str(v)) > 100 else str(v) 
                                   for k, v in kwargs.items()}
            
            try:
                result = func(*args, **kwargs)
                
                if log_duration:
                    end_time = datetime.utcnow()
                    duration = (end_time - start_time).total_seconds() * 1000
                    context["duration_ms"] = round(duration, 2)
                    context["end_time"] = end_time.isoformat()
                
                context["success"] = True
                
                if log_result and result is not None:
                    result_str = str(result)
                    context["result_preview"] = result_str[:100] + "..." if len(result_str) > 100 else result_str
                
                message = f"FUNCTION SUCCESS [{func.__name__}]"
                if log_duration:
                    message += f" ({context['duration_ms']:.2f}ms)"
                
                logger.info(f"{message} | Context: {json.dumps(context, default=str)}")
                return result
                
            except Exception as e:
                if log_duration:
                    end_time = datetime.utcnow()
                    duration = (end_time - start_time).total_seconds() * 1000
                    context["duration_ms"] = round(duration, 2)
                    context["end_time"] = end_time.isoformat()
                
                context["success"] = False
                context["error"] = str(e)
                context["error_type"] = type(e).__name__
                
                message = f"FUNCTION ERROR [{func.__name__}] {type(e).__name__}: {str(e)[:100]}"
                if log_duration:
                    message += f" ({context['duration_ms']:.2f}ms)"
                
                logger.error(f"{message} | Context: {json.dumps(context, default=str)}")
                raise
        
        return wrapper
    return decorator

# Classe pour créer des loggers avec contexte
class ContextLogger:
    """Logger avec contexte automatique"""
    
    def __init__(self, logger_name: str, **default_context):
        self.logger = logging.getLogger(logger_name)
        self.default_context = default_context
    
    def _log_with_context(self, level: str, message: str, **extra_context):
        """Logger avec contexte fusionné"""
        context = {**self.default_context, **extra_context}
        context["timestamp"] = datetime.utcnow().isoformat()
        
        full_message = f"{message} | Context: {json.dumps(context, default=str)}"
        getattr(self.logger, level)(full_message)
    
    def info(self, message: str, **context):
        self._log_with_context("info", message, **context)
    
    def warning(self, message: str, **context):
        self._log_with_context("warning", message, **context)
    
    def error(self, message: str, **context):
        self._log_with_context("error", message, **context)
    
    def debug(self, message: str, **context):
        self._log_with_context("debug", message, **context)

# Fonctions utilitaires

def get_logger(name: str) -> logging.Logger:
    """Obtenir un logger standard"""
    return logging.getLogger(name)

def get_context_logger(name: str, **default_context) -> ContextLogger:
    """Obtenir un logger avec contexte automatique"""
    return ContextLogger(name, **default_context)

def log_startup_info(service_name: str, version: str, environment: str, port: int):
    """Logger les informations de démarrage du service"""
    logger = logging.getLogger("startup")
    
    context = {
        "service_name": service_name,
        "version": version,
        "environment": environment,
        "port": port,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    message = f"🚀 STARTUP [{service_name}] v{version} on port {port} [{environment}]"
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")

def log_shutdown_info(service_name: str, uptime_seconds: float):
    """Logger les informations d'arrêt du service"""
    logger = logging.getLogger("shutdown")
    
    context = {
        "service_name": service_name,
        "uptime_seconds": round(uptime_seconds, 2),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    message = f"🛑 SHUTDOWN [{service_name}] after {uptime_seconds:.2f}s"
    logger.info(f"{message} | Context: {json.dumps(context, default=str)}")
