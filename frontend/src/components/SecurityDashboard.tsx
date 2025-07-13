/**
 * 🛡️ Tableau de Bord de Sécurité Intégré
 * Interface unifiée pour la gestion de la sécurité (Auth, Rate Limiting, Validation, Chiffrement)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { authService, AuthState, SecurityEvent } from '../services/AuthService';
import { rateLimitingService, RateLimitStats } from '../services/RateLimitingService';
import { validationService } from '../services/ValidationService';
import { encryptionService } from '../services/EncryptionService';

interface SecurityDashboardProps {
  className?: string;
}

interface SecurityOverview {
  authentication: {
    isActive: boolean;
    usersOnline: number;
    failedAttempts: number;
    alertsCount: number;
  };
  rateLimiting: {
    isActive: boolean;
    requestsBlocked: number;
    currentLoad: number;
    rulesCount: number;
  };
  validation: {
    isActive: boolean;
    threatsBlocked: number;
    validationRate: number;
    rulesCount: number;
  };
  encryption: {
    isActive: boolean;
    keysActive: number;
    encryptionRate: number;
    dataProtected: string;
  };
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ 
  className = '' 
}) => {
  // États du composant
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'rate-limit' | 'validation' | 'encryption' | 'logs'>('overview');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 secondes

  // Chargement des données
  useEffect(() => {
    loadSecurityData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      // Charger les données de tous les services
      const [
        authStateData,
        rateLimitStatsData,
        securityEventsData
      ] = await Promise.all([
        Promise.resolve(authService.getState()),
        Promise.resolve(rateLimitingService.getStats()),
        Promise.resolve(authService.getSecurityEvents())
      ]);

      setAuthState(authStateData);
      setRateLimitStats(rateLimitStatsData);
      setSecurityEvents(securityEventsData);

    } catch (error) {
      console.error('❌ Erreur chargement données sécurité:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul de l'aperçu de sécurité
  const securityOverview = useMemo((): SecurityOverview => {
    return {
      authentication: {
        isActive: !!authService.getState,
        usersOnline: authState?.isAuthenticated ? 1 : 0,
        failedAttempts: securityEvents.filter(e => 
          e.type === 'login' && 
          e.details.action === 'failed_login' &&
          e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        alertsCount: securityEvents.filter(e => 
          e.severity === 'high' || e.severity === 'critical'
        ).length
      },
      rateLimiting: {
        isActive: rateLimitingService.isReady(),
        requestsBlocked: rateLimitStats?.blockedRequests || 0,
        currentLoad: rateLimitingService.getSystemLoad(),
        rulesCount: rateLimitingService.getRules().length
      },
      validation: {
        isActive: validationService.isReady(),
        threatsBlocked: 0, // À implémenter avec des métriques de validation
        validationRate: 0.95, // Simulation
        rulesCount: validationService.getRules().length
      },
      encryption: {
        isActive: encryptionService.isReady(),
        keysActive: encryptionService.getKeyStats().activeKeys,
        encryptionRate: 0.98, // Simulation
        dataProtected: '2.4 GB' // Simulation
      }
    };
  }, [authState, rateLimitStats, securityEvents]);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  if (isLoading && !authState) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* En-tête */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              🛡️ Centre de Sécurité
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                Object.values(securityOverview).every(s => s.isActive)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {Object.values(securityOverview).every(s => s.isActive) ? '🟢 Sécurisé' : '🟡 Attention'}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  autoRefresh 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manuel'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1min</option>
              <option value={300000}>5min</option>
            </select>
            <button
              onClick={loadSecurityData}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex space-x-4 mt-4">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'auth', label: 'Authentification', icon: '🔐' },
            { id: 'rate-limit', label: 'Rate Limiting', icon: '⚡' },
            { id: 'validation', label: 'Validation', icon: '🛡️' },
            { id: 'encryption', label: 'Chiffrement', icon: '🔒' },
            { id: 'logs', label: `Événements (${securityEvents.length})`, icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Authentification */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">🔐 Authentification</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(securityOverview.authentication.isActive)}`}>
                    {securityOverview.authentication.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilisateurs en ligne:</span>
                    <span className="font-medium">{securityOverview.authentication.usersOnline}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tentatives échouées (24h):</span>
                    <span className="font-medium text-red-600">{securityOverview.authentication.failedAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alertes actives:</span>
                    <span className="font-medium text-orange-600">{securityOverview.authentication.alertsCount}</span>
                  </div>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">⚡ Rate Limiting</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(securityOverview.rateLimiting.isActive)}`}>
                    {securityOverview.rateLimiting.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Requêtes bloquées:</span>
                    <span className="font-medium text-red-600">{securityOverview.rateLimiting.requestsBlocked}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Charge système:</span>
                    <span className="font-medium">{(securityOverview.rateLimiting.currentLoad * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Règles actives:</span>
                    <span className="font-medium">{securityOverview.rateLimiting.rulesCount}</span>
                  </div>
                </div>
              </div>

              {/* Validation */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">🛡️ Validation</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(securityOverview.validation.isActive)}`}>
                    {securityOverview.validation.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Menaces bloquées:</span>
                    <span className="font-medium text-red-600">{securityOverview.validation.threatsBlocked}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taux de validation:</span>
                    <span className="font-medium text-green-600">{(securityOverview.validation.validationRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Règles actives:</span>
                    <span className="font-medium">{securityOverview.validation.rulesCount}</span>
                  </div>
                </div>
              </div>

              {/* Chiffrement */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">🔒 Chiffrement</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(securityOverview.encryption.isActive)}`}>
                    {securityOverview.encryption.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clés actives:</span>
                    <span className="font-medium">{securityOverview.encryption.keysActive}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taux de chiffrement:</span>
                    <span className="font-medium text-green-600">{(securityOverview.encryption.encryptionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Données protégées:</span>
                    <span className="font-medium">{securityOverview.encryption.dataProtected}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique de statut global */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📈 État de Sécurité Global</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Authentification</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: securityOverview.authentication.isActive ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {securityOverview.authentication.isActive ? '100%' : '0%'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rate Limiting</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(1 - securityOverview.rateLimiting.currentLoad) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {((1 - securityOverview.rateLimiting.currentLoad) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validation</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${securityOverview.validation.validationRate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {(securityOverview.validation.validationRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Chiffrement</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${securityOverview.encryption.encryptionRate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {(securityOverview.encryption.encryptionRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* État de l'authentification */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">👤 État Utilisateur</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Connecté:</span>
                    <span className={authState?.isAuthenticated ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {authState?.isAuthenticated ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                  {authState?.user && (
                    <>
                      <div className="flex justify-between">
                        <span>Utilisateur:</span>
                        <span className="font-medium">{authState.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rôles:</span>
                        <span className="font-medium">{authState.user.roles.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium capitalize">{authState.user.subscription.plan}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">⚡ Actions Rapides</h3>
                <div className="space-y-2">
                  <button                  onClick={async () => {
                    console.log('🧪 Test d\'authentification simulé');
                    alert('Test simulé - Service disponible ✅');
                  }}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    🧪 Test Authentification
                  </button>
                  
                  <button                  onClick={() => {
                    console.log('🗑️ Simulation effacement cache');
                    alert('Cache simulé effacé');
                  }}
                    className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                  >
                    🗑️ Vider Cache
                  </button>
                  
                  {authState?.isAuthenticated && (
                    <button
                      onClick={() => authService.logout()}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      🚪 Se Déconnecter
                    </button>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">📊 Statistiques</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Événements sécurité:</span>
                    <span className="font-medium">{securityEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alertes critiques:</span>
                    <span className="font-medium text-red-600">
                      {securityEvents.filter(e => e.severity === 'critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière activité:</span>
                    <span className="font-medium">
                      {securityEvents.length > 0 
                        ? securityEvents[0].timestamp.toLocaleTimeString()
                        : 'Aucune'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rate-limit' && rateLimitStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Requêtes Totales</div>
                <div className="text-2xl font-bold text-blue-900">
                  {rateLimitStats.totalRequests.toLocaleString()}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 text-sm font-medium">Requêtes Bloquées</div>
                <div className="text-2xl font-bold text-red-900">
                  {rateLimitStats.blockedRequests.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Taux de Blocage</div>
                <div className="text-2xl font-bold text-green-900">
                  {(rateLimitStats.blockRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">Charge Système</div>
                <div className="text-2xl font-bold text-purple-900">
                  {(rateLimitingService.getSystemLoad() * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Actions de gestion */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎛️ Contrôles Rate Limiting</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => rateLimitingService.resetStats()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔄 Reset Stats
                </button>
                <button
                  onClick={() => rateLimitingService.simulateLoad(0.9)}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  ⚡ Simuler Charge
                </button>
                <button
                  onClick={() => rateLimitingService.simulateLoad(0.1)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📉 Réduire Charge
                </button>
                <button
                  onClick={() => {
                    rateLimitingService.updateAdaptiveConfig({ enabled: true });
                    alert('Mode adaptatif activé');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🧠 Mode Adaptatif
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">📝 Règles de Validation</h3>
                <div className="space-y-2">
                  {validationService.getRules().slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <span className="text-sm">{rule.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">🎯 Filtres de Contenu</h3>
                <div className="space-y-2">
                  {validationService.getContentFilters().slice(0, 5).map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between">
                      <span className="text-sm">{filter.name}</span>
                      <span className="text-xs text-gray-500">
                        {filter.patterns.length} patterns
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">📊 Statistiques</h3>
                <div className="space-y-2">
                  {(() => {
                    const stats = validationService.getValidationStats();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Règles:</span>
                          <span className="font-medium">{stats.rulesCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Filtres:</span>
                          <span className="font-medium">{stats.filtersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Modèles IA:</span>
                          <span className="font-medium">{stats.modelsLoaded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">État:</span>
                          <span className={`font-medium ${stats.isReady ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.isReady ? 'Prêt' : 'Non prêt'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'encryption' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">🔑 Gestion des Clés</h3>
                <div className="space-y-3">
                  {(() => {
                    const keyStats = encryptionService.getKeyStats();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Clés totales:</span>
                          <span className="font-medium">{keyStats.totalKeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clés actives:</span>
                          <span className="font-medium text-green-600">{keyStats.activeKeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clés dépréciées:</span>
                          <span className="font-medium text-yellow-600">{keyStats.deprecatedKeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clés révoquées:</span>
                          <span className="font-medium text-red-600">{keyStats.revokedKeys}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-3">⚙️ Configuration</h3>
                <div className="space-y-3">
                  {(() => {
                    const config = encryptionService.getConfig();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Algorithme:</span>
                          <span className="font-medium">{config.algorithm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Longueur clé:</span>
                          <span className="font-medium">{config.keyLength} bits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Longueur IV:</span>
                          <span className="font-medium">{config.ivLength} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Itérations PBKDF2:</span>
                          <span className="font-medium">{config.iterations.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Actions de test */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🧪 Tests de Chiffrement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={async () => {
                    const result = await encryptionService.testEncryption();
                    alert(result ? 'Test réussi ✅' : 'Test échoué ❌');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔐 Test Chiffrement
                </button>
                <button
                  onClick={async () => {
                    try {
                      const encrypted = await encryptionService.encryptUserData(
                        { demo: true, timestamp: Date.now() },
                        'demo_user'
                      );
                      console.log('Données utilisateur chiffrées:', encrypted);
                      alert('Données utilisateur chiffrées ✅');
                    } catch (error) {
                      alert('Erreur chiffrement ❌');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  👤 Test Données Utilisateur
                </button>
                <button
                  onClick={async () => {
                    try {
                      const encrypted = await encryptionService.encryptAPIKey(
                        'sk-demo-key-123',
                        'openai'
                      );
                      console.log('Clé API chiffrée:', encrypted);
                      alert('Clé API chiffrée ✅');
                    } catch (error) {
                      alert('Erreur chiffrement clé API ❌');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🔑 Test Clé API
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <div className="text-gray-600">Aucun événement de sécurité</div>
                <div className="text-sm text-gray-500">Les événements apparaîtront ici</div>
              </div>
            ) : (
              <div className="space-y-3">
                {securityEvents.slice(0, 50).map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">
                            {event.type === 'login' ? '🔑' :
                             event.type === 'logout' ? '🚪' :
                             event.type === 'permission_denied' ? '🚫' :
                             event.type === 'suspicious_activity' ? '⚠️' : '📋'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 mb-1">
                          {event.details.action ? `${event.details.action}: ` : ''}
                          {event.details.resource || 'Activité système'}
                        </div>
                        <div className="text-xs text-gray-500 space-x-4">
                          <span>{event.timestamp.toLocaleString()}</span>
                          {event.details.ipAddress && <span>IP: {event.details.ipAddress}</span>}
                          {event.userId && <span>Utilisateur: {event.userId}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
