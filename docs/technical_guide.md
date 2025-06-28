# Guide Technique - EduAI Enhanced

## Introduction
EduAI Enhanced est une application IA éducative multilingue et adaptative conçue pour fonctionner comme une Progressive Web App (PWA). Ce guide technique fournit des informations sur l'architecture, les technologies utilisées, et les étapes de configuration.

---

## Architecture

### Backend
- **Framework** : FastAPI
- **Services IA** : OpenAI GPT-4, Whisper AI, ElevenLabs, Hugging Face Transformers
- **Base de données** : MongoDB (persistance), Redis (cache)
- **Vector Database** : Pinecone

### Frontend
- **Framework** : React 18
- **Langage** : TypeScript
- **Design** : Tailwind CSS
- **Fonctionnalités PWA** : Service Workers, IndexedDB, Push API

### AI Services
- **Modules** : NLP, Emotion, Speech, Vision
- **Technologies** : TensorFlow, PyTorch

---

## Configuration

### Prérequis
- Python 3.11+ (recommandé pour compatibilité optimale)
- Node.js 18+
- PNPM 8+ (gestionnaire de packages moderne)
- Docker
- MongoDB (local ou Atlas)
- Redis

### Installation avec PNPM
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/your-username/eduai-enhanced.git
   cd eduai-enhanced
   ```

2. Installez PNPM globalement :
   ```bash
   npm install -g pnpm
   ```

3. Configurez l'environnement Python :
   ```bash
   conda create -n eduai-backend python=3.11
   conda activate eduai-backend
   pip install -r backend/requirements.txt
   ```

4. Installez les dépendances frontend avec PNPM :
   ```bash
   pnpm install
   ```

5. Lancez les services :
   ```bash
   # Backend
   uvicorn main:app --reload

   # Frontend
   pnpm dev
   ```

### Avantages de PNPM
- **Performance** : 3x plus rapide que npm
- **Économie d'espace** : Store partagé, pas de duplication
- **Sécurité** : Résolution stricte des dépendances
- **Workspace** : Gestion multi-packages native

---

## Endpoints API

### Authentification
- `POST /api/auth/login`
- `POST /api/auth/register`

### Utilisateurs
- `GET /api/users`
- `PUT /api/users/{id}`

### Tuteur IA
- `POST /api/ai-tutor/ask`

### Traduction
- `POST /api/translation`

### Reconnaissance Vocale
- `POST /api/speech/recognize`

### Reconnaissance Émotionnelle
- `POST /api/emotion/analyze`

---

## Déploiement

### Production
1. Configurez les variables d'environnement :
   ```env
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=False
   ```
2. Lancez Docker :
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

---

## Contact
- **Développeur** : DOUTI Lamoussa
- **Email** : docteur@codegeek-pro.me
- **GitHub** : [EduAI Enhanced](https://github.com/codeGeekPro/EduAI-Enhanced)
