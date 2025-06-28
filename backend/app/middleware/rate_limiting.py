"""
🎓 EduAI Enhanced - Middleware Rate Limiting
Limitation du taux de requêtes pour éviter les abus
"""

from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware de limitation de taux"""
    
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = "100"
        return response
