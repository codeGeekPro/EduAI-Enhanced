# 📚 Guide d'Utilisation - Services Infrastructure EduAI

> **Guide pratique pour développeurs et administrateurs système**

## 🎯 Introduction

Ce guide explique comment utiliser et configurer les 5 services d'infrastructure avancés d'EduAI Enhanced pour optimiser les performances, la scalabilité et la fiabilité de votre application.

## 🔄 LoadBalancingService - Guide d'Usage

### Initialisation Basique

```typescript
import { loadBalancingService } from './services/LoadBalancingService';

// Configuration par défaut (algorithme adaptatif)
await loadBalancingService.initialize();
```

### Configuration Avancée

```typescript
const config = {
  algorithm: 'cost_optimized',     // Pour optimiser les coûts
  healthCheckInterval: 30000,      // Check toutes les 30 secondes
  failoverThreshold: 2,            // Failover après 2 échecs
  circuitBreakerTimeout: 60000,    // Timeout circuit breaker 1 min
  providers: {
    openai: { weight: 3, priority: 1 },
    openrouter: { weight: 2, priority: 2 },
    anthropic: { weight: 1, priority: 3 }
  }
};

await loadBalancingService.configure(config);
```

### Sélection d'Instance IA

```typescript
// Pour une requête chat standard
const result = await loadBalancingService.selectInstance({
  model: 'gpt-4',
  priority: 'high',
  expectedTokens: 1000,
  retryable: true,
  userId: 'user_123',
  sessionId: 'session_456'
});

console.log(`Instance sélectionnée: ${result.instance.id}`);
console.log(`Coût estimé: $${result.estimatedCost}`);
```

### Monitoring Performance

```typescript
// Enregistrer la performance après traitement
loadBalancingService.recordPerformance(
  instanceId,
  responseTime,
  success,
  actualCost
);

// Obtenir les statistiques
const stats = loadBalancingService.getStats();
console.log(`Latence moyenne: ${stats.averageLatency}ms`);
console.log(`Taux de succès: ${stats.successRate}%`);
```

## 📋 AIQueueService - Guide d'Usage

### Ajout de Tâches

```typescript
import { aiQueueService } from './services/AIQueueService';

// Tâche de chat prioritaire
const chatTaskId = await aiQueueService.addTask({
  type: 'chat',
  payload: {
    message: 'Expliquez-moi la photosynthèse',
    context: 'biologie_niveau_college'
  },
  priority: 'high',
  userId: 'student_123',
  maxRetries: 3,
  timeout: 30000,
  metadata: {
    estimatedDuration: 2000,
    estimatedCost: 0.05,
    requiredModel: 'gpt-4',
    computeIntensive: false,
    retryable: true,
    tags: ['education', 'science']
  }
});

// Tâche de génération d'image (lourde)
const imageTaskId = await aiQueueService.addTask({
  type: 'image_generation',
  payload: {
    prompt: 'Illustration pédagogique de la photosynthèse',
    style: 'educational',
    size: '1024x1024'
  },
  priority: 'normal',
  userId: 'teacher_456',
  maxRetries: 2,
  timeout: 60000,
  delay: 5000, // Délai de 5 secondes
  metadata: {
    estimatedDuration: 15000,
    estimatedCost: 0.20,
    requiredModel: 'dall-e-3',
    computeIntensive: true,
    retryable: true,
    tags: ['image', 'education']
  }
});
```

### Gestion des Tâches

```typescript
// Suivre le statut d'une tâche
const task = aiQueueService.getTask(taskId);
console.log(`Statut: ${task?.status}`);
console.log(`Progress: ${task?.progress?.current}/${task?.progress?.total}`);

// Annuler une tâche
const cancelled = aiQueueService.cancelTask(taskId);

// Relancer une tâche échouée
const retried = aiQueueService.retryTask(taskId);

// Obtenir toutes les tâches d'un utilisateur
const userTasks = aiQueueService.getTasks({ 
  userId: 'student_123',
  status: 'pending'
});
```

### Événements du Queue

```typescript
// Écouter les événements
aiQueueService.on('taskCompleted', (task) => {
  console.log(`Tâche ${task.id} terminée:`, task.result);
  
  // Notifier l'utilisateur
  if (task.type === 'image_generation') {
    showNotification(`Image générée: ${task.result.image_url}`);
  }
});

aiQueueService.on('taskFailed', (task) => {
  console.error(`Tâche ${task.id} échouée:`, task.error);
  
  // Log pour debugging
  logger.error('Task failed', {
    taskId: task.id,
    error: task.error,
    retries: task.currentRetries
  });
});
```

