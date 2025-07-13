/**
 * 🔐 Middleware d'Intégration de Sécurité - Version Complète
 * Coordonne l'authentification, rate limiting, validation, chiffrement et infrastructure
 */

import { authService } from './AuthService';
import { rateLimitingService } from './RateLimitingService';
import { validationService } from './ValidationService';
import { encryptionService } from './EncryptionService';
import { aiMetrics } from './AIMonitoring';
import { loadBalancingService } from './LoadBalancingService';
import { aiQueueService } from './AIQueueService';
import { databasePoolingService } from './DatabasePoolingService';
import { cdnService } from './CDNService';

// Types pour l'intégration
export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  endpoint?: string;
  action?: string;
}

export interface SecurityPolicy {
  requireAuth: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  rateLimitKey?: string;
  rateLimitWindow?: number;
  maxRequests?: number;
  validateContent?: boolean;
  encryptResponse?: boolean;
  auditLog?: boolean;
}

export interface SecureRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  files?: File[];
  security?: SecurityPolicy;
  context?: SecurityContext;
}

export interface SecureResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any; // Pour les détails d'erreur
  metadata?: any; // Pour les métadonnées additionnelles
  securityMetadata?: {
    authenticated: boolean;
    rateLimited: boolean;
    validated: boolean;
    encrypted: boolean;
    securityEvents: string[];
  };
}

/**
 * Service intégré de sécurité - Version simplifiée
 */
export class SecurityIntegrationService {
  private isInitialized = false;

  /**
   * Initialise tous les services de sécurité
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔐 Initialisation du service de sécurité intégré...');

      // Vérifier que les services sont prêts
      await this.waitForServices();

      this.isInitialized = true;
      console.log('✅ Service de sécurité intégré initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation sécurité:', error);
      throw error;
    }
  }

  private async waitForServices(): Promise<void> {
    // Attendre que les services soient prêts
    let attempts = 0;
    while (attempts < 10) {
      const authReady = !!authService.getState;
      const rateLimitReady = rateLimitingService.isReady();
      const validationReady = validationService.isReady();
      const encryptionReady = encryptionService.isReady();
      
      // Vérifier les nouveaux services d'infrastructure
      const loadBalancerReady = loadBalancingService.getActiveInstances().length > 0;
      const queueReady = aiQueueService.getStats().totalTasks >= 0; // Service prêt si stats disponibles

      if (authReady && rateLimitReady && validationReady && encryptionReady && loadBalancerReady && queueReady) {
        console.log('✅ Tous les services de sécurité et d\'infrastructure sont prêts');
        return;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.warn('⚠️ Certains services de sécurité ne sont pas encore prêts');
  }

  /**
   * Exécute une requête sécurisée simple
   */
  async secureRequest<T = any>(options: SecureRequestOptions): Promise<SecureResponse<T>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const securityMetadata = {
      authenticated: false,
      rateLimited: false,
      validated: false,
      encrypted: false,
      securityEvents: [] as string[]
    };

    const context = {
      requestId: this.generateRequestId(),
      timestamp: new Date(),
      ...options.context
    };

