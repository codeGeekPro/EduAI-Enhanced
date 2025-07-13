/**
 * ⚙️ Configuration Centrale pour les Améliorations Avancées
 * Paramètres pour WebSocket, API, Visualisations et Offline
 */

// Configuration WebSocket
export const WEBSOCKET_CONFIG = {
  baseUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8001/ws',
  endpoints: {
    chat: '/chat',
    learning: '/learning',
    analytics: '/analytics',
    collaboration: '/collaboration'
  },
  options: {
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    timeout: 5000,
    enableLogging: import.meta.env.DEV
  }
};

// Configuration API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  defaultCacheTime: 10 * 60 * 1000, // 10 minutes
  defaultStaleTime: 5 * 60 * 1000,   // 5 minutes
  endpoints: {
    learning: '/learning',
    progress: '/progress',
    analytics: '/analytics',
    ai: '/ai',
    users: '/users',
    courses: '/courses'
  }
};

// Configuration Offline/IndexedDB
export const OFFLINE_CONFIG = {
  dbName: 'EduAI_Enhanced_DB',
  dbVersion: 3,
  cachePolicies: {
    lessons: {
      maxAge: 24 * 60 * 60 * 1000,     // 24 heures
      maxSize: 50 * 1024 * 1024,       // 50MB
      priority: 'high',
      syncStrategy: 'immediate'
    },
    progress: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      maxSize: 10 * 1024 * 1024,       // 10MB
      priority: 'high',
      syncStrategy: 'background'
    },
    chats: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
      maxSize: 100 * 1024 * 1024,       // 100MB
      priority: 'medium',
      syncStrategy: 'background'
    },
    ai_responses: {
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 jours
      maxSize: 200 * 1024 * 1024,       // 200MB
      priority: 'medium',
      syncStrategy: 'background'
    },
    user_actions: {
      maxAge: 24 * 60 * 60 * 1000,      // 24 heures
      maxSize: 20 * 1024 * 1024,        // 20MB
      priority: 'low',
      syncStrategy: 'manual'
    }
  }
};

// Configuration Visualisations D3.js
export const D3_CONFIG = {
  network: {
    width: 800,
    height: 600,
    forceStrength: -300,
    linkDistance: 100,
    collisionRadius: 30,
    animationDuration: 300
  },
  progressChart: {
    width: 800,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 40 },
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B'
    }
  },
  skillRadar: {
    size: 300,
    margin: 40,
    gridLevels: 5,
    animationDuration: 500
  }
};

// Configuration Three.js
export const THREE_CONFIG = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 0, z: 50 }
  },
  renderer: {
    antialias: true,
    alpha: true,
    shadowMapEnabled: true,
    shadowMapType: 'PCFSoftShadowMap',
    toneMapping: 'ACESFilmicToneMapping',
    toneMappingExposure: 1
  },
  controls: {
    enableDamping: true,
    dampingFactor: 0.05,
    screenSpacePanning: false,
    minDistance: 10,
    maxDistance: 200
  },
  environments: {
    space: {
      backgroundColor: 0x000011,
      ambientLight: { color: 0x404040, intensity: 0.4 },
      directionalLight: { color: 0xffffff, intensity: 1, position: [10, 10, 5] },
      stars: { count: 10000, size: 2 }
    },
    underwater: {
      backgroundColor: 0x001133,
      ambientLight: { color: 0x404040, intensity: 0.4 },
      directionalLight: { color: 0x4499ff, intensity: 0.8, position: [0, 10, 0] },
      bubbles: { count: 50, size: 0.5 }
    },
    forest: {
      backgroundColor: 0x228833,
      ambientLight: { color: 0x404040, intensity: 0.4 },
      directionalLight: { color: 0xffdd88, intensity: 0.7, position: [5, 10, 5] },
      trees: { count: 30 }
    },
    city: {
      backgroundColor: 0x87CEEB,
      ambientLight: { color: 0x404040, intensity: 0.4 },
      directionalLight: { color: 0xffffff, intensity: 0.6, position: [10, 20, 10] },
      buildings: { count: 20 }
    }
  }
};

// Configuration Dashboard
export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 secondes
  maxRecentActions: 100,
  defaultTab: 'overview',
  autoSave: true,
  autoSaveInterval: 5000, // 5 secondes
  tabs: [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'network', label: 'Réseau de connaissances', icon: '🕸️' },
    { id: 'world3d', label: 'Monde 3D', icon: '🌍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ]
};

// Configuration Performance
export const PERFORMANCE_CONFIG = {
  enableMetrics: import.meta.env.DEV,
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  gc: {
    enabled: true,
    interval: 60000, // 1 minute
    threshold: 0.8   // 80% de la mémoire max
  },
  rendering: {
    targetFPS: 60,
    adaptiveQuality: true,
    lowPerformanceThreshold: 30,
    highPerformanceThreshold: 55
  }
};

