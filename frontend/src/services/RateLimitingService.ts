/**
 * ⚡ Service de Rate Limiting Avancé
 * Protection contre l'abus des endpoints IA avec algorithmes adaptatifs
 */

import { aiMetrics } from './AIMonitoring';

// Types pour le rate limiting
export interface RateLimit {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes
  burst?: number; // Rafale autorisée
  algorithm: 'sliding_window' | 'token_bucket' | 'leaky_bucket' | 'adaptive';
}

export interface RateLimitRule {
  id: string;
  name: string;
  pattern: string | RegExp; // Pattern de l'endpoint
  limits: {
    anonymous: RateLimit;
    authenticated: RateLimit;
    premium: RateLimit;
    enterprise: RateLimit;
  };
  priority: number;
  enabled: boolean;
  metadata: {
    description: string;
    costPerRequest?: number;
    computeIntensive?: boolean;
    aiModel?: string;
  };
}

export interface RateLimitState {
  count: number;
  tokens: number; // Pour token bucket
  lastRefill: Date;
  firstRequest: Date;
  requests: Date[]; // Pour sliding window
  blocked: boolean;
  blockedUntil?: Date;
  warnings: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // en secondes
  warning?: string;
  reason?: string;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  averageRequestsPerMinute: number;
  topBlockedEndpoints: Array<{
    endpoint: string;
    blocks: number;
    rate: number;
  }>;
  userStats: Array<{
    userId: string;
    requests: number;
    blocks: number;
    tier: string;
  }>;
}

export interface AdaptiveConfig {
  enabled: boolean;
  loadThreshold: number; // Seuil de charge pour déclencher l'adaptation
  adaptationFactor: number; // Facteur de réduction des limites
  recoveryTime: number; // Temps de récupération en ms
  minLimit: number; // Limite minimale
}

/**
 * 🛡️ Gestionnaire de Rate Limiting Intelligent
 */
export class RateLimitingService {
  private rules: Map<string, RateLimitRule> = new Map();
  private states: Map<string, RateLimitState> = new Map(); // Key: userId:endpoint
  private globalStats: RateLimitStats;
  private adaptiveConfig: AdaptiveConfig;
  private systemLoad = 0;
  private isInitialized = false;

  constructor() {
    this.globalStats = {
      totalRequests: 0,
      blockedRequests: 0,
      blockRate: 0,
      averageRequestsPerMinute: 0,
      topBlockedEndpoints: [],
      userStats: []
    };

    this.adaptiveConfig = {
      enabled: true,
      loadThreshold: 0.8,
      adaptationFactor: 0.5,
      recoveryTime: 5 * 60 * 1000, // 5 minutes
      minLimit: 10
    };

    this.initialize();
  }

  /**
   * 🚀 Initialisation du service
   */
  private async initialize(): Promise<void> {
    try {
      await this.setupDefaultRules();
      await this.loadFromStorage();
      this.startMonitoring();
      this.startCleanupScheduler();
      this.isInitialized = true;
      console.log('⚡ Service Rate Limiting initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation rate limiting:', error);
    }
  }

