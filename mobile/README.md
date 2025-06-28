# 📱 Mobile Configuration pour EduAI

Ce dossier contient les configurations et outils spécifiques au déploiement mobile de l'application EduAI PWA.

## 🎯 Objectif

Bien que EduAI soit une PWA qui fonctionne nativement sur mobile, ce dossier contient :
- Configuration pour app stores (optionnel)
- Scripts de build mobile optimisés
- Outils de test sur appareils
- Configuration push notifications
- Assets mobiles spécifiques

## 📁 Structure

```
mobile/
├── pwa-builder/          # Configuration PWA Builder pour app stores
├── capacitor/           # Configuration Capacitor (si app hybride nécessaire)
├── assets/              # Icons, splash screens mobile
├── scripts/             # Scripts de build/déploiement mobile
├── testing/             # Tests automatisés mobiles
└── docs/               # Documentation mobile-spécifique
```

## 🚀 Déploiement

La PWA est accessible directement via navigateur mobile, mais peut aussi être :
1. **Installée comme app** via PWA install prompt
2. **Distribuée via app stores** avec PWA Builder
3. **Transformée en app hybride** avec Capacitor si nécessaire