// Configuration Sécurité
export const SECURITY_CONFIG = {
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 heures
  refreshThreshold: 5 * 60 * 1000,  // 5 minutes avant expiration
  maxFailedAttempts: 3,
  lockoutDuration: 15 * 60 * 1000,  // 15 minutes
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://eduai-enhanced.vercel.app'
  ],
  rateLimiting: {
    api: { windowMs: 15 * 60 * 1000, max: 100 },      // 100 req/15min
    websocket: { windowMs: 60 * 1000, max: 50 },      // 50 msg/min
    offline: { windowMs: 5 * 60 * 1000, max: 1000 }   // 1000 op/5min
  }
};

// Configuration Développement
export const DEV_CONFIG = {
  enableDebugMode: import.meta.env.DEV,
  verboseLogging: import.meta.env.DEV,
  mockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  skipAuthentication: import.meta.env.VITE_SKIP_AUTH === 'true',
  enableDevtools: import.meta.env.DEV,
  hotReload: {
    enabled: import.meta.env.DEV,
    port: 3001
  }
};

// Configuration Fonctionnalités
export const FEATURES_CONFIG = {
  websocket: {
    enabled: true,
    fallbackToPolling: true,
    pollingInterval: 5000
  },
  offline: {
    enabled: true,
    autoSync: true,
    syncOnConnect: true
  },
  visualizations: {
    d3: { enabled: true, animations: true },
    threejs: { enabled: true, webgl: true, webgpu: false },
    canvas2d: { enabled: true, fallback: true }
  },
  ai: {
    enabled: true,
    providers: ['openai', 'anthropic', 'local'],
    maxTokens: 4096,
    temperature: 0.7
  },
  analytics: {
    enabled: true,
    realtime: true,
    storage: 'indexeddb'
  }
};

// Export de la configuration complète
export const CONFIG = {
  websocket: WEBSOCKET_CONFIG,
  api: API_CONFIG,
  offline: OFFLINE_CONFIG,
  d3: D3_CONFIG,
  threejs: THREE_CONFIG,
  dashboard: DASHBOARD_CONFIG,
  performance: PERFORMANCE_CONFIG,
  security: SECURITY_CONFIG,
  dev: DEV_CONFIG,
  features: FEATURES_CONFIG
};

// Types TypeScript pour la configuration
export interface AppConfig {
  websocket: typeof WEBSOCKET_CONFIG;
  api: typeof API_CONFIG;
  offline: typeof OFFLINE_CONFIG;
  d3: typeof D3_CONFIG;
  threejs: typeof THREE_CONFIG;
  dashboard: typeof DASHBOARD_CONFIG;
  performance: typeof PERFORMANCE_CONFIG;
  security: typeof SECURITY_CONFIG;
  dev: typeof DEV_CONFIG;
  features: typeof FEATURES_CONFIG;
}

// Validation de la configuration
export const validateConfig = (): boolean => {
  try {
    // Vérifier les URLs
    new URL(API_CONFIG.baseURL);
    
    // Vérifier les valeurs numériques
    if (API_CONFIG.timeout <= 0) throw new Error('API timeout must be positive');
    if (OFFLINE_CONFIG.dbVersion <= 0) throw new Error('DB version must be positive');
    
    // Vérifier les configurations WebSocket
    if (!WEBSOCKET_CONFIG.baseUrl.startsWith('ws')) {
      throw new Error('WebSocket URL must start with ws:// or wss://');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Configuration invalide:', error);
    return false;
  }
};

// Initialisation de la configuration
export const initConfig = async (): Promise<AppConfig> => {
  console.log('⚙️ Initialisation de la configuration...');
  
  if (!validateConfig()) {
    throw new Error('Configuration invalide');
  }
  
  console.log('✅ Configuration validée');
  console.log('🔌 WebSocket:', WEBSOCKET_CONFIG.baseUrl);
  console.log('🌐 API:', API_CONFIG.baseURL);
  console.log('💾 Cache:', OFFLINE_CONFIG.dbName);
  console.log('🎮 Mode:', import.meta.env.DEV ? 'Développement' : 'Production');
  
  return CONFIG;
};

export default CONFIG;

// Ajout de la déclaration globale pour ImportMeta.env
interface ImportMetaEnv {
  VITE_WS_URL?: string;
  VITE_API_BASE_URL?: string;
  VITE_USE_MOCK_DATA?: string;
  VITE_SKIP_AUTH?: string;
  DEV?: boolean;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
