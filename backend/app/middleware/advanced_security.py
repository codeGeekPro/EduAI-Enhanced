"""
🔒 Middleware de sécurité avancé avec rate limiting
Protection contre les attaques courantes et limitation de débit
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import hashlib
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

class AdvancedSecurityMiddleware(BaseHTTPMiddleware):
    """Middleware de sécurité avancé"""
    
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self.redis_client = redis_client
        self.request_counts = defaultdict(list)  # Fallback si pas de Redis
        self.blocked_ips = set()
        
        # Configuration rate limiting par endpoint
        self.rate_limits = {
            '/api/auth/login': {'limit': 5, 'window': 300},  # 5 tentatives / 5 min
            '/api/auth/register': {'limit': 3, 'window': 3600},  # 3 comptes / heure
            '/api/ai-tutor/chat': {'limit': 20, 'window': 60},  # 20 requêtes / minute
            '/api/courses': {'limit': 100, 'window': 60},  # 100 requêtes / minute
            'default': {'limit': 60, 'window': 60}  # 60 requêtes / minute par défaut
        }
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = self.get_client_ip(request)
        
        # 1. Vérifier si l'IP est bloquée
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"error": "IP temporairement bloquée"}
            )
        
        # 2. Rate limiting
        if not await self.check_rate_limit(client_ip, request.url.path):
            logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Trop de requêtes",
                    "retry_after": 60
                }
            )
        
        # 3. Vérifications de sécurité
        security_check = await self.security_checks(request)
        if security_check:
            return security_check
        
        # 4. Traiter la requête
        try:
            response = await call_next(request)
            
            # 5. Ajouter headers de sécurité
            self.add_security_headers(response)
            
            # 6. Logger la requête
            await self.log_request(request, response, time.time() - start_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return JSONResponse(
                status_code=500,
                content={"error": "Erreur interne du serveur"}
            )
    
    def get_client_ip(self, request: Request) -> str:
        """Obtenir l'IP du client en tenant compte des proxies"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def check_rate_limit(self, client_ip: str, path: str) -> bool:
        """Vérifier le rate limiting pour une IP et un endpoint"""
        
        # Déterminer la limite pour cet endpoint
        limit_config = self.rate_limits.get(path, self.rate_limits['default'])
        limit = limit_config['limit']
        window = limit_config['window']
        
        current_time = time.time()
        window_start = current_time - window
        
        if self.redis_client:
            # Utiliser Redis pour le rate limiting distribué
            key = f"rate_limit:{client_ip}:{path}"
            pipe = self.redis_client.pipeline()
            
            # Supprimer les anciennes entrées
            pipe.zremrangebyscore(key, 0, window_start)
            # Ajouter la requête actuelle
            pipe.zadd(key, {str(current_time): current_time})
            # Compter les requêtes dans la fenêtre
            pipe.zcard(key)
            # Définir l'expiration
            pipe.expire(key, window)
            
            results = await pipe.execute()
            request_count = results[2]
            
        else:
            # Fallback en mémoire
            requests = self.request_counts[f"{client_ip}:{path}"]
            # Nettoyer les anciennes requêtes
            requests[:] = [req_time for req_time in requests if req_time > window_start]
            # Ajouter la nouvelle requête
            requests.append(current_time)
            request_count = len(requests)
        
        return request_count <= limit
    
    async def security_checks(self, request: Request):
        """Effectuer diverses vérifications de sécurité"""
        
        # 1. Vérifier la taille de la requête
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10_000_000:  # 10MB
            return JSONResponse(
                status_code=413,
                content={"error": "Requête trop volumineuse"}
            )
        
        # 2. Vérifier les headers suspects
        user_agent = request.headers.get("user-agent", "")
        if not user_agent or len(user_agent) < 10:
            logger.warning(f"Suspicious request with empty/short user-agent from {self.get_client_ip(request)}")
        
        # 3. Détecter les tentatives d'injection SQL/NoSQL
        suspicious_patterns = [
            'union select', 'drop table', '$where', '$ne', '$gt', '$regex',
            '<script', 'javascript:', 'onload=', 'onerror='
        ]
        
        query_params = str(request.query_params).lower()
        for pattern in suspicious_patterns:
            if pattern in query_params:
                logger.warning(f"Suspicious pattern '{pattern}' detected from {self.get_client_ip(request)}")
                return JSONResponse(
                    status_code=400,
                    content={"error": "Requête invalide"}
                )
        
        # 4. Vérifier les tentatives de path traversal
        if '../' in str(request.url) or '..\\' in str(request.url):
            logger.warning(f"Path traversal attempt from {self.get_client_ip(request)}")
            return JSONResponse(
                status_code=400,
                content={"error": "Chemin invalide"}
            )
        
        return None
    
    def add_security_headers(self, response):
        """Ajouter les headers de sécurité essentiels"""
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        })
    
    async def log_request(self, request: Request, response, duration: float):
        """Logger les détails de la requête pour monitoring"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "method": request.method,
            "path": str(request.url.path),
            "ip": self.get_client_ip(request),
            "user_agent": request.headers.get("user-agent", ""),
            "status_code": getattr(response, 'status_code', 0),
            "duration_ms": round(duration * 1000, 2),
            "content_length": response.headers.get("content-length", 0)
        }
        
        # Logger selon le niveau approprié
        if response.status_code >= 500:
            logger.error(f"Server error: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Client error: {log_data}")
        else:
            logger.info(f"Request: {log_data}")


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware simplifié de rate limiting pour usage facile"""
    
    def __init__(self, app, calls: int = 60, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Nettoyer les anciennes entrées
        if client_ip in self.clients:
            self.clients[client_ip] = [
                req_time for req_time in self.clients[client_ip]
                if current_time - req_time < self.period
            ]
        else:
            self.clients[client_ip] = []
        
        # Vérifier la limite
        if len(self.clients[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Trop de requêtes",
                    "limit": self.calls,
                    "period": self.period,
                    "retry_after": self.period
                }
            )
        
        # Ajouter la requête actuelle
        self.clients[client_ip].append(current_time)
        
        response = await call_next(request)
        return response
