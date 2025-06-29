# 🎓 EduAI Enhanced

Progressive Web App révolutionnaire pour l'éducation mondiale avec IA adaptive et support multilingue.

## 🚀 Déploiement sur GitHub

### Étapes pour publier votre projet

1. **Initialiser le repository Git** :
```bash
cd "c:\Users\genie\Documents\Projet Python\eduai"
git init
git add .
git commit -m "🎉 Initial commit: EduAI Enhanced - PWA IA Éducative Multilingue"
```

2. **Ajouter le remote GitHub** :
```bash
git remote add origin https://github.com/codeGeekPro/EduAI-Enhanced.git
git branch -M main
git push -u origin main
```

3. **Configuration GitHub** :
   - Repository: https://github.com/codeGeekPro/EduAI-Enhanced
   - Auteur: DOUTI Lamoussa
   - Email: docteur@codegeek-pro.me

### Fichiers mis à jour pour GitHub

✅ **package.json** (root) - Repository URL et auteur  
✅ **frontend/package.json** - Repository URL et auteur  
✅ **backend/main.py** - Contact API  
✅ **docs/technical_guide.md** - Contact développeur  
✅ **README.md** - Clone URL et section auteur  

### Configuration recommandée du repository

1. **Description** : PWA révolutionnaire pour l'éducation mondiale avec IA adaptive et support multilingue
2. **Topics** : `education`, `pwa`, `ai`, `multilingual`, `react`, `fastapi`, `typescript`, `offline-first`
3. **License** : MIT
4. **Branch protection** : Activer pour `main`

### Variables d'environnement pour GitHub Actions

Si vous configurez CI/CD, ajoutez ces secrets :
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `HF_API_KEY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

## 🌟 Fonctionnalités principales

- 📱 **PWA** - Installation direct depuis navigateur
- 🤖 **IA Adaptive** - GPT-4 + apprentissage personnalisé
- 🌍 **50+ Langues** - Support multilingue complet
- 🎭 **Reconnaissance émotionnelle** - Adaptation empathique
- 📊 **Analytics avancés** - Suivi de progression
- 🔒 **Mode offline** - Fonctionne sans internet

## 📞 Contact

**DOUTI Lamoussa**  
📧 docteur@codegeek-pro.me  
🐙 https://github.com/codeGeekPro

---

## 🚀 Lancement de l'Application

### Prérequis avant le lancement
```bash
# Vérifier que vous êtes dans le bon répertoire
cd /d "c:\Users\genie\Documents\Projet Python\eduai"

# Vérifier que les services sont disponibles
docker --version
python --version
node --version
pnpm --version
```

### Option 1 : Lancement avec Docker (Recommandé)
```bash
# Démarrer tous les services avec Docker Compose
docker-compose up -d

# Vérifier que tous les conteneurs sont en cours d'exécution
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f
```

### Option 2 : Lancement en mode développement
```bash
# Terminal 1 : Backend API
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 : AI Services  
cd ai_services
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Terminal 3 : Frontend PWA
cd frontend
pnpm install
pnpm dev

# Terminal 4 : Services de base de données (si pas avec Docker)
# MongoDB
mongod

# Redis  
redis-server
```

### Option 3 : Lancement rapide avec les scripts NPM
```bash
# Installer toutes les dépendances
pnpm install

# Démarrer tous les services en parallèle
pnpm dev
```

## 🌐 URLs d'accès après le lancement

- **🎓 Frontend PWA** : http://localhost:3000
- **🔧 API Backend** : http://localhost:8000
- **📚 Documentation API** : http://localhost:8000/docs
- **🤖 AI Services** : http://localhost:8001
- **📊 AI Services Docs** : http://localhost:8001/docs
- **🗄️ MongoDB** : localhost:27017
- **📦 Redis** : localhost:6379

## ✅ Vérification du fonctionnement

```bash
# Tester le backend
curl http://localhost:8000/health

# Tester les services IA
curl http://localhost:8001/health

# Ouvrir l'application dans le navigateur
start http://localhost:3000
```

## 🔧 Dépannage rapide

```bash
# Si les ports sont occupés
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Arrêter tous les services Docker
docker-compose down

# Nettoyer et redémarrer
docker-compose down --volumes
docker-compose up -d --build
```

*Révolutionner l'éducation avec l'IA 🚀*
