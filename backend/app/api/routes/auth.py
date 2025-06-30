"""
🎓 EduAI Enhanced - Routes d'Authentification
Système d'auth sécurisé pour l'application PWA éducative
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import secrets

from ...core.config import get_settings
from ...core.database import get_database

settings = get_settings()
router = APIRouter()

# Constants pour les types de tokens
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"

# 🔒 Configuration sécurité
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 📝 Modèles de données

class UserRegister(BaseModel):
    """Modèle pour l'inscription d'un utilisateur"""
    username: str
    email: EmailStr
    password: str
    language: str = "fr"
    country: Optional[str] = None
    learning_preferences: Optional[dict] = {}

class UserLogin(BaseModel):
    """Modèle pour la connexion d'un utilisateur"""
    email: EmailStr
    password: str
    remember_me: bool = False

class Token(BaseModel):
    """Modèle pour les tokens d'authentification"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class UserProfile(BaseModel):
    """Profil utilisateur public"""
    id: str
    username: str
    email: EmailStr
    language: str
    country: Optional[str]
    learning_preferences: dict
    created_at: datetime
    last_active: Optional[datetime]
    total_sessions: int = 0
    learning_streak: int = 0

# 🔐 Fonctions de sécurité

def hash_password(password: str) -> str:
    """Hasher un mot de passe"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Créer un token d'accès JWT"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    """Créer un token de rafraîchissement"""
    data = {
        "user_id": user_id,
        "type": TOKEN_TYPE_REFRESH,
        "exp": datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    }
    return jwt.encode(data, settings.secret_key, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtenir l'utilisateur actuel à partir du token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Récupérer l'utilisateur depuis la base de données
        db = get_database()
        user = await db.users.find_one({"_id": user_id})
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )

# 🛣️ Routes d'authentification

@router.post("/register", response_model=Token)
async def register_user(user_data: UserRegister):
    """
    👤 Inscription d'un nouvel utilisateur
    
    Crée un compte utilisateur avec préférences d'apprentissage
    """
    try:
        db = get_database()
        
        # Vérifier si l'email existe déjà
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        
        # Vérifier si le nom d'utilisateur existe déjà
        existing_username = await db.users.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce nom d'utilisateur est déjà pris"
            )
        
        # Valider la langue supportée
        if user_data.language not in settings.supported_languages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Langue non supportée. Langues disponibles: {settings.supported_languages}"
            )
        
        # Créer l'utilisateur
        user_id = secrets.token_urlsafe(16)
        hashed_password = hash_password(user_data.password)
        
        new_user = {
            "_id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed_password,
            "language": user_data.language,
            "country": user_data.country,
            "learning_preferences": user_data.learning_preferences or {
                "difficulty_level": "beginner",
                "learning_style": "mixed",
                "subjects": [],
                "daily_goal_minutes": 30
            },
            "created_at": datetime.utcnow(),
            "last_active": datetime.utcnow(),
            "is_active": True,
            "total_sessions": 0,
            "learning_streak": 0,
            "achievements": [],
            "settings": {
                "notifications": True,
                "sound_enabled": True,
                "theme": "light"
            }
        }
        
        # Insérer en base de données
        await db.users.insert_one(new_user)
        
        # Créer les tokens
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user_id, "email": user_data.email},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(user_id)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'inscription: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """
    🔑 Connexion d'un utilisateur
    
    Authentifie l'utilisateur et retourne les tokens
    """
    try:
        db = get_database()
        
        # Trouver l'utilisateur par email
        user = await db.users.find_one({"email": login_data.email})
        
        if not user or not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Vérifier si le compte est actif
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte désactivé"
            )
        
        # Mettre à jour la dernière activité
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_active": datetime.utcnow()}}
        )
        
        # Créer les tokens
        token_expiry = timedelta(days=7) if login_data.remember_me else timedelta(minutes=settings.access_token_expire_minutes)
        
        access_token = create_access_token(
            data={"sub": user["_id"], "email": user["email"]},
            expires_delta=token_expiry
        )
        refresh_token = create_refresh_token(user["_id"])
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(token_expiry.total_seconds())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la connexion: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """
    🔄 Rafraîchir le token d'accès
    
    Utilise le refresh token pour obtenir un nouveau access token
    """
    try:
        payload = jwt.decode(refresh_token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("user_id")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != TOKEN_TYPE_REFRESH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de rafraîchissement invalide"
            )
        
        # Vérifier que l'utilisateur existe
        db = get_database()
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé"
            )
        
        # Créer un nouveau token d'accès
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        new_access_token = create_access_token(
            data={"sub": user_id, "email": user["email"]},
            expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(user_id)
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.access_token_expire_minutes * 60
        )
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    👤 Obtenir le profil de l'utilisateur connecté
    """
    try:
        # Calculer les statistiques d'apprentissage
        db = get_database()
        
        # Compter les sessions totales
        total_sessions = await db.learning_sessions.count_documents(
            {"user_id": current_user["_id"]}
        )
        
        # Calculer la streak d'apprentissage (jours consécutifs)
        # Logique simplifiée - en réalité, plus complexe
        learning_streak = current_user.get("learning_streak", 0)
        
        return UserProfile(
            id=current_user["_id"],
            username=current_user["username"],
            email=current_user["email"],
            language=current_user["language"],
            country=current_user.get("country"),
            learning_preferences=current_user.get("learning_preferences", {}),
            created_at=current_user["created_at"],
            last_active=current_user.get("last_active"),
            total_sessions=total_sessions,
            learning_streak=learning_streak
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du profil: {str(e)}"
        )

