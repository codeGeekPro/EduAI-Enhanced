# 🧪 Tests Mobiles Automatisés

Ce dossier contient tous les tests automatisés pour valider l'expérience mobile de EduAI.

## 📁 Structure

```
testing/
├── devices/              # Configurations d'appareils de test
├── scenarios/           # Scénarios de test utilisateur
├── performance/         # Tests de performance mobile
├── accessibility/       # Tests d'accessibilité
└── reports/            # Rapports de tests générés
```

## 🚀 Types de tests

### 1. Tests de compatibilité appareils
- iPhone SE, 8, 12, 13, 14
- Samsung Galaxy S20, S21, S22
- iPad, iPad Pro
- Appareils Android low-end

### 2. Tests de performance
- Temps de chargement initial
- Fluidité des animations
- Consommation mémoire
- Utilisation CPU
- Consommation batterie

### 3. Tests PWA
- Installation PWA
- Mode offline
- Synchronisation données
- Notifications push
- Cache stratégies

### 4. Tests d'accessibilité
- Navigation clavier
- Lecteurs d'écran
- Contraste couleurs
- Taille des cibles tactiles
- Support high contrast mode

### 5. Tests fonctionnels
- Reconnaissance vocale
- Analyse émotionnelle
- Interface multilingue
- Modes d'apprentissage
- Synchronisation cloud

## 🛠 Outils utilisés

- **Puppeteer** : Automation navigateur
- **Lighthouse** : Audit performance PWA
- **axe-core** : Tests accessibilité
- **WebPageTest** : Performance réseau
- **BrowserStack** : Tests cross-device

## 📊 Métriques surveillées

### Performance
- **FCP** (First Contentful Paint) < 1.5s
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### PWA
- **Installabilité** : ✅ Critères PWA respectés
- **Offline** : ✅ Fonctionnel sans réseau
- **Cache** : ✅ Stratégie optimale
- **Manifest** : ✅ Complet et valide

### Accessibilité
- **WCAG 2.1 AA** : Niveau de conformité cible
- **Contraste** : Ratio minimum 4.5:1
- **Navigation** : 100% accessible au clavier
- **Lecteurs d'écran** : Compatible NVDA/VoiceOver

## 🚀 Lancement des tests

```bash
# Tests complets
npm run test

# Tests sur appareil spécifique
npm run test:device "iPhone 12"

# Tests de performance uniquement
npm run test:performance

# Tests d'accessibilité
npm run test:a11y

# Tests PWA
npm run test:pwa
```

## 📈 Rapports

Les rapports sont générés automatiquement dans `reports/` :
- **HTML** : Rapport visuel détaillé
- **JSON** : Données pour CI/CD
- **PDF** : Export pour stakeholders
- **Screenshots** : Captures d'écran des tests
