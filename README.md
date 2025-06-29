# 🎓 EduAI Enhanced - Plateforme d'Apprentissage IA Collaborative

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()

> Plateforme d'apprentissage collaborative révolutionnaire alimentée par l'IA, offrant une expérience interactive, accessible et visuellement attrayante.

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)
```bash
git clone <repository-url>
cd eduai
docker-compose up -d
```

### Installation Manuelle
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload &

# Services IA
cd ai_services && pip install -r requirements.txt
python main.py &

# Frontend
cd frontend && pnpm install && pnpm dev
```

## ✨ Fonctionnalités Principales

### 🧠 IA Révolutionnaire
- **Moteur métacognitif** auto-améliorant
- **Analyse émotionnelle** en temps réel
- **Traitement NLP** multi-langues via OpenRouter
- **Collaboration IA** multi-agents

### � Interface Interactive
- **Carte conceptuelle** avec drag & drop
- **Visualisations 3D** du parcours d'apprentissage  
- **Thème adaptatif** sombre/clair
- **Navigation accessible** (ARIA, clavier)

### 🔗 Collaboration
- **Apprentissage social** en temps réel
- **Partage de concepts** interactif
- **Mentoring IA** personnalisé

## 🏗 Architecture

```
EduAI Enhanced
├── 🎨 frontend/       # React + TypeScript + PWA
├── ⚡ backend/        # FastAPI + Python  
├── 🤖 ai_services/    # Moteurs IA avancés
├── 📱 mobile/         # Applications mobiles
└── 📚 docs/           # Documentation
```

## 🛠 Technologies

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, PWA
**Backend**: FastAPI, Python, MongoDB, Redis
**IA**: OpenRouter, Transformers, TensorFlow, OpenCV
**DevOps**: Docker, GitHub Actions, Nginx

## 🔧 Développement

```bash
# Lancer en mode développement
cd frontend && pnpm dev      # Frontend sur http://localhost:5173
cd backend && uvicorn main:app --reload  # API sur http://localhost:8000
cd ai_services && python main.py         # Services IA sur http://localhost:8001
```

## � Documentation

- **📋 Guide de démarrage** : [QUICKSTART.md](QUICKSTART.md)
- **🔧 Guide technique** : [docs/technical_guide.md](docs/technical_guide.md)
- **👥 Guide utilisateur** : [docs/user_guide.md](docs/user_guide.md)
- **🤖 API IA** : [docs/advanced_ai_api.md](docs/advanced_ai_api.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour la fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 🌟 Auteurs

- **Équipe EduAI** - *Développement initial* - [GitHub](https://github.com/codeGeekPro)

---

⭐ **N'hésitez pas à donner une étoile si ce projet vous a aidé !**


## 📈 Métriques de Succès

- **Utilisateurs cibles** : 10M+ dans 3 ans
- **Langues supportées** : 50+ (focus Afrique + minorités USA)
- **Réduction coût éducation** : 80% vs cours privés
- **Amélioration résultats** : +65% en 6 mois d'usage
- **Disponibilité** : 99.9% uptime, mode offline

---

## 👨‍💻 Auteur

**DOUTI Lamoussa**
- 🌐 GitHub: [@codeGeekPro](https://github.com/codeGeekPro)
- 📧 Email: docteur@codegeek-pro.me
- 🚀 Projet: [EduAI Enhanced](https://github.com/codeGeekPro/EduAI-Enhanced)

---

*Révolutionnons l'éducation mondiale avec l'IA 🌍📚*
