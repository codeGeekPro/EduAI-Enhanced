# 🎨 Assets Mobiles

Ce dossier contient tous les assets optimisés pour l'expérience mobile de EduAI.

## 📁 Structure

```
assets/
├── icons/                 # Icons PWA (toutes tailles)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── splash/               # Splash screens
│   ├── splash-320x568.png
│   ├── splash-375x667.png
│   ├── splash-414x736.png
│   └── splash-414x896.png
├── screenshots/          # Screenshots pour app stores
│   ├── mobile-home.png
│   ├── mobile-lesson.png
│   ├── mobile-chat.png
│   └── desktop-dashboard.png
└── shortcuts/           # Icons pour shortcuts PWA
    ├── shortcut-course.png
    └── shortcut-review.png
```

## 🎯 Spécifications

### Icons PWA
- **Format** : PNG avec transparence
- **Tailles** : 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Design** : Maskable (compatible avec formes Android)
- **Couleurs** : Contraste élevé pour lisibilité

### Splash Screens
- **Résolutions** : iPhone SE, iPhone 8, iPhone 8 Plus, iPhone X+
- **Orientation** : Portrait prioritaire
- **Branding** : Logo EduAI + couleurs thème

### Screenshots
- **Mobile** : 320x640 minimum
- **Desktop** : 1280x720 minimum
- **Qualité** : Haute résolution, UI propre
- **Contenu** : Fonctionnalités clés mises en avant

## 🛠 Génération automatique

Utilisez `scripts/generate-assets.js` pour générer automatiquement toutes les tailles depuis un fichier source SVG.
