# 🚀 Guide de Démarrage Rapide - EduAI Enhanced

Ce guide vous aidera à lancer l'application en moins de 5 minutes.

## 📋 Prérequis

- **Node.js** (v18+), **pnpm**
- **Python** (v3.10+)
- **Docker** & **Docker Compose**
- **Clés API** (voir ci-dessous)

## ✅ 1. Configuration Essentielle

### Clés API
L'application utilise des services externes pour l'IA. Vous devez fournir vos propres clés.

1.  **Copiez le fichier d'exemple** :
    ```bash
    copy .env.example .env
    ```
2.  **Modifiez `.env`** et ajoutez vos clés API.
    - `OPENAI_API_KEY` (ou une alternative gratuite via `OPENROUTER_API_KEY`).
    - Consultez `CLOUD_FREE_GUIDE.md` pour des options gratuites.

## ✅ 2. Démarrage (Recommandé avec Docker)

Cette commande construit et lance tous les services (frontend, backend, services IA) dans des conteneurs Docker.

```bash
# Lance tous les services en arrière-plan
docker-compose up -d --build
```

### Vérification des Services
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Services IA API**: [http://localhost:8001/docs](http://localhost:8001/docs)

## ✅ 3. Commandes Utiles (PNPM)

Utilisez `pnpm` pour gérer le projet depuis la racine.

```bash
# Installer toutes les dépendances (frontend, mobile, etc.)
pnpm install

# Lancer en mode développement (sans Docker)
pnpm run dev

# Lancer les tests
pnpm run test

# Build pour la production
pnpm run build

# Déployer avec Docker (après un build)
pnpm run deploy
```

## 🆘 Dépannage

### Erreur : `Module not found` ou `dépendance manquante`
Assurez-vous d'avoir installé les paquets pour chaque workspace.

```bash
# Depuis la racine du projet
pnpm install

# Si le problème persiste, pour un workspace spécifique :
cd frontend
pnpm install
```

### Erreur : `API Key not found` ou `401 Unauthorized`
1.  Vérifiez que le fichier `.env` est présent à la racine.
2.  Assurez-vous que les noms des variables (`OPENAI_API_KEY`, etc.) sont corrects.
3.  Redémarrez les services après toute modification du `.env` :
    ```bash
    docker-compose down && docker-compose up -d
    ```

### Erreur : `Port already in use`
Un autre service utilise un port nécessaire (3000, 8000, 8001).

```bash
# Trouver le processus utilisant le port (ici, 3000)
netstat -ano | findstr :3000

# Arrêter le processus avec son PID
taskkill /PID VOTRE_PID /F
```

### Conflits de dépendances Python (`pip`)
Si `pip install` échoue à cause de conflits, utilisez le script de résolution :

```bash
# Exécute le script pour forcer les bonnes versions
.\scripts\fix_conflicts.bat
```

---
💡 **Pour aller plus loin**, consultez le `README.md` et le `technical_guide.md`.
