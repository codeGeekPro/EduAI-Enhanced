"""
Version légère du backend pour les tests rapides
"""

import os
os.environ["EDUAI_LITE_MODE"] = "true"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduAI Backend (Lite Mode)",
    description="API Backend pour EduAI - Mode Test",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé"""
    return {
        "status": "ok",
        "mode": "lite",
        "message": "Backend en mode test",
        "services": {
            "database": "not connected (test mode)",
            "redis": "not connected (test mode)",
            "ai_services": "not connected (test mode)"
        }
    }

@app.get("/")
async def root():
    return {"message": "EduAI Backend - Mode Test"}

@app.get("/api/v1/health")
async def api_health():
    """Health check pour l'API v1"""
    return {
        "status": "ok",
        "version": "1.0.0",
        "mode": "test",
        "endpoints": [
            "/health",
            "/api/v1/health"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