## 💾 DatabasePoolingService - Guide d'Usage

### Configuration Multi-DB

```typescript
import { databasePoolingService } from './services/DatabasePoolingService';

// Configuration pour production
const config = {
  pools: {
    indexeddb: { maxConnections: 5, timeout: 5000 },
    postgresql: { 
      maxConnections: 10, 
      timeout: 30000,
      connectionString: process.env.POSTGRES_URL 
    },
    mongodb: { 
      maxConnections: 8, 
      timeout: 10000,
      connectionString: process.env.MONGO_URL 
    },
    redis: { 
      maxConnections: 15, 
      timeout: 5000,
      connectionString: process.env.REDIS_URL 
    }
  },
  cache: {
    enabled: true,
    defaultTTL: 300,        // 5 minutes
    maxSize: 1000,
    compression: true
  }
};

await databasePoolingService.initialize(config);
```

### Exécution de Requêtes

```typescript
// Requête avec cache automatique
const users = await databasePoolingService.query(
  'postgresql',
  'SELECT * FROM users WHERE active = $1',
  [true],
  { cacheKey: 'active_users', ttl: 600 } // Cache 10 minutes
);

// Transaction complexe
const result = await databasePoolingService.transaction('postgresql', async (conn) => {
  const user = await conn.query('INSERT INTO users (...) VALUES (...) RETURNING id');
  const profile = await conn.query('INSERT INTO profiles (...) VALUES (...)');
  return { userId: user.rows[0].id, profileId: profile.rows[0].id };
});

// Requête NoSQL (MongoDB)
const courses = await databasePoolingService.query(
  'mongodb',
  { collection: 'courses', operation: 'find', filter: { active: true } }
);

// Cache Redis
await databasePoolingService.query(
  'redis',
  { operation: 'set', key: 'session:123', value: sessionData, ttl: 3600 }
);
```

### Monitoring des Pools

```typescript
// Statistiques des connexions
const stats = databasePoolingService.getStats();
console.log('Pool Stats:', {
  postgresql: stats.postgresql,
  mongodb: stats.mongodb,
  redis: stats.redis
});

// Health check des pools
const health = await databasePoolingService.healthCheck();
console.log('DB Health:', health);

// Métriques de cache
const cacheStats = databasePoolingService.getCacheStats();
console.log(`Cache hit ratio: ${cacheStats.hitRatio}%`);
```

## 🌐 CDNService - Guide d'Usage

### Upload et Optimisation d'Assets

```typescript
import { cdnService } from './services/CDNService';

// Upload d'image avec optimisation automatique
const uploadResult = await cdnService.uploadAsset(file, {
  type: 'image',
  optimization: {
    formats: ['webp', 'avif', 'jpg'],
    qualities: [90, 75, 60],
    sizes: [320, 640, 1280, 1920],
    lazy: true
  },
  metadata: {
    alt: 'Illustration cours de biologie',
    category: 'educational',
    courseId: 'bio_101'
  }
});

console.log(`Asset URL: ${uploadResult.url}`);
console.log(`Responsive variants:`, uploadResult.variants);
```

### Gestion des Assets

```typescript
// Obtenir les variants responsifs
const variants = cdnService.getResponsiveVariants(assetId, {
  sizes: ['320w', '640w', '1280w'],
  formats: ['webp', 'jpg']
});

// Invalider le cache
await cdnService.invalidateCache(['/images/course-header.jpg']);

// Optimiser les assets existants
const optimized = await cdnService.optimizeAsset(assetId, {
  compression: 'high',
  format: 'webp',
  quality: 85
});
```

### Analytics CDN

```typescript
// Statistiques d'usage
const stats = await cdnService.getAnalytics({
  period: '7d',
  metrics: ['requests', 'bandwidth', 'cache_ratio', 'cost']
});

console.log(`Requêtes cette semaine: ${stats.requests}`);
console.log(`Bande passante: ${stats.bandwidth} GB`);
console.log(`Taux de cache: ${stats.cache_ratio}%`);
console.log(`Coût: $${stats.cost}`);
```

## 🛡️ SecurityIntegrationService - Guide d'Usage

### Configuration de Sécurité

```typescript
import { securityIntegrationService } from './services/SecurityIntegrationService';

// Configuration par rôles
const securityConfig = {
  rateLimiting: {
    public: { requests: 100, window: 3600 },
    authenticated: { requests: 1000, window: 3600 },
    premium: { requests: 5000, window: 3600 }
  },
  fileValidation: {
    maxSize: 10 * 1024 * 1024,    // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
    scanForMalware: true,
    quarantineTime: 300           // 5 minutes
  },
  audit: {
    logLevel: 'info',
    retention: 90,                // 90 jours
    realTimeAlerts: true
  }
};

await securityIntegrationService.configure(securityConfig);
```

