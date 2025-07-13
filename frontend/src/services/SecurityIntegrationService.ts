/**
 * 🔐 Middleware d'Intégration de Sécurité - Version Simplifiée
 * Coordonne l'authentification, rate limiting, validation et chiffrement
 */

import { authService } from './AuthService';
import { rateLimitingService } from './RateLimitingService';
import { validationService } from './ValidationService';
import { encryptionService } from './EncryptionService';

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

      if (authReady && rateLimitReady && validationReady && encryptionReady) {
        console.log('✅ Tous les services de sécurité sont prêts');
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

  // Requête IA sécurisée
  async secureAIRequest(prompt: string, options: {
    model?: string;
    maxTokens?: number;
    files?: File[];
    userId?: string;
  } = {}): Promise<SecureResponse> {
    return this.secureRequest({
      method: 'POST',
      url: '/api/ai/chat',
      data: {
        prompt,
        model: options.model || 'gpt-4',
        maxTokens: options.maxTokens || 1000
      },
      files: options.files,
      security: {
        requireAuth: true,
        validateContent: true,
        encryptResponse: true,
        auditLog: true
      },
      context: {
        userId: options.userId,
        endpoint: '/api/ai/chat',
        action: 'ai_request'
      }
    });
  }

  // Upload de fichier sécurisé
  async secureFileUpload(files: File[], options: {
    userId?: string;
    folder?: string;
  } = {}): Promise<SecureResponse> {
    return this.secureRequest({
      method: 'POST',
      url: '/api/files/upload',
      data: { folder: options.folder || 'uploads' },
      files,
      security: {
        requireAuth: true,
        validateContent: true,
        auditLog: true
      },
      context: {
        userId: options.userId,
        endpoint: '/api/files/upload',
        action: 'file_upload'
      }
    });
  }

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
}

// Instance singleton
export const securityIntegration = new SecurityIntegrationService();

// Export par défaut
export default securityIntegration;
