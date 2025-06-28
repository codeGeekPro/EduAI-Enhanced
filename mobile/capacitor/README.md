# ⚡ Capacitor Configuration (Optionnel)

Configuration Capacitor pour transformer la PWA EduAI en application native hybride si nécessaire.

## 🎯 Quand utiliser Capacitor ?

**La PWA EduAI est suffisante dans 95% des cas**, mais Capacitor peut être utile pour :

- **APIs natives spécifiques** : Caméra avancée, géolocalisation précise
- **Distribution app stores** : Si PWA Builder ne suffit pas
- **Intégrations système** : Contacts, calendrier, fichiers
- **Performance critique** : Applications très intensives

## 📁 Structure

```
capacitor/
├── capacitor.config.ts    # Configuration principale
├── android/              # Projet Android Studio
├── ios/                  # Projet Xcode
├── plugins/              # Plugins Capacitor personnalisés
└── scripts/              # Scripts de build/déploiement
```

## 🚀 Installation

```bash
# Installer Capacitor
npm install @capacitor/core @capacitor/cli

# Initialiser le projet
npx cap init

# Ajouter les plateformes
npx cap add android
npx cap add ios

# Synchroniser avec la PWA
npx cap sync
```

## 🔧 Configuration

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eduai.app',
  appName: 'EduAI Enhanced',
  webDir: '../../frontend/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

## 📱 Plugins recommandés

### Plugins essentiels
```bash
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
npm install @capacitor/keyboard
npm install @capacitor/haptics
```

### Plugins éducatifs
```bash
npm install @capacitor/camera          # Pour scanner documents
npm install @capacitor/filesystem      # Stockage local avancé
npm install @capacitor/share            # Partage de contenu
npm install @capacitor/speech           # Speech-to-text natif
```

### Plugins optionnels
```bash
npm install @capacitor/geolocation     # Localisation
npm install @capacitor/contacts        # Contacts (pour partage)
npm install @capacitor/calendar        # Planification cours
```

## 🛠 Workflow de développement

```bash
# 1. Build de la PWA
cd ../../frontend
npm run build

# 2. Sync avec Capacitor
cd ../mobile/capacitor
npx cap sync

# 3. Développement
npx cap run android    # Android Studio
npx cap run ios        # Xcode

# 4. Build pour production
npx cap build android
npx cap build ios
```

## ⚠️ Considérations importantes

### Avantages PWA vs Capacitor

**PWA (Recommandé) :**
- ✅ Installation instantanée
- ✅ Mises à jour automatiques
- ✅ Taille minimale
- ✅ Aucune review app store
- ✅ Cross-platform parfait

**Capacitor (Si nécessaire) :**
- ✅ APIs natives complètes
- ✅ Performance maximale
- ✅ Distribution app stores traditionnelle
- ❌ Complexité accrue
- ❌ Mises à jour via stores
- ❌ Maintenance multi-plateforme

### Recommandation

**Commencer par la PWA** et n'utiliser Capacitor que si des fonctionnalités natives spécifiques sont absolument nécessaires.

## 🔗 Resources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Plugins communauté](https://github.com/capacitor-community)
- [Migration PWA → Capacitor](https://capacitorjs.com/docs/web/pwa-elements)
