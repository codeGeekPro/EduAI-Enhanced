/**
 * 📊 Tableau de Bord Monitoring IA
 * Interface complète pour surveiller les performances IA et le cache
 */

import React, { useState, useEffect, useMemo } from 'react';
import { aiMetrics, AIPerformanceStats, AIAlert } from '../services/AIMonitoring';
import { aiCache, CacheStats } from '../services/AICache';

interface AIMonitoringDashboardProps {
  className?: string;
}

interface MetricsDisplay {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  severity?: 'good' | 'warning' | 'critical';
}

export const AIMonitoringDashboard: React.FC<AIMonitoringDashboardProps> = ({ 
  className = '' 
}) => {
  // États du composant
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'cache' | 'alerts'>('overview');
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week'>('day');
  const [stats, setStats] = useState<AIPerformanceStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Chargement des données
  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000); // Rafraîchir toutes les 30s
      return () => clearInterval(interval);
    }
  }, [timeframe, autoRefresh]);

  // Écouter les nouvelles alertes
  useEffect(() => {
    const handleAlert = (event: CustomEvent) => {
      setAlerts(prev => [event.detail, ...prev]);
    };

    window.addEventListener('ai-alert', handleAlert as EventListener);
    return () => window.removeEventListener('ai-alert', handleAlert as EventListener);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Calculer la période selon le timeframe
      const now = new Date();
      let start: Date;
      
      switch (timeframe) {
        case 'hour':
          start = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Charger les statistiques
      const performanceStats = aiMetrics.getPerformanceStats({ start, end: now });
      const cacheStatistics = aiCache.getStats();
      const activeAlerts = aiMetrics.getActiveAlerts();

      setStats(performanceStats);
      setCacheStats(cacheStatistics);
      setAlerts(activeAlerts);

    } catch (error) {
      console.error('❌ Erreur chargement données monitoring:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculs des métriques d'affichage
  const metricsDisplay = useMemo((): MetricsDisplay[] => {
    if (!stats || !cacheStats) return [];

    return [
      {
        label: 'Requêtes IA',
        value: stats.totalRequests.toLocaleString(),
        severity: stats.totalRequests > 1000 ? 'good' : 'warning'
      },
      {
        label: 'Taux de Succès',
        value: (stats.successRate * 100).toFixed(1),
        unit: '%',
        severity: stats.successRate > 0.95 ? 'good' : stats.successRate > 0.8 ? 'warning' : 'critical'
      },
      {
        label: 'Latence Moyenne',
        value: Math.round(stats.averageLatency),
        unit: 'ms',
        severity: stats.averageLatency < 2000 ? 'good' : stats.averageLatency < 5000 ? 'warning' : 'critical'
      },
      {
        label: 'Coût Total',
        value: stats.totalCost.toFixed(2),
        unit: '$',
        severity: stats.totalCost < 10 ? 'good' : stats.totalCost < 50 ? 'warning' : 'critical'
      },
      {
        label: 'Tokens Utilisés',
        value: stats.totalTokens.toLocaleString(),
        severity: 'good'
      },
      {
        label: 'Taux Cache',
        value: (cacheStats.hitRate * 100).toFixed(1),
        unit: '%',
        severity: cacheStats.hitRate > 0.8 ? 'good' : cacheStats.hitRate > 0.5 ? 'warning' : 'critical'
      },
      {
        label: 'Économies',
        value: cacheStats.costSaved.toFixed(2),
        unit: '$',
        severity: 'good'
      },
      {
        label: 'Alertes Actives',
        value: alerts.length,
        severity: alerts.length === 0 ? 'good' : alerts.some(a => a.severity === 'critical') ? 'critical' : 'warning'
      }
    ];
  }, [stats, cacheStats, alerts]);

  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity?: string): string => {
    switch (severity) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return 'ℹ️';
    }
  };

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading && !stats) {
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
              📊 Monitoring IA
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manuel'}
              </button>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Sélecteur de période */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="hour">Dernière heure</option>
            <option value="day">Dernier jour</option>
            <option value="week">Dernière semaine</option>
          </select>
        </div>

        {/* Navigation des onglets */}
        <div className="flex space-x-4 mt-4">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'metrics', label: 'Métriques', icon: '📈' },
            { id: 'cache', label: 'Cache', icon: '💾' },
            { id: 'alerts', label: `Alertes (${alerts.length})`, icon: '🚨' }
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metricsDisplay.map((metric, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSeverityColor(metric.severity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-lg">{getSeverityIcon(metric.severity)}</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {metric.value}
                    {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Tendances rapides */}
            {stats && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">📈 Répartition par Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stats.byService).map(([service, data]) => (
                    <div key={service} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900 capitalize mb-2">{service}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Requêtes: {data.requests}</div>
                        <div>Latence: {Math.round(data.avgLatency)}ms</div>
                        <div>Succès: {(data.successRate * 100).toFixed(1)}%</div>
                        <div>Coût: ${data.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Métriques détaillées */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">📊 Statistiques Détaillées</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total des requêtes:</span>
                    <span className="font-medium">{stats.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de succès:</span>
                    <span className="font-medium">{(stats.successRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latence moyenne:</span>
                    <span className="font-medium">{Math.round(stats.averageLatency)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens totaux:</span>
                    <span className="font-medium">{stats.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coût total:</span>
                    <span className="font-medium">${stats.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erreurs:</span>
                    <span className="font-medium text-red-600">{stats.errorCount}</span>
                  </div>
                </div>
              </div>

              {/* Répartition par modèle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">🤖 Utilisation par Modèle</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byModel).map(([model, data]) => (
                    <div key={model} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900 mb-2">{model}</div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                        <div>Requêtes: {data.requests}</div>
                        <div>Latence: {Math.round(data.avgLatency)}ms</div>
                        <div>Tokens: {data.tokens.toLocaleString()}</div>
                        <div>Coût: ${data.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cache' && cacheStats && (
          <div className="space-y-6">
            {/* Statistiques du cache */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Entrées en Cache</div>
                <div className="text-2xl font-bold text-blue-900">
                  {cacheStats.totalEntries.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Taux de Réussite</div>
                <div className="text-2xl font-bold text-green-900">
                  {(cacheStats.hitRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">Taille Totale</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatBytes(cacheStats.totalSize)}
                </div>
              </div>
            </div>

            {/* Économies et performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">💰 Économies Réalisées</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-green-600 font-bold text-xl">
                    ${cacheStats.costSaved.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Coût économisé</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-blue-600 font-bold text-xl">
                    {cacheStats.tokensSaved.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Tokens économisés</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-orange-600 font-bold text-xl">
                    {cacheStats.totalHits.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Hits totaux</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-red-600 font-bold text-xl">
                    {cacheStats.totalMisses.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Misses totaux</div>
                </div>
              </div>
            </div>

            {/* Entrées les plus utilisées */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔥 Entrées les Plus Utilisées</h3>
                <button
                  onClick={() => aiCache.clear()}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  🗑️ Vider le Cache
                </button>
              </div>
              <div className="space-y-2">
                {aiCache.getTopHitEntries(5).map(({ key, entry }, index) => (
                  <div key={key} className="bg-white p-3 rounded border flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {key.length > 50 ? `${key.substring(0, 50)}...` : key}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.metadata.service} • {formatBytes(entry.metadata.size)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">
                        {entry.metadata.hits} hits
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.metadata.cost ? `$${entry.metadata.cost.toFixed(3)}` : 'Gratuit'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-4xl mb-2">✅</div>
                <div className="text-gray-600">Aucune alerte active</div>
                <div className="text-sm text-gray-500">Toutes les métriques IA sont normales</div>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-400'
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-400'
                      : alert.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">
                          {alert.severity === 'critical' ? '🚨' : 
                           alert.severity === 'high' ? '⚠️' : 
                           alert.severity === 'medium' ? '⚡' : 'ℹ️'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-900 font-medium mb-1">
                        {alert.message}
                      </div>
                      <div className="text-sm text-gray-600">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => aiMetrics.resolveAlert(alert.id)}
                      className="ml-4 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      ✅ Résoudre
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMonitoringDashboard;