### Validation de Fichiers

```typescript
// Validation complète d'un fichier
const validationResult = await securityIntegrationService.validateFile(file, {
  userId: 'student_123',
  context: 'homework_submission',
  metadata: {
    courseId: 'math_101',
    assignmentId: 'hw_week_3'
  }
});

if (validationResult.valid) {
  console.log('Fichier validé:', validationResult.sanitizedMetadata);
  // Procéder avec l'upload
} else {
  console.error('Validation échouée:', validationResult.errors);
  // Afficher les erreurs à l'utilisateur
}
```

### Authentification et Autorisation

```typescript
// Vérifier les permissions
const hasPermission = await securityIntegrationService.checkPermission(
  userId,
  'upload_course_content',
  { courseId: 'bio_101' }
);

// Rate limiting check
const allowed = await securityIntegrationService.checkRateLimit(
  userId,
  'api_call'
);

if (!allowed.success) {
  throw new Error(`Rate limit exceeded. Retry in ${allowed.retryAfter} seconds`);
}
```

## 📊 Infrastructure Dashboard - Guide d'Usage

### Intégration dans React

```tsx
import { InfrastructureDashboard } from './components/infrastructure/InfrastructureDashboard';

function AdminPanel() {
  return (
    <div className="admin-layout">
      <h1>Administration EduAI</h1>
      
      {/* Dashboard infrastructure complet */}
      <InfrastructureDashboard />
    </div>
  );
}
```

### Configuration des Alertes

```typescript
// Seuils d'alerte personnalisés
const alertConfig = {
  loadBalancer: {
    latency: { warning: 300, critical: 800 },
    errorRate: { warning: 2, critical: 8 }
  },
  queue: {
    pendingTasks: { warning: 50, critical: 200 },
    workerUtilization: { warning: 80, critical: 95 }
  },
  database: {
    connectionUsage: { warning: 70, critical: 90 },
    queryTime: { warning: 1000, critical: 3000 }
  },
  cdn: {
    cacheRatio: { warning: 85, critical: 75 },
    cost: { warning: 50, critical: 100 }
  }
};

// Configurer les notifications
const notificationConfig = {
  email: ['admin@eduai.com', 'devops@eduai.com'],
  webhook: 'https://hooks.slack.com/services/...',
  escalation: {
    critical: 'immediate',
    warning: '5_minutes'
  }
};
```

## 🚀 Bonnes Pratiques

### Performance

1. **Load Balancer** : Utilisez l'algorithme `adaptive` en production
2. **Queue** : Priorisez les tâches utilisateur (`critical`) sur les analytics (`low`)
3. **Database** : Activez le cache pour les requêtes fréquentes
4. **CDN** : Optimisez les images pour réduire la bande passante

### Sécurité

1. **Rate Limiting** : Ajustez selon vos besoins utilisateur
2. **File Validation** : Scannez toujours les uploads utilisateur
3. **Audit** : Conservez les logs critiques pendant 90+ jours
4. **Monitoring** : Configurez des alertes en temps réel

### Scalabilité

1. **Workers** : Augmentez les pools selon la charge
2. **Database Pools** : Dimensionnez selon le trafic peak
3. **CDN** : Utilisez plusieurs providers pour la redondance
4. **Alertes** : Surveillez les métriques de capacité

## 🔧 Dépannage

### Problèmes Courants

#### Load Balancer ne route pas correctement
```typescript
// Vérifier la santé des instances
const health = await loadBalancingService.getInstanceHealth();
console.log('Instance health:', health);

// Forcer un health check
await loadBalancingService.performHealthCheck();
```

#### Queue bloquée avec tâches en attente
```typescript
// Vérifier l'état des workers
const workers = aiQueueService.getWorkers();
console.log('Worker status:', workers.map(w => ({
  id: w.id,
  status: w.status,
  currentTasks: w.currentTasks
})));

// Redémarrer les workers si nécessaire
aiQueueService.stop();
await new Promise(resolve => setTimeout(resolve, 1000));
aiQueueService.start();
```

#### Connexions DB épuisées
```typescript
// Vérifier l'utilisation des pools
const stats = databasePoolingService.getStats();
console.log('Pool utilization:', stats);

// Libérer les connexions inactives
await databasePoolingService.cleanup();
```

---

*Guide complet pour maîtriser l'infrastructure EduAI Enhanced 🚀*
