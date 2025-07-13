/**
 * ⚖️ Service de Load Balancing Intelligent pour IA
 * Distribution optimale des requêtes entre instances IA multiples
 */

import { aiMetrics } from './AIMonitoring';

// Types pour le load balancing
export interface AIInstance {
  id: string;
  url: string;
  provider: 'openai' | 'openrouter' | 'anthropic' | 'cohere' | 'local';
  models: string[];
  status: 'active' | 'inactive' | 'overloaded' | 'maintenance';
  priority: number; // 1-10, plus élevé = priorité plus haute
  capacity: {
    maxConcurrent: number;
    currentLoad: number;
    queueSize: number;
  };
  performance: {
    averageLatency: number;
    successRate: number;
    costPerToken: number;
    tokensPerSecond: number;
  };
  limits: {
    rpmLimit: number; // Requests per minute
    tpmLimit: number; // Tokens per minute
    dailyLimit: number;
  };
  health: {
    lastHealthCheck: Date;
    consecutiveFailures: number;
    uptime: number;
  };
  metadata: {
    region: string;
    capabilities: string[];
    supportedFormats: string[];
  };
}

export interface LoadBalancingStrategy {
  type: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 
        'least_response_time' | 'cpu_based' | 'cost_optimized' | 'adaptive';
  config: {
    weights?: Record<string, number>;
    healthCheckInterval?: number;
    failoverThreshold?: number;
    adaptiveFactors?: {
      latencyWeight: number;
      costWeight: number;
      successRateWeight: number;
      capacityWeight: number;
    };
  };
}

export interface RequestContext {
  model: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  expectedTokens: number;
  maxLatency?: number;
  costBudget?: number;
  retryable: boolean;
  userId: string;
  sessionId?: string;
}

export interface BalancingResult {
  instance: AIInstance;
  estimatedLatency: number;
  estimatedCost: number;
  confidence: number; // 0-1
  fallbackInstances: AIInstance[];
  reason: string;
}

/**
 * 🎯 Gestionnaire de Load Balancing IA
 */
export class LoadBalancingService {
  private instances: Map<string, AIInstance> = new Map();
  private strategy: LoadBalancingStrategy;
  private roundRobinIndex = 0;
  private healthCheckInterval?: NodeJS.Timeout;
  private performanceHistory: Map<string, Array<{
    timestamp: Date;
    latency: number;
    success: boolean;
    cost: number;
  }>> = new Map();

  constructor(strategy?: LoadBalancingStrategy) {
    this.strategy = strategy || {
      type: 'adaptive',
      config: {
        healthCheckInterval: 30000,
        failoverThreshold: 3,
        adaptiveFactors: {
          latencyWeight: 0.3,
          costWeight: 0.2,
          successRateWeight: 0.3,
          capacityWeight: 0.2
        }
      }
    };

    this.initialize();
  }

  /**
   * 🚀 Initialisation du service
   */
  private async initialize(): Promise<void> {
    try {
      await this.setupDefaultInstances();
      this.startHealthChecking();
      console.log('⚖️ Service Load Balancing initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation load balancing:', error);
    }
  }

