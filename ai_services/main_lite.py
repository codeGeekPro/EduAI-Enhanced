"""
Version légère du main.py pour les tests rapides
"""

import os
os.environ["EDUAI_LITE_MODE"] = "true"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduAI AI Services (Lite Mode)",
    description="Services IA pour l'éducation - Mode Test",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "message": "AI Services en mode test"
    }

@app.get("/")
async def root():
    return {"message": "EduAI AI Services - Mode Test"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
