/**
 * 🗄️ Cache Redis Intelligent pour Réponses IA
 * Optimisation des performances et réduction des coûts
 */

import { aiMetrics } from './AIMonitoring';

// Types pour le cache IA
export interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live en secondes
  metadata: {
    model?: string;
    service: string;
    operation: string;
    cost?: number;
    tokens?: number;
    size: number; // Taille en bytes
    hits: number; // Nombre d'accès
    quality?: 'excellent' | 'good' | 'poor';
  };
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // en bytes
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  averageAccessTime: number;
  costSaved: number;
  tokensSaved: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export interface CacheConfig {
  defaultTTL: number; // en secondes
  maxSize: number; // taille maximale du cache en bytes
  maxEntries: number; // nombre maximal d'entrées
  compressionEnabled: boolean;
  persistToDisk: boolean;
  cleanupInterval: number; // intervalle de nettoyage en ms
}

/**
 * 💾 Gestionnaire de Cache IA Avancé
 * Cache intelligent avec compression, persistance et analyse de performance
 */
export class IntelligentAICache {
  private cache = new Map<string, CacheEntry>();
  private accessLog: { key: string; timestamp: Date; hit: boolean }[] = [];
  private totalHits = 0;
  private totalMisses = 0;
  private isInitialized = false;