  /**
   * 🔧 Configuration des instances par défaut
   */
  private async setupDefaultInstances(): Promise<void> {
    const defaultInstances: AIInstance[] = [
      {
        id: 'openai_primary',
        url: 'https://api.openai.com/v1',
        provider: 'openai',
        models: ['gpt-4', 'gpt-3.5-turbo', 'text-embedding-ada-002', 'whisper-1'],
        status: 'active',
        priority: 8,
        capacity: {
          maxConcurrent: 10,
          currentLoad: 0,
          queueSize: 0
        },
        performance: {
          averageLatency: 1200,
          successRate: 0.99,
          costPerToken: 0.00003,
          tokensPerSecond: 50
        },
        limits: {
          rpmLimit: 3500,
          tpmLimit: 90000,
          dailyLimit: 1000000
        },
        health: {
          lastHealthCheck: new Date(),
          consecutiveFailures: 0,
          uptime: 0.999
        },
        metadata: {
          region: 'us-east-1',
          capabilities: ['chat', 'embeddings', 'transcription', 'vision'],
          supportedFormats: ['text', 'image', 'audio']
        }
      },
      {
        id: 'openrouter_primary',
        url: 'https://openrouter.ai/api/v1',
        provider: 'openrouter',
        models: ['anthropic/claude-3-opus', 'meta-llama/llama-2-70b-chat', 'mistralai/mixtral-8x7b-instruct'],
        status: 'active',
        priority: 7,
        capacity: {
          maxConcurrent: 8,
          currentLoad: 0,
          queueSize: 0
        },
        performance: {
          averageLatency: 1800,
          successRate: 0.97,
          costPerToken: 0.000015,
          tokensPerSecond: 30
        },
        limits: {
          rpmLimit: 2000,
          tpmLimit: 50000,
          dailyLimit: 500000
        },
        health: {
          lastHealthCheck: new Date(),
          consecutiveFailures: 0,
          uptime: 0.995
        },
        metadata: {
          region: 'us-west-2',
          capabilities: ['chat', 'reasoning', 'creative-writing'],
          supportedFormats: ['text']
        }
      },
      {
        id: 'anthropic_backup',
        url: 'https://api.anthropic.com',
        provider: 'anthropic',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
        status: 'active',
        priority: 6,
        capacity: {
          maxConcurrent: 5,
          currentLoad: 0,
          queueSize: 0
        },
        performance: {
          averageLatency: 2200,
          successRate: 0.98,
          costPerToken: 0.000075,
          tokensPerSecond: 25
        },
        limits: {
          rpmLimit: 1000,
          tpmLimit: 40000,
          dailyLimit: 200000
        },
        health: {
          lastHealthCheck: new Date(),
          consecutiveFailures: 0,
          uptime: 0.992
        },
        metadata: {
          region: 'us-east-1',
          capabilities: ['chat', 'analysis', 'reasoning'],
          supportedFormats: ['text']
        }
      }
    ];

    for (const instance of defaultInstances) {
      this.instances.set(instance.id, instance);
      this.performanceHistory.set(instance.id, []);
    }
  }