@router.put("/profile")
async def update_user_profile(
    profile_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    ✏️ Mettre à jour le profil utilisateur
    """
    try:
        db = get_database()
        
        # Champs autorisés à être modifiés
        allowed_fields = [
            "username", "language", "country", "learning_preferences",
            "settings"
        ]
        
        # Filtrer les champs autorisés
        update_data = {
            k: v for k, v in profile_update.items() 
            if k in allowed_fields
        }
        
        # Valider la langue si modifiée
        if "language" in update_data:
            if update_data["language"] not in settings.supported_languages:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Langue non supportée: {update_data['language']}"
                )
        
        # Vérifier l'unicité du nom d'utilisateur si modifié
        if "username" in update_data:
            existing = await db.users.find_one({
                "username": update_data["username"],
                "_id": {"$ne": current_user["_id"]}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ce nom d'utilisateur est déjà pris"
                )
        
        # Mettre à jour en base de données
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        return {"status": "success", "message": "Profil mis à jour avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

@router.post("/logout")
async def logout_user(current_user: dict = Depends(get_current_user)):
    """
    🚪 Déconnexion de l'utilisateur
    
    En pratique, on pourrait maintenir une blacklist de tokens
    """
    try:
        # Mettre à jour la dernière activité
        db = get_database()
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"last_active": datetime.utcnow()}}
        )
        
        return {
            "status": "success", 
            "message": "Déconnexion réussie",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la déconnexion: {str(e)}"
        )

@router.delete("/account")
async def delete_user_account(
    password: str,
    current_user: dict = Depends(get_current_user)
):
    """
    🗑️ Supprimer le compte utilisateur
    
    Nécessite la confirmation du mot de passe
    """
    try:
        # Vérifier le mot de passe
        if not verify_password(password, current_user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mot de passe incorrect"
            )
        
        db = get_database()
        
        # Supprimer toutes les données de l'utilisateur
        await db.users.delete_one({"_id": current_user["_id"]})
        await db.learning_sessions.delete_many({"user_id": current_user["_id"]})
        await db.analytics.delete_many({"user_id": current_user["_id"]})
        await db.offline_cache.delete_many({"user_id": current_user["_id"]})
        
        return {
            "status": "success",
            "message": "Compte supprimé avec succès",
            "timestamp": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
