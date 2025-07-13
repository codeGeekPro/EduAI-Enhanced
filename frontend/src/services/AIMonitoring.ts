/**
 * 📊 Monitoring Avancé des Performances IA
 * Métriques détaillées pour les services d'intelligence artificielle
 */

// Types pour le monitoring IA
export interface AIMetric {
  id: string;
  timestamp: Date;
  service: 'openai' | 'anthropic' | 'local' | 'embeddings' | 'rag' | 'auth' | 'rate_limit' | 'validation' | 'encryption';
  operation: string;
  model?: string;
  duration: number; // en millisecondes
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number; // en USD
  success: boolean;
  error?: string;
  metadata?: {
    userId?: string;
    sessionId?: string;
    requestSize?: number;
    responseSize?: number;
    cacheHit?: boolean;
    quality?: 'excellent' | 'good' | 'poor';
    confidence?: number;
    // Champs additionnels pour les services de sécurité
    algorithm?: string;
    endpoint?: string;
    userTier?: string;
    ruleId?: string;
    remaining?: number;
    mfaUsed?: boolean;
    ttl?: number;
    age?: number;
    // Champs pour les métriques de cache
    hitCount?: number;
    executionTime?: number;
    dataSize?: number;
    memoryUsage?: number;
    cost?: number;
    tokens?: number;
    // Champs pour le chiffrement
    classification?: string;
    keyId?: string;
  };
}

export interface AIPerformanceStats {
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  totalTokens: number;
  totalCost: number;
  errorCount: number;
  cacheHitRate: number;
  byService: Record<string, {
    requests: number;
    avgLatency: number;
    tokens: number;
    cost: number;
    successRate: number;
  }>;
  byModel: Record<string, {
    requests: number;
    avgLatency: number;
    tokens: number;
    cost: number;
  }>;
  timeframe: {
    start: Date;
    end: Date;
  };
}

export interface AIAlert {
  id: string;
  type: 'high_latency' | 'high_error_rate' | 'high_cost' | 'low_cache_hit' | 'token_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  data: any;
  resolved: boolean;
}

/**
 * 📈 Gestionnaire de Métriques IA
 */
export class AIMetricsCollector {
  private metrics: AIMetric[] = [];
  private alerts: AIAlert[] = [];
  private isCollecting = true;
  private maxMetrics = 10000; // Limite pour éviter la surcharge mémoire
  
  // Seuils d'alerte configurables
  private alertThresholds = {
    highLatency: 5000, // 5 secondes
    highErrorRate: 0.1, // 10%
    highCostPerHour: 10, // $10/heure
    lowCacheHitRate: 0.5, // 50%
    tokenLimitWarning: 0.8 // 80% de la limite
  };

  constructor() {
    this.loadFromStorage();
    this.startPeriodicCleanup();
  }

  /**
   * 📊 Enregistrer une métrique IA
   */
  recordMetric(metric: Omit<AIMetric, 'id' | 'timestamp'>): string {
    if (!this.isCollecting) return '';

    const fullMetric: AIMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);

    // Nettoyer si trop de métriques
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Vérifier les alertes
    this.checkAlerts(fullMetric);

    // Sauvegarder périodiquement
    if (this.metrics.length % 100 === 0) {
      this.saveToStorage();
    }

