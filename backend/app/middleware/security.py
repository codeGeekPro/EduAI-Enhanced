"""
🎓 EduAI Enhanced - Middleware de Sécurité
Protection de l'API contre les attaques courantes
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware de sécurité pour l'API"""
    
    async def dispatch(self, request: Request, call_next):
        # Ajouter des headers de sécurité
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response