  private config: CacheConfig = {
    defaultTTL: 3600, // 1 heure
    maxSize: 100 * 1024 * 1024, // 100MB
    maxEntries: 10000,
    compressionEnabled: true,
    persistToDisk: true,
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  constructor(customConfig?: Partial<CacheConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    this.initialize();
  }

  /**
   * 🎯 Initialiser le cache
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadFromStorage();
      this.startCleanupScheduler();
      this.startStatsLogger();
      this.isInitialized = true;
      console.log('💾 Cache IA initialisé avec', this.cache.size, 'entrées');
    } catch (error) {
      console.error('❌ Erreur initialisation cache IA:', error);
    }
  }

  /**
   * 🔍 Récupérer une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const entry = this.cache.get(key);
      const accessTime = Date.now() - startTime;

      if (!entry) {
        this.recordAccess(key, false);
        this.totalMisses++;
        
        // Enregistrer la métrique de cache miss
        aiMetrics.recordMetric({
          service: 'local',
          operation: 'cache_miss',
          duration: accessTime,
          success: true,
          metadata: {
            cacheHit: false,
            requestSize: key.length
          }
        });

        return null;
      }

      // Vérifier l'expiration
      const now = new Date();
      const age = (now.getTime() - entry.timestamp.getTime()) / 1000;
      
      if (age > entry.ttl) {
        this.cache.delete(key);
        this.recordAccess(key, false);
        this.totalMisses++;
        
        aiMetrics.recordMetric({
          service: 'local',
          operation: 'cache_expired',
          duration: accessTime,
          success: true,
          metadata: {
            cacheHit: false,
            age: Math.round(age)
          }
        });

        return null;
      }

      // Cache hit - mettre à jour les statistiques
      entry.metadata.hits++;
      this.recordAccess(key, true);
      this.totalHits++;

      // Enregistrer la métrique de cache hit
      aiMetrics.recordMetric({
        service: 'local',
        operation: 'cache_hit',
        duration: accessTime,
        success: true,
        metadata: {
          cacheHit: true,
          age: Math.round(age),
          hitCount: entry.metadata.hits,
          cost: entry.metadata.cost,
          tokens: entry.metadata.tokens
        }
      });

      console.log(`💾 Cache HIT: ${key} (${entry.metadata.hits} accès, âge: ${Math.round(age)}s)`);
      return entry.data;

    } catch (error) {
      console.error('❌ Erreur lecture cache:', error);
      this.totalMisses++;
      return null;
    }
  }

  /**
   * 💾 Stocker une valeur dans le cache
   */
  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      metadata?: Partial<CacheEntry['metadata']>;
    } = {}
  ): Promise<boolean> {
    try {
      const serializedData = this.config.compressionEnabled 
        ? await this.compress(data)
        : data;

      const size = this.calculateSize(serializedData);
      
      const entry: CacheEntry<T> = {
        data: serializedData,
        timestamp: new Date(),
        ttl: options.ttl || this.config.defaultTTL,
        metadata: {
          service: 'cache',
          operation: 'store',
          size,
          hits: 0,
          ...options.metadata
        }
      };

      // Vérifier les limites du cache
      await this.ensureCapacity(size);

      this.cache.set(key, entry);

      // Sauvegarder périodiquement
      if (this.cache.size % 100 === 0) {
        await this.saveToStorage();
      }

      console.log(`💾 Cache SET: ${key} (${this.formatSize(size)}, TTL: ${entry.ttl}s)`);
      
      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'local',
        operation: 'cache_set',
        duration: 0,
        success: true,
        metadata: {
          requestSize: size,
          ttl: entry.ttl
        }
      });

      return true;

    } catch (error) {
      console.error('❌ Erreur écriture cache:', error);
      return false;
    }
  }

  /**
   * 🔧 Cache intelligent pour requêtes IA
   */
  async cacheAIResponse<T>(
    key: string,
    aiOperation: () => Promise<T>,
    options: {
      ttl?: number;
      service?: string;
      model?: string;
      operation?: string;
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!options.forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Exécuter l'opération IA avec mesure des métriques
    const startTime = Date.now();
    let result: T;
    let cost = 0;
    let tokens = 0;

    try {
      result = await aiOperation();
      
      // Extraire les coûts et tokens si disponibles
      if (typeof result === 'object' && result !== null) {
        const resultObj = result as any;
        cost = resultObj.cost || resultObj.usage?.total_cost || 0;
        tokens = resultObj.tokens || resultObj.usage?.total_tokens || 0;
      }

      // Stocker en cache
      await this.set(key, result, {
        ttl: options.ttl,
        metadata: {
          service: options.service || 'ai',
          operation: options.operation || 'unknown',
          model: options.model,
          cost,
          tokens,
          quality: this.assessQuality(result)
        }
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur opération IA cachée:', error);
      throw error;
    }
  }

  /**
   * 🧹 Méthodes de gestion du cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessLog = [];
    this.totalHits = 0;
    this.totalMisses = 0;
    await this.saveToStorage();
    console.log('🗑️ Cache IA vidé');
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    return deleted;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Vérifier l'expiration
    const age = (Date.now() - entry.timestamp.getTime()) / 1000;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 📊 Statistiques du cache
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);
    const totalAccess = this.totalHits + this.totalMisses;
    const hitRate = totalAccess > 0 ? this.totalHits / totalAccess : 0;

    const costSaved = entries.reduce((sum, entry) => 
      sum + (entry.metadata.cost || 0) * entry.metadata.hits, 0
    );

    const tokensSaved = entries.reduce((sum, entry) => 
      sum + (entry.metadata.tokens || 0) * entry.metadata.hits, 0
    );

    const timestamps = entries.map(e => e.timestamp);
    const oldestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined;
    const newestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined;

    const averageAccessTime = this.accessLog.length > 0
      ? this.accessLog.reduce((sum, log) => sum + 1, 0) / this.accessLog.length
      : 0;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      averageAccessTime,
      costSaved,
      tokensSaved,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * 🔍 Requêtes avancées
   */
  getEntriesByService(service: string): Array<{ key: string; entry: CacheEntry }> {
    const results: Array<{ key: string; entry: CacheEntry }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.service === service) {
        results.push({ key, entry });
      }
    }

    return results.sort((a, b) => b.entry.metadata.hits - a.entry.metadata.hits);
  }

  getTopHitEntries(limit = 10): Array<{ key: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => b.entry.metadata.hits - a.entry.metadata.hits)
      .slice(0, limit);
  }

  getMostExpensiveEntries(limit = 10): Array<{ key: string; entry: CacheEntry; totalCost: number }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        totalCost: (entry.metadata.cost || 0) * entry.metadata.hits
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  /**
   * 🛠️ Méthodes utilitaires privées
   */
  private async ensureCapacity(newEntrySize: number): Promise<void> {
    const stats = this.getStats();

    // Vérifier la limite d'entrées
    if (this.cache.size >= this.config.maxEntries) {
      await this.evictLeastUsed(Math.ceil(this.config.maxEntries * 0.1)); // Supprimer 10%
    }

    // Vérifier la limite de taille
    if (stats.totalSize + newEntrySize > this.config.maxSize) {
      const targetSize = this.config.maxSize * 0.8; // Réduire à 80%
      await this.evictBySize(targetSize);
    }
  }

  private async evictLeastUsed(count: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // Trier par hits, puis par âge
        const hitDiff = a[1].metadata.hits - b[1].metadata.hits;
        if (hitDiff !== 0) return hitDiff;
        return a[1].timestamp.getTime() - b[1].timestamp.getTime();
      });

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      console.log(`🗑️ Éviction LRU: ${key}`);
    }
  }

  private async evictBySize(targetSize: number): Promise<void> {
    const stats = this.getStats();
    let currentSize = stats.totalSize;

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // Éviction intelligente : ratio hits/size
        const ratioA = a[1].metadata.hits / a[1].metadata.size;
        const ratioB = b[1].metadata.hits / b[1].metadata.size;
        return ratioA - ratioB; // Les moins efficaces d'abord
      });

    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) break;
      
      this.cache.delete(key);
      currentSize -= entry.metadata.size;
      console.log(`🗑️ Éviction taille: ${key} (${this.formatSize(entry.metadata.size)})`);
    }
  }

  private recordAccess(key: string, hit: boolean): void {
    this.accessLog.push({
      key,
      timestamp: new Date(),
      hit
    });

    // Garder seulement les 1000 derniers accès
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }
  }

  private assessQuality(data: any): 'excellent' | 'good' | 'poor' {
    if (typeof data === 'string') {
      const length = data.length;
      if (length > 1000) return 'excellent';
      if (length > 100) return 'good';
      return 'poor';
    }

    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length > 10) return 'excellent';
      if (keys.length > 3) return 'good';
      return 'poor';
    }

    return 'good';
  }

  private async compress(data: any): Promise<any> {
    // Simulation de compression (dans un vrai projet, utiliser pako ou similar)
    if (typeof data === 'string' && data.length > 1000) {
      return `[COMPRESSED:${data.length}]${data.substring(0, 100)}...`;
    }
    return data;
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * 💾 Persistance
   */
  private async saveToStorage(): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      const data = {
        cache: Array.from(this.cache.entries()).map(([key, entry]) => [
          key,
          {
            ...entry,
            timestamp: entry.timestamp.toISOString()
          }
        ]),
        stats: {
          totalHits: this.totalHits,
          totalMisses: this.totalMisses
        },
        version: 1,
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem('eduai_ai_cache', JSON.stringify(data));
      console.log(`💾 Cache sauvegardé: ${this.cache.size} entrées`);

    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      const stored = localStorage.getItem('eduai_ai_cache');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      if (data.cache) {
        for (const [key, entry] of data.cache) {
          const fullEntry = {
            ...entry,
            timestamp: new Date(entry.timestamp)
          };

          // Vérifier si l'entrée n'est pas expirée
          const age = (Date.now() - fullEntry.timestamp.getTime()) / 1000;
          if (age <= fullEntry.ttl) {
            this.cache.set(key, fullEntry);
          }
        }
      }

      if (data.stats) {
        this.totalHits = data.stats.totalHits || 0;
        this.totalMisses = data.stats.totalMisses || 0;
      }

      console.log(`💾 Cache chargé: ${this.cache.size} entrées valides`);

    } catch (error) {
      console.error('❌ Erreur chargement cache:', error);
    }
  }

  /**
   * ⏰ Planificateurs
   */
  private startCleanupScheduler(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = (now - entry.timestamp.getTime()) / 1000;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Nettoyage cache: ${removed} entrées expirées supprimées`);
    }
  }

  private startStatsLogger(): void {
    // Log des statistiques toutes les 10 minutes
    setInterval(() => {
      const stats = this.getStats();
      console.log(`📊 Stats Cache IA:`, {
        entries: stats.totalEntries,
        hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
        size: this.formatSize(stats.totalSize),
        costSaved: `$${stats.costSaved.toFixed(2)}`,
        tokensSaved: stats.tokensSaved.toLocaleString()
      });
    }, 10 * 60 * 1000);
  }

  /**
   * 🎛️ Configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuration cache mise à jour:', this.config);
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }
}

// Instance globale
export const aiCache = new IntelligentAICache();