  /**
   * 🔧 Configuration des règles par défaut
   */
  private async setupDefaultRules(): Promise<void> {
    const defaultRules: RateLimitRule[] = [
      {
        id: 'ai_chat',
        name: 'Chat IA',
        pattern: '/api/ai/chat',
        limits: {
          anonymous: { windowMs: 60000, maxRequests: 5, algorithm: 'sliding_window' },
          authenticated: { windowMs: 60000, maxRequests: 20, algorithm: 'sliding_window' },
          premium: { windowMs: 60000, maxRequests: 100, algorithm: 'token_bucket', burst: 10 },
          enterprise: { windowMs: 60000, maxRequests: 500, algorithm: 'adaptive' }
        },
        priority: 1,
        enabled: true,
        metadata: {
          description: 'Conversations avec l\'IA',
          costPerRequest: 0.001,
          computeIntensive: true,
          aiModel: 'gpt-4'
        }
      },
      {
        id: 'ai_image_generation',
        name: 'Génération d\'images IA',
        pattern: '/api/ai/images/generate',
        limits: {
          anonymous: { windowMs: 300000, maxRequests: 1, algorithm: 'leaky_bucket' },
          authenticated: { windowMs: 300000, maxRequests: 3, algorithm: 'leaky_bucket' },
          premium: { windowMs: 300000, maxRequests: 10, algorithm: 'token_bucket' },
          enterprise: { windowMs: 300000, maxRequests: 50, algorithm: 'adaptive' }
        },
        priority: 2,
        enabled: true,
        metadata: {
          description: 'Génération d\'images avec DALL-E',
          costPerRequest: 0.02,
          computeIntensive: true,
          aiModel: 'dall-e-3'
        }
      },
      {
        id: 'ai_embeddings',
        name: 'Vectorisation',
        pattern: '/api/ai/embeddings',
        limits: {
          anonymous: { windowMs: 60000, maxRequests: 10, algorithm: 'sliding_window' },
          authenticated: { windowMs: 60000, maxRequests: 50, algorithm: 'sliding_window' },
          premium: { windowMs: 60000, maxRequests: 200, algorithm: 'token_bucket' },
          enterprise: { windowMs: 60000, maxRequests: 1000, algorithm: 'adaptive' }
        },
        priority: 3,
        enabled: true,
        metadata: {
          description: 'Création d\'embeddings vectoriels',
          costPerRequest: 0.0001,
          computeIntensive: false,
          aiModel: 'text-embedding-ada-002'
        }
      },
      {
        id: 'ai_transcription',
        name: 'Transcription Audio',
        pattern: '/api/ai/transcribe',
        limits: {
          anonymous: { windowMs: 600000, maxRequests: 1, algorithm: 'leaky_bucket' },
          authenticated: { windowMs: 600000, maxRequests: 5, algorithm: 'leaky_bucket' },
          premium: { windowMs: 600000, maxRequests: 20, algorithm: 'token_bucket' },
          enterprise: { windowMs: 600000, maxRequests: 100, algorithm: 'adaptive' }
        },
        priority: 4,
        enabled: true,
        metadata: {
          description: 'Transcription audio vers texte',
          costPerRequest: 0.006,
          computeIntensive: true,
          aiModel: 'whisper-1'
        }
      },
      {
        id: 'general_api',
        name: 'API Générale',
        pattern: '/api/*',
        limits: {
          anonymous: { windowMs: 60000, maxRequests: 100, algorithm: 'sliding_window' },
          authenticated: { windowMs: 60000, maxRequests: 1000, algorithm: 'sliding_window' },
          premium: { windowMs: 60000, maxRequests: 5000, algorithm: 'token_bucket' },
          enterprise: { windowMs: 60000, maxRequests: 20000, algorithm: 'adaptive' }
        },
        priority: 10,
        enabled: true,
        metadata: {
          description: 'Endpoints API généraux',
          costPerRequest: 0,
          computeIntensive: false
        }
      }
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  /**
   * 🔍 Vérification des limites de taux
   */
  async checkRateLimit(
    endpoint: string,
    userId?: string,
    userTier: 'anonymous' | 'authenticated' | 'premium' | 'enterprise' = 'anonymous'
  ): Promise<RateLimitResult> {
    const startTime = Date.now();

    try {
      // Trouver la règle applicable
      const rule = this.findApplicableRule(endpoint);
      if (!rule || !rule.enabled) {
        return {
          allowed: true,
          limit: Infinity,
          remaining: Infinity,
          resetTime: new Date(Date.now() + 60000)
        };
      }

      // Obtenir la limite pour le tier de l'utilisateur
      const limit = rule.limits[userTier];
      const stateKey = `${userId || 'anonymous'}:${rule.id}`;

      // Obtenir ou créer l'état
      let state = this.states.get(stateKey);
      if (!state) {
        state = this.createInitialState();
        this.states.set(stateKey, state);
      }

      // Appliquer l'adaptation si nécessaire
      const adaptedLimit = this.adaptiveConfig.enabled 
        ? this.applyAdaptiveLimit(limit, rule)
        : limit;

      // Vérifier selon l'algorithme
      const result = await this.checkAlgorithm(state, adaptedLimit, rule);

      // Mettre à jour les statistiques
      this.updateStats(endpoint, userId, userTier, result.allowed);

      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'rate_limit',
        operation: 'check',
        duration: Date.now() - startTime,
        success: result.allowed,
        metadata: {
          endpoint,
          userId,
          userTier,
          ruleId: rule.id,
          algorithm: adaptedLimit.algorithm,
          remaining: result.remaining
        }
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur vérification rate limit:', error);
      
      // En cas d'erreur, permettre la requête mais l'enregistrer
      aiMetrics.recordMetric({
        service: 'rate_limit',
        operation: 'check',
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      return {
        allowed: true,
        limit: 0,
        remaining: 0,
        resetTime: new Date(),
        warning: 'Rate limiting service error'
      };
    }
  }

  /**
   * 🧮 Algorithmes de rate limiting
   */
  private async checkAlgorithm(
    state: RateLimitState,
    limit: RateLimit,
    rule: RateLimitRule
  ): Promise<RateLimitResult> {
    const now = new Date();

    switch (limit.algorithm) {
      case 'sliding_window':
        return this.checkSlidingWindow(state, limit, now);
      
      case 'token_bucket':
        return this.checkTokenBucket(state, limit, now);
      
      case 'leaky_bucket':
        return this.checkLeakyBucket(state, limit, now);
      
      case 'adaptive':
        return this.checkAdaptive(state, limit, now, rule);
      
      default:
        throw new Error(`Algorithme inconnu: ${limit.algorithm}`);
    }
  }

  /**
   * 🪟 Sliding Window Algorithm
   */
  private checkSlidingWindow(state: RateLimitState, limit: RateLimit, now: Date): RateLimitResult {
    const windowStart = new Date(now.getTime() - limit.windowMs);
    
    // Nettoyer les requêtes anciennes
    state.requests = state.requests.filter(req => req >= windowStart);
    
    const currentCount = state.requests.length;
    const allowed = currentCount < limit.maxRequests;
    
    if (allowed) {
      state.requests.push(now);
    }
    
    const resetTime = new Date(Math.min(...state.requests.map(r => r.getTime())) + limit.windowMs);
    
    return {
      allowed,
      limit: limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - currentCount - (allowed ? 1 : 0)),
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil((resetTime.getTime() - now.getTime()) / 1000)
    };
  }

  /**
   * 🪣 Token Bucket Algorithm
   */
  private checkTokenBucket(state: RateLimitState, limit: RateLimit, now: Date): RateLimitResult {
    const timePassed = now.getTime() - state.lastRefill.getTime();
    const tokensToAdd = Math.floor(timePassed / limit.windowMs * limit.maxRequests);
    
    // Ajouter des tokens
    state.tokens = Math.min(limit.maxRequests, state.tokens + tokensToAdd);
    state.lastRefill = now;
    
    // Vérifier la rafale si configurée
    const maxTokens = limit.burst ? Math.min(limit.burst, state.tokens + limit.maxRequests) : limit.maxRequests;
    const allowed = state.tokens > 0 && state.tokens <= maxTokens;
    
    if (allowed) {
      state.tokens--;
    }
    
    const nextRefill = new Date(now.getTime() + limit.windowMs);
    
    return {
      allowed,
      limit: limit.maxRequests,
      remaining: state.tokens,
      resetTime: nextRefill,
      retryAfter: allowed ? undefined : Math.ceil(limit.windowMs / limit.maxRequests / 1000)
    };
  }

  /**
   * 🕳️ Leaky Bucket Algorithm
   */
  private checkLeakyBucket(state: RateLimitState, limit: RateLimit, now: Date): RateLimitResult {
    const timePassed = now.getTime() - state.lastRefill.getTime();
    const leakRate = limit.maxRequests / limit.windowMs; // requêtes par ms
    const leaked = Math.floor(timePassed * leakRate);
    
    // Faire fuir le seau
    state.count = Math.max(0, state.count - leaked);
    state.lastRefill = now;
    
    const allowed = state.count < limit.maxRequests;
    
    if (allowed) {
      state.count++;
    }
    
    const timeToEmpty = state.count / leakRate;
    const resetTime = new Date(now.getTime() + timeToEmpty);
    
    return {
      allowed,
      limit: limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - state.count),
      resetTime,
      retryAfter: allowed ? undefined : Math.ceil(timeToEmpty / 1000)
    };
  }

  /**
   * 🧠 Adaptive Algorithm
   */
  private checkAdaptive(state: RateLimitState, limit: RateLimit, now: Date, rule: RateLimitRule): RateLimitResult {
    // Utiliser sliding window comme base
    const baseResult = this.checkSlidingWindow(state, limit, now);
    
    // Ajuster selon la charge système et la priorité
    const loadFactor = this.systemLoad > this.adaptiveConfig.loadThreshold 
      ? this.adaptiveConfig.adaptationFactor 
      : 1;
    
    const priorityFactor = 1 / rule.priority; // Plus la priorité est élevée, plus le facteur est grand
    const adaptedLimit = Math.max(
      this.adaptiveConfig.minLimit,
      Math.floor(limit.maxRequests * loadFactor * priorityFactor)
    );
    
    if (adaptedLimit < limit.maxRequests) {
      baseResult.warning = `Limite réduite à ${adaptedLimit} due à la charge système`;
      baseResult.limit = adaptedLimit;
      baseResult.allowed = state.requests.length < adaptedLimit;
    }
    
    return baseResult;
  }

  /**
   * 📊 Mise à jour des statistiques
   */
  private updateStats(endpoint: string, userId?: string, userTier?: string, allowed?: boolean): void {
    this.globalStats.totalRequests++;
    
    if (!allowed) {
      this.globalStats.blockedRequests++;
    }
    
    this.globalStats.blockRate = this.globalStats.blockedRequests / this.globalStats.totalRequests;
    
    // Mettre à jour les stats utilisateur
    if (userId && userTier) {
      let userStat = this.globalStats.userStats.find(u => u.userId === userId);
      if (!userStat) {
        userStat = { userId, requests: 0, blocks: 0, tier: userTier };
        this.globalStats.userStats.push(userStat);
      }
      
      userStat.requests++;
      if (!allowed) {
        userStat.blocks++;
      }
    }
    
    // Garder seulement les 1000 dernières stats utilisateur
    if (this.globalStats.userStats.length > 1000) {
      this.globalStats.userStats = this.globalStats.userStats
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 1000);
    }
  }

  /**
   * 🎯 Trouver la règle applicable
   */
  private findApplicableRule(endpoint: string): RateLimitRule | undefined {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => {
        if (typeof rule.pattern === 'string') {
          return endpoint.includes(rule.pattern) || 
                 endpoint.match(rule.pattern.replace(/\*/g, '.*'));
        } else {
          return rule.pattern.test(endpoint);
        }
      })
      .sort((a, b) => a.priority - b.priority);
    
    return applicableRules[0];
  }

