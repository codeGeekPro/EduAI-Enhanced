"""
📊 Système de métriques et monitoring pour EduAI Enhanced
Collecte et analyse des performances en temps réel
"""

import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import json
import logging

logger = logging.getLogger(__name__)

@dataclass
class Metric:
    """Structure d'une métrique"""
    service: str
    operation: str
    duration: float
    timestamp: datetime
    success: bool
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

@dataclass
class PerformanceStats:
    """Statistiques de performance agrégées"""
    service: str
    operation: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_duration: float
    min_duration: float
    max_duration: float
    p95_duration: float
    error_rate: float
    requests_per_minute: float

class MetricsCollector:
    """Collecteur de métriques centralisé"""
    
    def __init__(self, max_metrics: int = 10000):
        self.metrics: deque = deque(maxlen=max_metrics)
        self.real_time_stats = defaultdict(lambda: defaultdict(list))
        self.alerts_thresholds = {
            'error_rate': 0.05,  # 5%
            'response_time_p95': 2000,  # 2 secondes
            'requests_per_minute': 1000  # 1000 req/min
        }
        self.alert_callbacks = []
    
    def record_metric(self, metric: Metric):
        """Enregistrer une nouvelle métrique"""
        self.metrics.append(metric)
        
        # Mise à jour des stats temps réel
        key = f"{metric.service}:{metric.operation}"
        self.real_time_stats[key]['durations'].append(metric.duration)
        self.real_time_stats[key]['successes'].append(metric.success)
        self.real_time_stats[key]['timestamps'].append(metric.timestamp)
        
        # Nettoyer les anciennes données (dernière heure)
        cutoff = datetime.utcnow() - timedelta(hours=1)
        self.real_time_stats[key]['durations'] = [
            d for d, t in zip(
                self.real_time_stats[key]['durations'],
                self.real_time_stats[key]['timestamps']
            ) if t > cutoff
        ]
        self.real_time_stats[key]['successes'] = [
            s for s, t in zip(
                self.real_time_stats[key]['successes'],
                self.real_time_stats[key]['timestamps']
            ) if t > cutoff
        ]
        self.real_time_stats[key]['timestamps'] = [
            t for t in self.real_time_stats[key]['timestamps'] if t > cutoff
        ]
        
        # Vérifier les alertes
        asyncio.create_task(self._check_alerts(key))
    
    def get_stats(self, service: str, operation: str, 
                 time_window: timedelta = timedelta(hours=1)) -> PerformanceStats:
        """Obtenir les statistiques pour un service/opération"""
        
        cutoff = datetime.utcnow() - time_window
        relevant_metrics = [
            m for m in self.metrics 
            if m.service == service and m.operation == operation and m.timestamp > cutoff
        ]
        
        if not relevant_metrics:
            return PerformanceStats(
                service=service,
                operation=operation,
                total_requests=0,
                successful_requests=0,
                failed_requests=0,
                average_duration=0,
                min_duration=0,
                max_duration=0,
                p95_duration=0,
                error_rate=0,
                requests_per_minute=0
            )
        
        durations = [m.duration for m in relevant_metrics]
        successes = [m.success for m in relevant_metrics]
        
        # Calculs statistiques
        total_requests = len(relevant_metrics)
        successful_requests = sum(successes)
        failed_requests = total_requests - successful_requests
        average_duration = sum(durations) / len(durations)
        min_duration = min(durations)
        max_duration = max(durations)
        
        # Percentile 95
        sorted_durations = sorted(durations)
        p95_index = int(0.95 * len(sorted_durations))
        p95_duration = sorted_durations[p95_index] if sorted_durations else 0
        
        error_rate = failed_requests / total_requests if total_requests > 0 else 0
        
        # Requêtes par minute
        time_span_minutes = time_window.total_seconds() / 60
        requests_per_minute = total_requests / time_span_minutes if time_span_minutes > 0 else 0
        
        return PerformanceStats(
            service=service,
            operation=operation,
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            average_duration=average_duration,
            min_duration=min_duration,
            max_duration=max_duration,
            p95_duration=p95_duration,
            error_rate=error_rate,
            requests_per_minute=requests_per_minute
        )
    
    def get_all_services_stats(self) -> Dict[str, Dict[str, PerformanceStats]]:
        """Obtenir les stats pour tous les services"""
        services_operations = set()
        for metric in self.metrics:
            services_operations.add((metric.service, metric.operation))
        
        stats = {}
        for service, operation in services_operations:
            if service not in stats:
                stats[service] = {}
            stats[service][operation] = self.get_stats(service, operation)
        
        return stats
    
    def get_system_health(self) -> Dict[str, Any]:
        """Obtenir l'état de santé global du système"""
        all_stats = self.get_all_services_stats()
        
        total_requests = 0
        total_errors = 0
        max_response_time = 0
        avg_response_times = []
        
        for service_stats in all_stats.values():
            for stats in service_stats.values():
                total_requests += stats.total_requests
                total_errors += stats.failed_requests
                max_response_time = max(max_response_time, stats.max_duration)
                if stats.average_duration > 0:
                    avg_response_times.append(stats.average_duration)
        
        overall_error_rate = total_errors / total_requests if total_requests > 0 else 0
        overall_avg_response_time = sum(avg_response_times) / len(avg_response_times) if avg_response_times else 0
        
        # Déterminer l'état de santé
        health_status = "healthy"
        if overall_error_rate > 0.10:  # Plus de 10% d'erreurs
            health_status = "critical"
        elif overall_error_rate > 0.05 or overall_avg_response_time > 1000:  # Plus de 5% d'erreurs ou 1s de réponse
            health_status = "warning"
        
        return {
            "status": health_status,
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "total_requests": total_requests,
                "error_rate": overall_error_rate,
                "average_response_time_ms": overall_avg_response_time,
                "max_response_time_ms": max_response_time
            },
            "services": {
                service: {
                    "operations": len(operations),
                    "health": "healthy" if all(
                        op.error_rate < 0.05 and op.p95_duration < 2000 
                        for op in operations.values()
                    ) else "warning"
                }
                for service, operations in all_stats.items()
            }
        }
    
    async def _check_alerts(self, service_operation_key: str):
        """Vérifier et déclencher les alertes si nécessaire"""
        service, operation = service_operation_key.split(':', 1)
        stats = self.get_stats(service, operation)
        
        alerts = []
        
        # Vérifier le taux d'erreur
        if stats.error_rate > self.alerts_thresholds['error_rate']:
            alerts.append({
                "type": "high_error_rate",
                "service": service,
                "operation": operation,
                "value": stats.error_rate,
                "threshold": self.alerts_thresholds['error_rate'],
                "severity": "critical" if stats.error_rate > 0.15 else "warning"
            })
        
        # Vérifier le temps de réponse P95
        if stats.p95_duration > self.alerts_thresholds['response_time_p95']:
            alerts.append({
                "type": "high_response_time",
                "service": service,
                "operation": operation,
                "value": stats.p95_duration,
                "threshold": self.alerts_thresholds['response_time_p95'],
                "severity": "critical" if stats.p95_duration > 5000 else "warning"
            })
        
        # Vérifier le volume de requêtes
        if stats.requests_per_minute > self.alerts_thresholds['requests_per_minute']:
            alerts.append({
                "type": "high_traffic",
                "service": service,
                "operation": operation,
                "value": stats.requests_per_minute,
                "threshold": self.alerts_thresholds['requests_per_minute'],
                "severity": "warning"
            })
        
        # Déclencher les callbacks d'alerte
        for alert in alerts:
            for callback in self.alert_callbacks:
                try:
                    await callback(alert)
                except Exception as e:
                    logger.error(f"Error in alert callback: {e}")
    
    def add_alert_callback(self, callback):
        """Ajouter un callback pour les alertes"""
        self.alert_callbacks.append(callback)
    
    def export_metrics(self, format: str = "json") -> str:
        """Exporter les métriques dans différents formats"""
        if format == "json":
            metrics_data = [asdict(metric) for metric in self.metrics]
            # Convertir les datetime en ISO string
            for metric_data in metrics_data:
                metric_data['timestamp'] = metric_data['timestamp'].isoformat()
            return json.dumps(metrics_data, indent=2)
        
        # Ajouter d'autres formats si nécessaire (CSV, Prometheus, etc.)
        raise ValueError(f"Format non supporté: {format}")