  /**
   * 🎯 Sélection intelligente d'instance
   */
  async selectInstance(context: RequestContext): Promise<BalancingResult> {
    const startTime = Date.now();

    try {
      // Filtrer les instances compatibles
      const compatibleInstances = this.getCompatibleInstances(context);
      
      if (compatibleInstances.length === 0) {
        throw new Error('Aucune instance compatible trouvée');
      }

      // Appliquer la stratégie de sélection
      const selectedInstance = await this.applyStrategy(compatibleInstances, context);
      
      // Calculer les métriques de prédiction
      const estimatedLatency = this.estimateLatency(selectedInstance, context);
      const estimatedCost = this.estimateCost(selectedInstance, context);
      const confidence = this.calculateConfidence(selectedInstance, context);
      
      // Préparer les instances de fallback
      const fallbackInstances = compatibleInstances
        .filter(instance => instance.id !== selectedInstance.id)
        .sort((a, b) => this.calculateScore(b, context) - this.calculateScore(a, context))
        .slice(0, 2);

      const result: BalancingResult = {
        instance: selectedInstance,
        estimatedLatency,
        estimatedCost,
        confidence,
        fallbackInstances,
        reason: this.getSelectionReason(selectedInstance, context)
      };

      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'load_balancer',
        operation: 'select_instance',
        duration: Date.now() - startTime,
        success: true,
        metadata: {
          selectedInstanceId: selectedInstance.id,
          strategy: this.strategy.type,
          compatibleInstances: compatibleInstances.length,
          estimatedLatency,
          estimatedCost,
          confidence
        }
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur sélection instance:', error);
      
      aiMetrics.recordMetric({
        service: 'load_balancer',
        operation: 'select_instance',
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      throw error;
    }
  }

  /**
   * 🔍 Instances compatibles
   */
  private getCompatibleInstances(context: RequestContext): AIInstance[] {
    return Array.from(this.instances.values()).filter(instance => {
      // Vérifier le statut
      if (instance.status !== 'active') return false;
      
      // Vérifier le modèle supporté
      if (!instance.models.includes(context.model)) return false;
      
      // Vérifier la capacité
      if (instance.capacity.currentLoad >= instance.capacity.maxConcurrent) return false;
      
      // Vérifier les limites
      if (instance.limits.rpmLimit <= 0 || instance.limits.tpmLimit <= 0) return false;
      
      // Vérifier la santé
      if (instance.health.consecutiveFailures >= 3) return false;
      
      return true;
    });
  }

  /**
   * 🧮 Application de la stratégie
   */
  private async applyStrategy(instances: AIInstance[], context: RequestContext): Promise<AIInstance> {
    switch (this.strategy.type) {
      case 'round_robin':
        return this.roundRobinSelection(instances);
      
      case 'weighted_round_robin':
        return this.weightedRoundRobinSelection(instances);
      
      case 'least_connections':
        return this.leastConnectionsSelection(instances);
      
      case 'least_response_time':
        return this.leastResponseTimeSelection(instances);
      
      case 'cost_optimized':
        return this.costOptimizedSelection(instances, context);
      
      case 'adaptive':
        return this.adaptiveSelection(instances, context);
      
      default:
        return instances[0];
    }
  }

  /**
   * 🔄 Round Robin
   */
  private roundRobinSelection(instances: AIInstance[]): AIInstance {
    const instance = instances[this.roundRobinIndex % instances.length];
    this.roundRobinIndex++;
    return instance;
  }

  /**
   * ⚖️ Weighted Round Robin
   */
  private weightedRoundRobinSelection(instances: AIInstance[]): AIInstance {
    const weights = this.strategy.config.weights || {};
    let totalWeight = 0;
    
    for (const instance of instances) {
      totalWeight += weights[instance.id] || instance.priority;
    }
    
    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      const weight = weights[instance.id] || instance.priority;
      random -= weight;
      if (random <= 0) {
        return instance;
      }
    }
    
    return instances[0];
  }

  /**
   * 🔗 Least Connections
   */
  private leastConnectionsSelection(instances: AIInstance[]): AIInstance {
    return instances.reduce((min, current) => 
      current.capacity.currentLoad < min.capacity.currentLoad ? current : min
    );
  }

  /**
   * ⚡ Least Response Time
   */
  private leastResponseTimeSelection(instances: AIInstance[]): AIInstance {
    return instances.reduce((fastest, current) => 
      current.performance.averageLatency < fastest.performance.averageLatency ? current : fastest
    );
  }

  /**
   * 💰 Cost Optimized
   */
  private costOptimizedSelection(instances: AIInstance[], context: RequestContext): AIInstance {
    return instances.reduce((cheapest, current) => {
      const currentCost = this.estimateCost(current, context);
      const cheapestCost = this.estimateCost(cheapest, context);
      return currentCost < cheapestCost ? current : cheapest;
    });
  }

  /**
   * 🧠 Adaptive Selection
   */
  private adaptiveSelection(instances: AIInstance[], context: RequestContext): AIInstance {
    const factors = this.strategy.config.adaptiveFactors!;
    
    return instances.reduce((best, current) => {
      const currentScore = this.calculateScore(current, context, factors);
      const bestScore = this.calculateScore(best, context, factors);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * 📊 Calcul du score adaptatif
   */
  private calculateScore(
    instance: AIInstance, 
    context: RequestContext,
    factors?: { latencyWeight: number; costWeight: number; successRateWeight: number; capacityWeight: number; }
  ): number {
    const f = factors || this.strategy.config.adaptiveFactors!;
    
    // Normaliser les métriques (0-1, plus haut = meilleur)
    const latencyScore = Math.max(0, 1 - (instance.performance.averageLatency / 5000));
    const costScore = Math.max(0, 1 - (instance.performance.costPerToken / 0.0001));
    const successScore = instance.performance.successRate;
    const capacityScore = Math.max(0, 1 - (instance.capacity.currentLoad / instance.capacity.maxConcurrent));
    
    // Ajustements selon la priorité et le contexte
    const priorityMultiplier = instance.priority / 10;
    const contextMultiplier = this.getContextMultiplier(instance, context);
    
    const score = (
      latencyScore * f.latencyWeight +
      costScore * f.costWeight +
      successScore * f.successRateWeight +
      capacityScore * f.capacityWeight
    ) * priorityMultiplier * contextMultiplier;
    
    return score;
  }

  /**
   * 🎯 Multiplicateur contextuel
   */
  private getContextMultiplier(instance: AIInstance, context: RequestContext): number {
    let multiplier = 1;
    
    // Priorité utilisateur
    switch (context.priority) {
      case 'critical':
        multiplier *= instance.priority >= 8 ? 1.5 : 0.5;
        break;
      case 'high':
        multiplier *= instance.priority >= 6 ? 1.2 : 0.8;
        break;
      case 'low':
        multiplier *= instance.priority <= 4 ? 1.3 : 1;
        break;
    }
    
    // Budget de latence
    if (context.maxLatency && instance.performance.averageLatency > context.maxLatency) {
      multiplier *= 0.3;
    }
    
    // Budget de coût
    if (context.costBudget) {
      const estimatedCost = this.estimateCost(instance, context);
      if (estimatedCost > context.costBudget) {
        multiplier *= 0.2;
      }
    }
    
    return multiplier;
  }

  /**
   * 📈 Estimation de latence
   */
  private estimateLatency(instance: AIInstance, context: RequestContext): number {
    const baseLatency = instance.performance.averageLatency;
    const loadFactor = 1 + (instance.capacity.currentLoad / instance.capacity.maxConcurrent) * 0.5;
    const tokenFactor = Math.max(1, context.expectedTokens / 1000);
    
    return Math.round(baseLatency * loadFactor * tokenFactor);
  }

  /**
   * 💵 Estimation de coût
   */
  private estimateCost(instance: AIInstance, context: RequestContext): number {
    return instance.performance.costPerToken * context.expectedTokens;
  }

  /**
   * 🎯 Calcul de confiance
   */
  private calculateConfidence(instance: AIInstance, context: RequestContext): number {
    let confidence = instance.performance.successRate;
    
    // Réduire la confiance si l'instance est surchargée
    const loadRatio = instance.capacity.currentLoad / instance.capacity.maxConcurrent;
    confidence *= Math.max(0.5, 1 - loadRatio);
    
    // Réduire la confiance si des échecs récents
    if (instance.health.consecutiveFailures > 0) {
      confidence *= Math.max(0.3, 1 - (instance.health.consecutiveFailures / 10));
    }
    
    // Historique de performance
    const history = this.performanceHistory.get(instance.id) || [];
    if (history.length >= 10) {
      const recentSuccessRate = history.slice(-10).filter(h => h.success).length / 10;
      confidence = (confidence + recentSuccessRate) / 2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 📝 Raison de sélection
   */
  private getSelectionReason(instance: AIInstance, context: RequestContext): string {
    const reasons = [];
    
    reasons.push(`Stratégie: ${this.strategy.type}`);
    reasons.push(`Priorité: ${instance.priority}/10`);
    reasons.push(`Charge: ${instance.capacity.currentLoad}/${instance.capacity.maxConcurrent}`);
    reasons.push(`Succès: ${(instance.performance.successRate * 100).toFixed(1)}%`);
    reasons.push(`Latence: ${instance.performance.averageLatency}ms`);
    
    if (context.priority !== 'normal') {
      reasons.push(`Priorité requête: ${context.priority}`);
    }
    
    return reasons.join(', ');
  }

  /**
   * 📊 Surveillance de santé
   */
  private startHealthChecking(): void {
    const interval = this.strategy.config.healthCheckInterval || 30000;
    
    this.healthCheckInterval = setInterval(async () => {
      for (const instance of this.instances.values()) {
        await this.checkInstanceHealth(instance);
      }
    }, interval);
  }

  /**
   * 🩺 Vérification de santé d'instance
   */
  private async checkInstanceHealth(instance: AIInstance): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simuler un health check (dans un vrai cas, ping l'API)
      const isHealthy = Math.random() > 0.05; // 95% de succès
      const latency = Date.now() - startTime;
      
      if (isHealthy) {
        instance.health.consecutiveFailures = 0;
        instance.performance.averageLatency = 
          (instance.performance.averageLatency * 0.9) + (latency * 0.1);
        
        if (instance.status === 'inactive') {
          instance.status = 'active';
          console.log(`✅ Instance récupérée: ${instance.id}`);
        }
      } else {
        instance.health.consecutiveFailures++;
        
        if (instance.health.consecutiveFailures >= (this.strategy.config.failoverThreshold || 3)) {
          instance.status = 'inactive';
          console.log(`❌ Instance désactivée: ${instance.id}`);
        }
      }
      
      instance.health.lastHealthCheck = new Date();
      
    } catch (error) {
      console.error(`❌ Erreur health check ${instance.id}:`, error);
      instance.health.consecutiveFailures++;
    }
  }

  /**
   * 📈 Enregistrement de performance
   */
  recordPerformance(instanceId: string, latency: number, success: boolean, cost: number): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    // Mettre à jour les métriques de l'instance
    instance.performance.averageLatency = 
      (instance.performance.averageLatency * 0.9) + (latency * 0.1);
    
    const currentSuccessRate = instance.performance.successRate;
    instance.performance.successRate = 
      (currentSuccessRate * 0.95) + (success ? 0.05 : 0);
    
    // Ajouter à l'historique
    const history = this.performanceHistory.get(instanceId) || [];
    history.push({
      timestamp: new Date(),
      latency,
      success,
      cost
    });
    
    // Garder seulement les 100 dernières mesures
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.performanceHistory.set(instanceId, history);
  }

  /**
   * 🔧 Mettre à jour la charge
   */
  updateInstanceLoad(instanceId: string, loadDelta: number): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    instance.capacity.currentLoad = Math.max(0, instance.capacity.currentLoad + loadDelta);
  }

  /**
   * 📊 API publique
   */
  getInstances(): AIInstance[] {
    return Array.from(this.instances.values());
  }

  getActiveInstances(): AIInstance[] {
    return Array.from(this.instances.values()).filter(i => i.status === 'active');
  }

  getInstanceStats(instanceId: string) {
    const instance = this.instances.get(instanceId);
    const history = this.performanceHistory.get(instanceId) || [];
    
    return {
      instance,
      history: history.slice(-20), // 20 dernières mesures
      currentScore: instance ? this.calculateScore(instance, {
        model: 'gpt-4',
        priority: 'normal',
        expectedTokens: 1000,
        retryable: true,
        userId: 'test'
      }) : 0
    };
  }

  addInstance(instance: AIInstance): void {
    this.instances.set(instance.id, instance);
    this.performanceHistory.set(instance.id, []);
    console.log(`✅ Instance ajoutée: ${instance.id}`);
  }

  removeInstance(instanceId: string): boolean {
    const deleted = this.instances.delete(instanceId);
    this.performanceHistory.delete(instanceId);
    
    if (deleted) {
      console.log(`🗑️ Instance supprimée: ${instanceId}`);
    }
    
    return deleted;
  }

  updateStrategy(strategy: LoadBalancingStrategy): void {
    this.strategy = strategy;
    console.log('🔧 Stratégie load balancing mise à jour:', strategy.type);
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Instance globale
export const loadBalancingService = new LoadBalancingService();