    console.log(`📊 Métrique IA enregistrée: ${fullMetric.service}/${fullMetric.operation} - ${fullMetric.duration}ms`);
    return fullMetric.id;
  }

  /**
   * ⏱️ Mesurer automatiquement la performance d'une opération IA
   */
  async measureOperation<T>(
    config: {
      service: AIMetric['service'];
      operation: string;
      model?: string;
      userId?: string;
      sessionId?: string;
    },
    operation: () => Promise<T>
  ): Promise<T & { metrics: AIMetric }> {
    const startTime = Date.now();
    let result: T;
    let error: string | undefined;
    let success = true;
    let metricId: string;

    try {
      result = await operation();
      return result as T & { metrics: AIMetric };
    } catch (err) {
      success = false;
      error = (err as Error).message;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      metricId = this.recordMetric({
        service: config.service,
        operation: config.operation,
        model: config.model,
        duration,
        success,
        error,
        metadata: {
          userId: config.userId,
          sessionId: config.sessionId,
        }
      });

      // Ajouter les métriques au résultat si succès
      if (success && result!) {
        (result as any).metrics = this.getMetric(metricId);
      }
    }
  }

  /**
   * 📈 Calculer les statistiques de performance
   */
  getPerformanceStats(timeframe?: { start: Date; end: Date }): AIPerformanceStats {
    let filteredMetrics = this.metrics;

    if (timeframe) {
      filteredMetrics = this.metrics.filter(m => 
        m.timestamp >= timeframe.start && m.timestamp <= timeframe.end
      );
    }

    if (filteredMetrics.length === 0) {
      return this.getEmptyStats(timeframe);
    }

    const totalRequests = filteredMetrics.length;
    const successfulRequests = filteredMetrics.filter(m => m.success).length;
    const successRate = successfulRequests / totalRequests;
    
    const averageLatency = filteredMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    
    const totalTokens = filteredMetrics.reduce((sum, m) => sum + (m.tokenUsage?.total || 0), 0);
    const totalCost = filteredMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
    
    const errorCount = filteredMetrics.filter(m => !m.success).length;
    
    const cacheHits = filteredMetrics.filter(m => m.metadata?.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

    // Statistiques par service
    const byService: Record<string, any> = {};
    const byModel: Record<string, any> = {};

    for (const service of ['openai', 'anthropic', 'local', 'embeddings', 'rag']) {
      const serviceMetrics = filteredMetrics.filter(m => m.service === service);
      if (serviceMetrics.length > 0) {
        byService[service] = {
          requests: serviceMetrics.length,
          avgLatency: serviceMetrics.reduce((sum, m) => sum + m.duration, 0) / serviceMetrics.length,
          tokens: serviceMetrics.reduce((sum, m) => sum + (m.tokenUsage?.total || 0), 0),
          cost: serviceMetrics.reduce((sum, m) => sum + (m.cost || 0), 0),
          successRate: serviceMetrics.filter(m => m.success).length / serviceMetrics.length
        };
      }
    }

    // Statistiques par modèle
    const models = [...new Set(filteredMetrics.map(m => m.model).filter(Boolean))];
    for (const model of models) {
      const modelMetrics = filteredMetrics.filter(m => m.model === model);
      byModel[model!] = {
        requests: modelMetrics.length,
        avgLatency: modelMetrics.reduce((sum, m) => sum + m.duration, 0) / modelMetrics.length,
        tokens: modelMetrics.reduce((sum, m) => sum + (m.tokenUsage?.total || 0), 0),
        cost: modelMetrics.reduce((sum, m) => sum + (m.cost || 0), 0)
      };
    }

    return {
      totalRequests,
      successRate,
      averageLatency,
      totalTokens,
      totalCost,
      errorCount,
      cacheHitRate,
      byService,
      byModel,
      timeframe: timeframe || {
        start: filteredMetrics[0]?.timestamp || new Date(),
        end: filteredMetrics[filteredMetrics.length - 1]?.timestamp || new Date()
      }
    };
  }

  /**
   * 🚨 Vérifier et créer des alertes
   */
  private checkAlerts(metric: AIMetric): void {
    // Alerte latence élevée
    if (metric.duration > this.alertThresholds.highLatency) {
      this.createAlert({
        type: 'high_latency',
        severity: metric.duration > this.alertThresholds.highLatency * 2 ? 'high' : 'medium',
        message: `Latence élevée détectée: ${metric.duration}ms pour ${metric.service}/${metric.operation}`,
        data: { metric }
      });
    }

    // Vérifier le taux d'erreur (sur les 100 dernières requêtes)
    const recentMetrics = this.metrics.slice(-100);
    const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
    
    if (errorRate > this.alertThresholds.highErrorRate) {
      this.createAlert({
        type: 'high_error_rate',
        severity: errorRate > 0.2 ? 'critical' : 'high',
        message: `Taux d'erreur élevé: ${(errorRate * 100).toFixed(1)}%`,
        data: { errorRate, recentMetrics: recentMetrics.length }
      });
    }

    // Vérifier le coût (sur la dernière heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCost = this.metrics
      .filter(m => m.timestamp >= oneHourAgo)
      .reduce((sum, m) => sum + (m.cost || 0), 0);

    if (recentCost > this.alertThresholds.highCostPerHour) {
      this.createAlert({
        type: 'high_cost',
        severity: 'high',
        message: `Coût élevé détecté: $${recentCost.toFixed(2)} dans la dernière heure`,
        data: { cost: recentCost, period: '1h' }
      });
    }
  }

  /**
   * 🚨 Créer une alerte
   */
  private createAlert(alert: Omit<AIAlert, 'id' | 'timestamp' | 'resolved'>): void {
    // Éviter les doublons d'alertes récentes
    const recentAlerts = this.alerts.filter(a => 
      a.type === alert.type && 
      a.timestamp > new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
    );

    if (recentAlerts.length > 0) return;

    const fullAlert: AIAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(fullAlert);
    console.warn(`🚨 Alerte IA: ${fullAlert.message}`);

    // Émettre un événement pour l'interface utilisateur
    window.dispatchEvent(new CustomEvent('ai-alert', { detail: fullAlert }));
  }

  /**
   * 📋 Obtenir les alertes actives
   */
  getActiveAlerts(): AIAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * ✅ Résoudre une alerte
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alerte résolue: ${alert.message}`);
    }
  }

  /**
   * 📊 Obtenir une métrique spécifique
   */
  getMetric(metricId: string): AIMetric | undefined {
    return this.metrics.find(m => m.id === metricId);
  }

  /**
   * 🔍 Rechercher des métriques
   */
  queryMetrics(filters: {
    service?: string;
    operation?: string;
    model?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }): AIMetric[] {
    return this.metrics.filter(metric => {
      if (filters.service && metric.service !== filters.service) return false;
      if (filters.operation && metric.operation !== filters.operation) return false;
      if (filters.model && metric.model !== filters.model) return false;
      if (filters.userId && metric.metadata?.userId !== filters.userId) return false;
      if (filters.startDate && metric.timestamp < filters.startDate) return false;
      if (filters.endDate && metric.timestamp > filters.endDate) return false;
      if (filters.success !== undefined && metric.success !== filters.success) return false;
      return true;
    });
  }

  /**
   * 📈 Obtenir les tendances de performance
   */
  getTrends(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    labels: string[];
    latency: number[];
    requests: number[];
    errors: number[];
    cost: number[];
  } {
    const now = new Date();
    let buckets: Date[] = [];
    let bucketSize: number;

    switch (timeframe) {
      case 'hour':
        bucketSize = 5 * 60 * 1000; // 5 minutes
        for (let i = 11; i >= 0; i--) {
          buckets.push(new Date(now.getTime() - i * bucketSize));
        }
        break;
      case 'day':
        bucketSize = 60 * 60 * 1000; // 1 heure
        for (let i = 23; i >= 0; i--) {
          buckets.push(new Date(now.getTime() - i * bucketSize));
        }
        break;
      case 'week':
        bucketSize = 24 * 60 * 60 * 1000; // 1 jour
        for (let i = 6; i >= 0; i--) {
          buckets.push(new Date(now.getTime() - i * bucketSize));
        }
        break;
    }

    const labels = buckets.map(date => {
      switch (timeframe) {
        case 'hour': return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'day': return date.toLocaleTimeString([], { hour: '2-digit' });
        case 'week': return date.toLocaleDateString([], { weekday: 'short' });
        default: return date.toISOString();
      }
    });

    const latency: number[] = [];
    const requests: number[] = [];
    const errors: number[] = [];
    const cost: number[] = [];

    for (let i = 0; i < buckets.length - 1; i++) {
      const start = buckets[i];
      const end = buckets[i + 1];
      
      const bucketMetrics = this.metrics.filter(m => 
        m.timestamp >= start && m.timestamp < end
      );

      latency.push(
        bucketMetrics.length > 0 
          ? bucketMetrics.reduce((sum, m) => sum + m.duration, 0) / bucketMetrics.length 
          : 0
      );
      
      requests.push(bucketMetrics.length);
      errors.push(bucketMetrics.filter(m => !m.success).length);
      cost.push(bucketMetrics.reduce((sum, m) => sum + (m.cost || 0), 0));
    }

    return { labels, latency, requests, errors, cost };
  }

  /**
   * 🧹 Méthodes utilitaires
   */
  private getEmptyStats(timeframe?: { start: Date; end: Date }): AIPerformanceStats {
    return {
      totalRequests: 0,
      successRate: 0,
      averageLatency: 0,
      totalTokens: 0,
      totalCost: 0,
      errorCount: 0,
      cacheHitRate: 0,
      byService: {},
      byModel: {},
      timeframe: timeframe || { start: new Date(), end: new Date() }
    };
  }

  private startPeriodicCleanup(): void {
    // Nettoyage toutes les heures
    setInterval(() => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Supprimer les métriques anciennes
      this.metrics = this.metrics.filter(m => m.timestamp >= oneWeekAgo);
      
      // Supprimer les alertes résolues anciennes
      this.alerts = this.alerts.filter(a => 
        !a.resolved || a.timestamp >= oneWeekAgo
      );

      this.saveToStorage();
      console.log(`🧹 Nettoyage: ${this.metrics.length} métriques conservées`);
    }, 60 * 60 * 1000);
  }

  private saveToStorage(): void {
    try {
      const data = {
        metrics: this.metrics,
        alerts: this.alerts,
        version: 1,
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem('eduai_ai_metrics', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur sauvegarde métriques IA:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('eduai_ai_metrics');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      this.metrics = (data.metrics || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      
      this.alerts = (data.alerts || []).map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }));

      console.log(`📊 ${this.metrics.length} métriques IA chargées`);

    } catch (error) {
      console.error('❌ Erreur chargement métriques IA:', error);
      this.metrics = [];
      this.alerts = [];
    }
  }

  /**
   * 🎛️ Configuration
   */
  setCollecting(enabled: boolean): void {
    this.isCollecting = enabled;
    console.log(`📊 Collecte de métriques IA: ${enabled ? 'activée' : 'désactivée'}`);
  }

  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    console.log('🔧 Seuils d\'alerte IA mis à jour:', this.alertThresholds);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.alerts = [];
    this.saveToStorage();
    console.log('🗑️ Métriques IA effacées');
  }
}

// Instance globale
export const aiMetrics = new AIMetricsCollector();