# Décorateur pour mesurer automatiquement les performances
def measure_performance(service: str, operation: str, collector: MetricsCollector):
    """Décorateur pour mesurer automatiquement les performances d'une fonction"""
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            error = None
            
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error = str(e)
                raise
            finally:
                duration = (time.time() - start_time) * 1000  # En millisecondes
                metric = Metric(
                    service=service,
                    operation=operation,
                    duration=duration,
                    timestamp=datetime.utcnow(),
                    success=success,
                    error=error
                )
                collector.record_metric(metric)
        
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            error = None
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error = str(e)
                raise
            finally:
                duration = (time.time() - start_time) * 1000  # En millisecondes
                metric = Metric(
                    service=service,
                    operation=operation,
                    duration=duration,
                    timestamp=datetime.utcnow(),
                    success=success,
                    error=error
                )
                collector.record_metric(metric)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Instance globale du collecteur de métriques
metrics_collector = MetricsCollector()

# Fonctions utilitaires
def record_api_call(service: str, operation: str, duration: float, success: bool, error: str = None):
    """Enregistrer un appel API"""
    metric = Metric(
        service=service,
        operation=operation,
        duration=duration * 1000,  # Convertir en millisecondes
        timestamp=datetime.utcnow(),
        success=success,
        error=error
    )
    metrics_collector.record_metric(metric)

def get_service_health(service: str) -> Dict[str, Any]:
    """Obtenir l'état de santé d'un service spécifique"""
    all_stats = metrics_collector.get_all_services_stats()
    service_stats = all_stats.get(service, {})
    
    if not service_stats:
        return {"status": "unknown", "operations": 0}
    
    total_requests = sum(stats.total_requests for stats in service_stats.values())
    total_errors = sum(stats.failed_requests for stats in service_stats.values())
    avg_response_times = [stats.average_duration for stats in service_stats.values() if stats.average_duration > 0]
    
    error_rate = total_errors / total_requests if total_requests > 0 else 0
    avg_response_time = sum(avg_response_times) / len(avg_response_times) if avg_response_times else 0
    
    status = "healthy"
    if error_rate > 0.10:
        status = "critical"
    elif error_rate > 0.05 or avg_response_time > 1000:
        status = "warning"
    
    return {
        "status": status,
        "operations": len(service_stats),
        "total_requests": total_requests,
        "error_rate": error_rate,
        "average_response_time": avg_response_time
    }