  /**
   * 🔧 Adapter les limites selon la charge
   */
  private applyAdaptiveLimit(limit: RateLimit, rule: RateLimitRule): RateLimit {
    if (!this.adaptiveConfig.enabled || this.systemLoad < this.adaptiveConfig.loadThreshold) {
      return limit;
    }
    
    const adaptationFactor = Math.max(
      this.adaptiveConfig.minLimit / limit.maxRequests,
      this.adaptiveConfig.adaptationFactor
    );
    
    return {
      ...limit,
      maxRequests: Math.max(
        this.adaptiveConfig.minLimit,
        Math.floor(limit.maxRequests * adaptationFactor)
      )
    };
  }

  /**
   * 🏗️ Créer un état initial
   */
  private createInitialState(): RateLimitState {
    const now = new Date();
    return {
      count: 0,
      tokens: 0,
      lastRefill: now,
      firstRequest: now,
      requests: [],
      blocked: false,
      warnings: 0
    };
  }

  /**
   * 📈 Surveiller la charge système
   */
  private startMonitoring(): void {
    // Simuler la surveillance de la charge système
    setInterval(() => {
      // Calculer la charge basée sur les métriques récentes
      const recentMetrics = aiMetrics.getPerformanceStats({
        start: new Date(Date.now() - 5 * 60 * 1000), // 5 dernières minutes
        end: new Date()
      });
      
      // Facteurs de charge
      const errorRateFactor = recentMetrics.errorCount / Math.max(1, recentMetrics.totalRequests);
      const latencyFactor = Math.min(1, recentMetrics.averageLatency / 5000); // Normaliser sur 5s
      const costFactor = Math.min(1, recentMetrics.totalCost / 10); // Normaliser sur $10
      
      this.systemLoad = (errorRateFactor + latencyFactor + costFactor) / 3;
      
      console.log(`📊 Charge système: ${(this.systemLoad * 100).toFixed(1)}%`);
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * 🧹 Nettoyage périodique
   */
  private startCleanupScheduler(): void {
    setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 heures
      
      // Nettoyer les états anciens
      for (const [key, state] of this.states.entries()) {
        if (state.lastRefill < cutoff) {
          this.states.delete(key);
        }
      }
      
      // Sauvegarder les stats
      this.saveToStorage();
      
      console.log(`🧹 Nettoyage rate limiting: ${this.states.size} états actifs`);
    }, 60 * 60 * 1000); // Toutes les heures
  }

  /**
   * 💾 Persistance
   */
  private saveToStorage(): void {
    try {
      const data = {
        stats: this.globalStats,
        adaptiveConfig: this.adaptiveConfig,
        systemLoad: this.systemLoad,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('eduai_rate_limiting', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur sauvegarde rate limiting:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('eduai_rate_limiting');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      if (data.stats) {
        this.globalStats = data.stats;
      }
      
      if (data.adaptiveConfig) {
        this.adaptiveConfig = { ...this.adaptiveConfig, ...data.adaptiveConfig };
      }
      
      if (typeof data.systemLoad === 'number') {
        this.systemLoad = data.systemLoad;
      }
      
      console.log('💾 Configuration rate limiting chargée');
    } catch (error) {
      console.error('❌ Erreur chargement rate limiting:', error);
    }
  }

  /**
   * 📊 API publique
   */
  getStats(): RateLimitStats {
    return { ...this.globalStats };
  }

  getRules(): RateLimitRule[] {
    return Array.from(this.rules.values());
  }

  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.id, rule);
    console.log(`✅ Règle ajoutée: ${rule.name}`);
  }

  updateRule(ruleId: string, updates: Partial<RateLimitRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    
    this.rules.set(ruleId, { ...rule, ...updates });
    console.log(`✅ Règle mise à jour: ${rule.name}`);
    return true;
  }

  removeRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      console.log(`🗑️ Règle supprimée: ${ruleId}`);
    }
    return deleted;
  }

  clearUserState(userId: string): void {
    const keysToDelete = Array.from(this.states.keys())
      .filter(key => key.startsWith(`${userId}:`));
    
    keysToDelete.forEach(key => this.states.delete(key));
    console.log(`🗑️ État utilisateur effacé: ${userId} (${keysToDelete.length} entrées)`);
  }

  getSystemLoad(): number {
    return this.systemLoad;
  }

  updateAdaptiveConfig(config: Partial<AdaptiveConfig>): void {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
    console.log('🔧 Configuration adaptative mise à jour:', this.adaptiveConfig);
  }

  // Méthodes pour les tests et le débogage
  simulateLoad(load: number): void {
    this.systemLoad = Math.max(0, Math.min(1, load));
    console.log(`🧪 Simulation charge: ${(this.systemLoad * 100).toFixed(1)}%`);
  }

  resetStats(): void {
    this.globalStats = {
      totalRequests: 0,
      blockedRequests: 0,
      blockRate: 0,
      averageRequestsPerMinute: 0,
      topBlockedEndpoints: [],
      userStats: []
    };
    console.log('🔄 Statistiques rate limiting réinitialisées');
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

// Instance globale
export const rateLimitingService = new RateLimitingService();
