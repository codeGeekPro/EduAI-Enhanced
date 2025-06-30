# 🎓 EduAI Enhanced - Frontend

## 🚀 Vue d'ensemble

Frontend React 18 + TypeScript avancé pour la plateforme d'apprentissage EduAI Enhanced. Application PWA complète avec fonctionnalités IA intégrées, gestion offline, monitoring des performances et interface utilisateur moderne.

## ✨ Fonctionnalités

### 🔐 Authentification & Gestion d'État
- Authentification sécurisée avec tokens JWT
- Gestion d'état globale avec Zustand
- Stores séparés pour auth, cours, et UI
- Persistance des données avec localStorage

### 📚 Gestion des Cours
- Liste des cours avec pagination
- Détails des cours avec progression
- Recherche et filtrage avancés
- Synchronisation temps réel

### 🤖 Services IA Avancés
- **Tuteur IA**: Chat interactif avec reconnaissance vocale
- **Analyse Avancée**: Vision par ordinateur, NLP, analytics
- **Upload de Fichiers**: Glisser-déposer avec prévisualisation
- **Chat Temps Réel**: WebSocket pour communication instantanée

### 📊 Analytics & Monitoring
- Tableaux de bord avec graphiques interactifs (Recharts)
- Métriques de performance (Core Web Vitals)
- Suivi de la progression d'apprentissage
- Rapports d'activité exportables

### ⚡ Performance & PWA
- Service Worker avancé pour le cache et la synchronisation
- Gestion offline avec IndexedDB
- Optimisations de performance automatiques
- Support des notifications push

### 🎨 Interface Utilisateur
- Design moderne avec Tailwind CSS
- Mode sombre/clair adaptatif
- Responsive design pour tous les appareils
- Animations fluides avec Framer Motion

## 🛠️ Technologies Utilisées

### Core
- **React 18** - Framework principal
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS utility-first

### État & Données
- **Zustand** - Gestion d'état globale
- **React Query** - Gestion des requêtes API
- **Axios** - Client HTTP
- **IndexedDB** - Base de données locale

### UI & Interactions
- **Lucide React** - Icônes
- **Framer Motion** - Animations
- **Recharts** - Graphiques
- **React Router** - Navigation

### IA & Temps Réel
- **WebSocket** - Communication temps réel
- **Web Speech API** - Reconnaissance vocale
- **File API** - Upload de fichiers
- **Web Vitals** - Métriques de performance

### Tests & Qualité
- **Vitest** - Tests unitaires
- **Testing Library** - Tests de composants
- **ESLint** - Linting
- **TypeScript** - Vérification de types

## 📁 Structure du Projet

```
frontend/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── ai/           # Composants IA
│   │   ├── chat/         # Composants de chat
│   │   ├── layout/       # Composants de mise en page
│   │   ├── monitoring/   # Composants de monitoring
│   │   ├── ui/           # Composants UI de base
│   │   └── upload/       # Composants d'upload
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services API et utilitaires
│   ├── stores/           # Stores Zustand
│   ├── tests/            # Tests unitaires et d'intégration
│   ├── types/            # Types TypeScript
│   └── utils/            # Fonctions utilitaires
├── package.json          # Dépendances et scripts
├── tailwind.config.js    # Configuration Tailwind
├── tsconfig.json         # Configuration TypeScript
└── vite.config.ts        # Configuration Vite
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation
```bash
cd frontend
pnpm install
```

### Développement
```bash
pnpm dev
# Application disponible sur http://localhost:3000
```

### Production
```bash
pnpm build
pnpm preview
```

## 🧪 Tests

### Tests unitaires
```bash
pnpm test
```

### Tests avec interface
```bash
pnpm test:ui
```

### Couverture de code
```bash
pnpm coverage
```

### Tests d'intégration complets
```bash
# Windows
test_final.bat

# Linux/Mac
./test_final.sh
```

## 📱 Fonctionnalités PWA

### Service Worker
- Cache intelligent des ressources
- Synchronisation en arrière-plan
- Notifications push
- Mise à jour automatique

### Offline
- Sauvegarde locale des données
- Synchronisation automatique à la reconnexion
- Interface utilisateur offline

### Performance
- Lazy loading des composants
- Optimisation des images
- Compression des assets
- Métriques Core Web Vitals

## 🔧 Configuration

### Variables d'environnement
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=EduAI Enhanced
```

### Personnalisation
- Thèmes dans `tailwind.config.js`
- Configuration API dans `src/services/config.ts`
- Stores globaux dans `src/stores/`

## 🌐 Pages Disponibles

### Publiques
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/faq` - FAQ

### Protégées
- `/dashboard` - Tableau de bord
- `/courses` - Mes cours
- `/ai-services` - Services IA
- `/analytics` - Analytics
- `/profile` - Profil
- `/settings` - Paramètres
- `/support` - Support

## 🤖 Services IA Intégrés

### Chat IA
- Conversation naturelle
- Reconnaissance vocale
- Synthèse vocale
- Détection d'émotion

### Analyse Avancée
- Vision par ordinateur
- Traitement du langage naturel
- Analytics comportementales
- Recommandations personnalisées

### Upload Intelligent
- Glisser-déposer multi-fichiers
- Prévisualisation en temps réel
- Validation automatique
- Barre de progression

## 📊 Monitoring & Analytics

### Métriques de Performance
- Core Web Vitals (LCP, FID, CLS)
- Latence des API
- Temps de chargement
- Utilisation mémoire

### Analytics d'Utilisation
- Progression d'apprentissage
- Temps passé par cours
- Réussites et badges
- Objectifs personnels

## 🔒 Sécurité

### Authentification
- JWT tokens sécurisés
- Refresh tokens automatiques
- Protection CSRF
- Validation côté client

### Données
- Chiffrement local
- Transmission HTTPS
- Validation des entrées
- Sanitisation des données

## 🚀 Déploiement

### Build de production
```bash
pnpm build
```

### Optimisations
- Tree shaking automatique
- Compression des assets
- Lazy loading
- Code splitting

### PWA
- Manifest.json configuré
- Service worker optimisé
- Cache strategies
- Offline support

## 📖 API Documentation

### Endpoints Principaux
- `POST /api/auth/login` - Connexion
- `GET /api/courses` - Liste des cours
- `POST /api/ai/chat` - Chat IA
- `GET /api/analytics` - Analytics
- `POST /api/upload` - Upload de fichiers

### WebSocket
- `/ws/chat` - Chat temps réel
- `/ws/notifications` - Notifications
- `/ws/progress` - Suivi de progression

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -m 'Ajout de ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Créer une Pull Request

## 📝 Licence

MIT License - voir le fichier [LICENSE](../LICENSE) pour plus de détails.

## 🔗 Liens Utiles

- [Documentation React](https://reactjs.org/)
- [Guide TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 🎯 Status du Projet

✅ **Phase 1 Terminée**: Infrastructure de base et authentification  
✅ **Phase 2 Terminée**: Gestion des cours et API  
✅ **Phase 3 Terminée**: Services IA avancés  
✅ **Phase 4 Terminée**: Analytics et monitoring  
✅ **Phase 5 Terminée**: PWA et fonctionnalités offline  
✅ **Phase 6 Terminée**: Tests d'intégration et finalisation  

**Le frontend EduAI Enhanced est maintenant complet et prêt pour la production !** 🚀