    try {
      // 1. Vérification de l'authentification basique
      if (options.security?.requireAuth) {
        const authState = authService.getState();
        if (!authState.isAuthenticated) {
          return {
            success: false,
            error: 'Authentification requise',
            securityMetadata: { 
              ...securityMetadata, 
              securityEvents: ['Authentication required'] 
            }
          };
        }
        securityMetadata.authenticated = true;
        securityMetadata.securityEvents.push('Authentication verified');
      }

      // 2. Vérification du rate limiting simplifiée
      const endpoint = options.url;
      const userId = context.userId || 'anonymous';
      const userTier = options.security?.requireAuth ? 'authenticated' : 'anonymous';
      
      try {
        const rateLimitResult = await rateLimitingService.checkRateLimit(
          endpoint, 
          userId, 
          userTier as any
        );
        
        if (!rateLimitResult.allowed) {
          securityMetadata.rateLimited = true;
          return {
            success: false,
            error: 'Limite de taux dépassée',
            securityMetadata: { 
              ...securityMetadata, 
              securityEvents: ['Rate limit exceeded'] 
            }
          };
        }
        securityMetadata.securityEvents.push('Rate limit check passed');
      } catch (error) {
        // En cas d'erreur de rate limiting, continuer sans bloquer
        securityMetadata.securityEvents.push('Rate limit check skipped (error)');
      }

      // 3. Validation du contenu simplifiée
      if (options.security?.validateContent && options.data) {
        try {
          const textContent = typeof options.data === 'string' 
            ? options.data 
            : JSON.stringify(options.data);

          // Validation basique du contenu
          const validationResult = await validationService.validate({
            id: `security-check-${Date.now()}`,
            content: textContent,
            mediaType: 'text',
            metadata: {
              userId: context.userId,
              purpose: 'security-validation',
              context: 'api-request'
            }
          });

          if (!validationResult.valid) {
            return {
              success: false,
              error: 'Contenu non valide',
              securityMetadata: { 
                ...securityMetadata, 
                securityEvents: ['Content validation failed'] 
              }
            };
          }
          securityMetadata.validated = true;
          securityMetadata.securityEvents.push('Content validation passed');
        } catch (error) {
          // En cas d'erreur de validation, continuer avec un avertissement
          securityMetadata.securityEvents.push('Content validation skipped (error)');
        }
      }

      // 4. Simulation d'exécution de la requête
      const response = await this.simulateRequest(options);

      // 5. Chiffrement de la réponse si nécessaire
      if (options.security?.encryptResponse && response.data) {
        try {
          const encryptionRequest = {
            data: JSON.stringify(response.data),
            purpose: 'api-response',
            classification: {
              level: 'internal' as const,
              categories: ['api-response'],
              retention: {
                period: 30,
                autoDelete: true
              },
              access: {
                roles: ['user'],
                conditions: []
              }
            }
          };
          const encryptedData = await encryptionService.encryptData(encryptionRequest);
          response.data = { encrypted: true, data: encryptedData };
          securityMetadata.encrypted = true;
          securityMetadata.securityEvents.push('Response encrypted');
        } catch (error) {
          // En cas d'erreur de chiffrement, continuer sans chiffrer
          securityMetadata.securityEvents.push('Response encryption skipped (error)');
        }
      }

      return {
        success: true,
        data: response.data,
        securityMetadata
      };

    } catch (error) {
      console.error('❌ Erreur requête sécurisée:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
        securityMetadata
      };
    }
  }

  /**
   * Simulation d'une requête HTTP
   */
  private async simulateRequest(options: SecureRequestOptions): Promise<{ data: any }> {
    // Simulation d'une réponse selon l'endpoint
    await new Promise(resolve => setTimeout(resolve, 100)); // Délai simulé

    if (options.url.includes('/api/ai/chat')) {
      return {
        data: {
          response: `Réponse IA simulée pour: ${JSON.stringify(options.data)}`,
          model: 'gpt-4',
          timestamp: new Date().toISOString()
        }
      };
    }

    if (options.url.includes('/api/files/upload')) {
      return {
        data: {
          uploaded: options.files?.length || 0,
          files: options.files?.map(f => ({ name: f.name, size: f.size })) || [],
          timestamp: new Date().toISOString()
        }
      };
    }

    // Réponse générique
    return {
      data: {
        success: true,
        method: options.method,
        url: options.url,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Génère un ID unique pour la requête
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtient les statistiques de sécurité
   */
  getSecurityStats() {
    return {
      serviceStatus: {
        authentication: !!authService.getState,
        rateLimiting: rateLimitingService.isReady(),
        validation: validationService.isReady(),
        encryption: encryptionService.isReady()
      },
      integrationReady: this.isInitialized
    };
  }

  /**
   * Méthodes de commodité simplifiées
   */

  // Mise à jour de profil sécurisée
  async secureProfileUpdate(profileData: any, userId: string): Promise<SecureResponse> {
    return this.secureRequest({
      method: 'PUT',
      url: `/api/users/${userId}/profile`,
      data: profileData,
      security: {
        requireAuth: true,
        validateContent: true,
        encryptResponse: true,
        auditLog: true
      },
      context: {
        userId,
        endpoint: '/api/users/profile',
        action: 'profile_update'
      }
    });
  }

  /**
   * 🤖 Requête IA avec infrastructure optimisée
   */
  async secureAIRequest(
    prompt: string,
    model: string,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      maxLatency?: number;
      userId: string;
      sessionId?: string;
    }
  ): Promise<SecureResponse> {
    try {
      // 1. Valider l'input
      const validationResult = await validationService.validate({
        id: `ai_request_${Date.now()}`,
        content: { text: prompt },
        mediaType: 'text',
        metadata: { userId: options.userId }
      });

      if (!validationResult.valid) {
        return {
          success: false,
          error: 'Contenu non valide',
          details: validationResult.issues
        };
      }

      // 2. Sélectionner l'instance IA optimale
      const instanceResult = await loadBalancingService.selectInstance({
        model,
        priority: options.priority || 'normal',
        expectedTokens: prompt.length / 4, // Estimation
        maxLatency: options.maxLatency,
        retryable: true,
        userId: options.userId,
        sessionId: options.sessionId
      });

      // 3. Créer une tâche en queue pour les requêtes lourdes
      if (options.priority === 'low' || prompt.length > 1000) {
        const taskId = await aiQueueService.addTask({
          type: 'chat',
          payload: { prompt, model, instanceId: instanceResult.instance.id },
          priority: options.priority || 'normal',
          userId: options.userId,
          sessionId: options.sessionId,
          maxRetries: 3,
          timeout: 300000, // 5 minutes
          metadata: {
            estimatedDuration: instanceResult.estimatedLatency,
            estimatedCost: instanceResult.estimatedCost,
            requiredModel: model,
            computeIntensive: true,
            retryable: true,
            tags: ['ai', 'chat']
          }
        });

        return {
          success: true,
          data: { taskId, status: 'queued' },
          metadata: {
            instanceId: instanceResult.instance.id,
            estimatedLatency: instanceResult.estimatedLatency,
            queuePosition: await aiQueueService.getTasks({ status: 'pending' }).length
          }
        };
      }

      // 4. Exécution directe pour les requêtes prioritaires
      const startTime = Date.now();
      
      // Simuler l'appel à l'IA
      await new Promise(resolve => setTimeout(resolve, instanceResult.estimatedLatency));
      
      const mockResponse = {
        response: `Réponse IA simulée pour: ${prompt.substring(0, 50)}...`,
        model,
        tokens: Math.floor(prompt.length / 4),
        latency: Date.now() - startTime
      };

      // 5. Enregistrer les performances
      loadBalancingService.recordPerformance(
        instanceResult.instance.id,
        Date.now() - startTime,
        true,
        instanceResult.estimatedCost
      );

      return {
        success: true,
        data: mockResponse,
        metadata: {
          instanceId: instanceResult.instance.id,
          actualLatency: Date.now() - startTime,
          estimatedLatency: instanceResult.estimatedLatency,
          cost: instanceResult.estimatedCost
        }
      };

    } catch (error) {
      console.error('❌ Erreur requête IA sécurisée:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 📤 Upload sécurisé avec CDN
   */
  async secureFileUpload(
    file: File,
    path: string,
    userId: string,
    options: {
      optimize?: boolean;
      responsive?: boolean;
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<SecureResponse> {
    try {
      // 1. Validation du fichier
      const validationResult = await validationService.validate({
        id: `file_upload_${Date.now()}`,
        content: { file: file },
        mediaType: file.type.split('/')[0] as 'text' | 'image' | 'audio' | 'video',
        metadata: { 
          userId,
          filename: file.name,
          size: file.size 
        }
      });

      if (!validationResult.valid) {
        return {
          success: false,
          error: 'Fichier non valide',
          details: validationResult.issues
        };
      }

      // 2. Chiffrer les métadonnées sensibles si nécessaire
      const metadataToEncrypt = {
        uploaderId: userId,
        originalName: file.name,
        uploadTime: new Date().toISOString()
      };
      const secureMetadata = await encryptionService.encryptData({
        data: metadataToEncrypt,
        purpose: 'metadata_protection',
        classification: { 
          level: 'internal', 
          categories: [], 
          retention: { period: 365, autoDelete: true },
          access: { roles: ['user'], conditions: [] }
        }
      });

      // 3. Upload vers CDN
      const asset = await cdnService.uploadAsset(file, path, {
        optimize: options.optimize,
        responsive: options.responsive,
        priority: options.priority
      });

      // 4. Enregistrer dans la base de données via le pool
      const uploadRecord = {
        assetId: asset.id,
        userId,
        path: asset.path,
        size: asset.size,
        type: asset.type,
        metadata: secureMetadata.ciphertext,
        uploadDate: new Date()
      };

      await databasePoolingService.executeQuery(
        'indexeddb_eduai_main',
        'INSERT INTO uploads VALUES (?)',
        [uploadRecord],
        { priority: 'normal', cached: false }
      );

      return {
        success: true,
        data: {
          assetId: asset.id,
          url: await cdnService.getAsset(path),
          size: asset.size,
          type: asset.type
        },
        metadata: {
          optimized: asset.metadata.optimized,
          compressed: asset.metadata.compressed,
          responsive: asset.metadata.responsive
        }
      };

    } catch (error) {
      console.error('❌ Erreur upload sécurisé:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 📊 Récupérer les métriques d'infrastructure
   */
  async getInfrastructureMetrics(): Promise<SecureResponse> {
    try {
      const [
        loadBalancerInstances,
        queueStats,
        dbStats,
        cdnStats,
        aiStats
      ] = await Promise.all([
        loadBalancingService.getActiveInstances(),
        aiQueueService.getStats(),
        databasePoolingService.getPools().map(pool => databasePoolingService.getPoolStats(pool.id)),
        cdnService.getStats(),
        aiMetrics.getPerformanceStats({
          start: new Date(Date.now() - 60 * 60 * 1000),
          end: new Date()
        })
      ]);

      return {
        success: true,
        data: {
          loadBalancer: {
            activeInstances: loadBalancerInstances.length,
            totalRequests: aiStats.totalRequests,
            averageLatency: aiStats.averageLatency,
            instances: loadBalancerInstances.map(instance => ({
              id: instance.id,
              provider: instance.provider,
              status: instance.status,
              performance: instance.performance
            }))
          },
          queue: {
            totalTasks: queueStats.totalTasks,
            runningTasks: queueStats.runningTasks,
            completedTasks: queueStats.completedTasks,
            successRate: queueStats.successRate,
            throughput: queueStats.throughputPerHour
          },
          database: {
            pools: dbStats.filter(Boolean).map((stats, index) => ({
              poolId: `pool_${index}`,
              totalConnections: stats?.totalConnections || 0,
              activeConnections: stats?.activeConnections || 0,
              averageQueryTime: stats?.averageQueryTime || 0
            }))
          },
          cdn: {
            totalAssets: cdnStats.totalAssets,
            totalBandwidth: cdnStats.totalBandwidth,
            hitRatio: cdnStats.hitRatio,
            costSavings: cdnStats.costSavings
          }
        }
      };

    } catch (error) {
      console.error('❌ Erreur récupération métriques:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 🔧 Configuration optimisée des services
   */
  async optimizeInfrastructure(): Promise<SecureResponse> {
    try {
      // Analyser les performances actuelles
      const stats = await this.getInfrastructureMetrics();
      if (!stats.success) return stats;

      const metrics = stats.data;
      const recommendations = [];

      // Optimisations Load Balancer
      if (metrics.loadBalancer.averageLatency > 2000) {
        recommendations.push({
          service: 'load_balancer',
          action: 'add_instance',
          reason: 'Latence élevée détectée',
          impact: 'high'
        });
      }

      // Optimisations Queue
      if (metrics.queue.runningTasks > 50) {
        recommendations.push({
          service: 'queue',
          action: 'scale_workers',
          reason: 'Trop de tâches en attente',
          impact: 'medium'
        });
      }

      // Optimisations Database
      const avgConnections = metrics.database.pools.reduce((sum: number, pool: any) => 
        sum + (pool.activeConnections / pool.totalConnections), 0) / metrics.database.pools.length;

      if (avgConnections > 0.8) {
        recommendations.push({
          service: 'database',
          action: 'increase_pool_size',
          reason: 'Pools de connexions saturés',
          impact: 'high'
        });
      }

      // Optimisations CDN
      if (metrics.cdn.hitRatio < 0.8) {
        recommendations.push({
          service: 'cdn',
          action: 'adjust_caching',
          reason: 'Taux de hit cache faible',
          impact: 'medium'
        });
      }

      return {
        success: true,
        data: {
          recommendations,
          currentMetrics: metrics,
          optimizationScore: this.calculateOptimizationScore(metrics)
        }
      };

    } catch (error) {
      console.error('❌ Erreur optimisation infrastructure:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 📈 Calculer le score d'optimisation
   */
  private calculateOptimizationScore(metrics: any): number {
    let score = 100;

    // Pénalités basées sur les métriques
    if (metrics.loadBalancer.averageLatency > 1000) score -= 20;
    if (metrics.queue.successRate < 0.95) score -= 15;
    if (metrics.cdn.hitRatio < 0.85) score -= 10;

    const avgDbUtilization = metrics.database.pools.reduce((sum: number, pool: any) => 
      sum + (pool.activeConnections / pool.totalConnections), 0) / metrics.database.pools.length;
    
    if (avgDbUtilization > 0.8) score -= 15;
    if (avgDbUtilization < 0.3) score -= 5; // Sous-utilisation

    return Math.max(0, Math.min(100, score));
  }
}

// Instance singleton
export const securityIntegration = new SecurityIntegrationService();

// Export par défaut
export default securityIntegration;
