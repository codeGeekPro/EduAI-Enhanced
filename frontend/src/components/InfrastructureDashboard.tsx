/**
 * 🎛️ Dashboard d'Infrastructure EduAI
 * Interface de monitoring et gestion de toute l'infrastructure
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Server, Database, Globe, 
  Layers, Activity, Users, Clock,
  Settings, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Zap, BarChart3,
  HardDrive, Wifi, Upload, Download
} from 'lucide-react';

// Import des services
import { loadBalancingService } from '../services/LoadBalancingService';
import { aiQueueService } from '../services/AIQueueService';
import { databasePoolingService } from '../services/DatabasePoolingService';
import { cdnService } from '../services/CDNService';
import { aiMetrics } from '../services/AIMonitoring';

interface InfrastructureMetrics {
  loadBalancer: {
    activeInstances: number;
    totalRequests: number;
    averageLatency: number;
    failoverEvents: number;
  };
  queue: {
    totalTasks: number;
    runningTasks: number;
    completedTasks: number;
    successRate: number;
    throughput: number;
  };
  database: {
    totalConnections: number;
    activeConnections: number;
    averageQueryTime: number;
    cacheHitRatio: number;
  };
  cdn: {
    totalAssets: number;
    totalBandwidth: number;
    hitRatio: number;
    costSavings: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: { in: number; out: number };
  };
}

export const InfrastructureDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<InfrastructureMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Charger les métriques
  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      // Charger toutes les métriques en parallèle
      const [
        loadBalancerInstances,
        queueStats,
        dbPools,
        cdnStats,
        aiMetricsStats
      ] = await Promise.all([
        loadBalancingService.getActiveInstances(),
        aiQueueService.getStats(),
        databasePoolingService.getPools(),
        cdnService.getStats(),
        aiMetrics.getPerformanceStats({
          start: new Date(Date.now() - 60 * 60 * 1000),
          end: new Date()
        })
      ]);

      // Calculer les métriques database
      const totalConnections = dbPools.reduce((sum, pool) => sum + pool.totalConnections, 0);
      const activeConnections = dbPools.reduce((sum, pool) => sum + pool.activeConnections, 0);
      const averageQueryTime = dbPools.reduce((sum, pool) => sum + pool.stats.averageQueryTime, 0) / dbPools.length;

      // Simuler les métriques système
      const systemMetrics = {
        cpuUsage: 45 + Math.random() * 20,
        memoryUsage: 60 + Math.random() * 15,
        diskUsage: 35 + Math.random() * 10,
        networkIO: {
          in: Math.random() * 100,
          out: Math.random() * 80
        }
      };

      setMetrics({
        loadBalancer: {
          activeInstances: loadBalancerInstances.length,
          totalRequests: aiMetricsStats.totalRequests,
          averageLatency: aiMetricsStats.averageLatency,
          failoverEvents: 2 // Simulé
        },
        queue: {
          totalTasks: queueStats.totalTasks,
          runningTasks: queueStats.runningTasks,
          completedTasks: queueStats.completedTasks,
          successRate: queueStats.successRate,
          throughput: queueStats.throughputPerHour
        },
        database: {
          totalConnections,
          activeConnections,
          averageQueryTime,
          cacheHitRatio: 0.85 // Simulé
        },
        cdn: {
          totalAssets: cdnStats.totalAssets,
          totalBandwidth: cdnStats.totalBandwidth,
          hitRatio: cdnStats.hitRatio,
          costSavings: cdnStats.costSavings
        },
        system: systemMetrics
      });

    } catch (error) {
      console.error('❌ Erreur chargement métriques infrastructure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // 30 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Composants de métrique
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          <TrendingUp 
            className={`w-4 h-4 mr-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`} 
          />
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs dernière heure</span>
        </div>
      )}
    </div>
  );

  // Status indicator
  const StatusIndicator: React.FC<{ status: 'healthy' | 'warning' | 'critical'; label: string }> = ({ status, label }) => {
    const colors = {
      healthy: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      critical: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    
    const { bg, text, icon: Icon } = colors[status];
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </div>
    );
  };

  // Format des nombres
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des métriques infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Server className="w-8 h-8 mr-3 text-blue-600" />
              Infrastructure Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitoring et gestion de l'infrastructure EduAI</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </button>
            
            <button
              onClick={loadMetrics}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="mt-6 flex items-center space-x-4">
          <StatusIndicator status="healthy" label="Load Balancer" />
          <StatusIndicator status="healthy" label="Queue System" />
          <StatusIndicator status="warning" label="Database" />
          <StatusIndicator status="healthy" label="CDN" />
          <StatusIndicator status="healthy" label="Système" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'loadbalancer', label: 'Load Balancer', icon: Layers },
            { id: 'queue', label: 'Queue System', icon: Clock },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'cdn', label: 'CDN', icon: Globe },
            { id: 'system', label: 'Système', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Instances IA actives"
              value={metrics.loadBalancer.activeInstances}
              change={5.2}
              icon={<Server className="w-6 h-6 text-blue-600" />}
              color="#3B82F6"
              subtitle="Load balancing optimal"
            />
            
            <MetricCard
              title="Tâches en queue"
              value={formatNumber(metrics.queue.runningTasks)}
              change={-12.3}
              icon={<Clock className="w-6 h-6 text-orange-600" />}
              color="#F59E0B"
              subtitle={`${formatNumber(metrics.queue.totalTasks)} total`}
            />
            
            <MetricCard
              title="Connexions DB"
              value={`${metrics.database.activeConnections}/${metrics.database.totalConnections}`}
              change={8.1}
              icon={<Database className="w-6 h-6 text-purple-600" />}
              color="#8B5CF6"
              subtitle={`${metrics.database.averageQueryTime.toFixed(0)}ms avg`}
            />
            
            <MetricCard
              title="Assets CDN"
              value={formatNumber(metrics.cdn.totalAssets)}
              change={15.7}
              icon={<Globe className="w-6 h-6 text-green-600" />}
              color="#10B981"
              subtitle={`${formatBytes(metrics.cdn.totalBandwidth)} transfered`}
            />
          </div>

          {/* Métriques système */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Utilisation des ressources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Utilisation des ressources
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'CPU', value: metrics.system.cpuUsage, color: '#3B82F6' },
                  { label: 'Mémoire', value: metrics.system.memoryUsage, color: '#10B981' },
                  { label: 'Disque', value: metrics.system.diskUsage, color: '#F59E0B' }
                ].map(resource => (
                  <div key={resource.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{resource.label}</span>
                      <span className="text-gray-900">{resource.value.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${resource.value}%`,
                          backgroundColor: resource.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance réseau */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-green-600" />
                Performance réseau
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Entrant</p>
                  <p className="text-xl font-bold text-blue-600">
                    {metrics.system.networkIO.in.toFixed(1)} Mbps
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Sortant</p>
                  <p className="text-xl font-bold text-green-600">
                    {metrics.system.networkIO.out.toFixed(1)} Mbps
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Latence moyenne: <span className="font-semibold">{metrics.loadBalancer.averageLatency.toFixed(0)}ms</span>
                </p>
              </div>
            </div>
          </div>

          {/* Alertes et recommandations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Alertes et recommandations
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Cache de base de données sous-optimal</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Le taux de hit du cache est de {(metrics.database.cacheHitRatio * 100).toFixed(1)}%. 
                    Considérez augmenter la taille du cache.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Optimisation CDN efficace</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Économies réalisées: ${metrics.cdn.costSavings.toFixed(2)} ce mois-ci grâce au CDN.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Queue system performant</p>
                  <p className="text-sm text-green-700 mt-1">
                    Taux de succès de {(metrics.queue.successRate * 100).toFixed(1)}% avec un throughput de {metrics.queue.throughput} tâches/heure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Autres onglets (Load Balancer, Queue, etc.) seraient implementés ici */}
      {activeTab === 'loadbalancer' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Balancer</h3>
          <p className="text-gray-600">Configuration et monitoring du load balancer...</p>
          {/* Interface détaillée du load balancer */}
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue System</h3>
          <p className="text-gray-600">Gestion des tâches en queue...</p>
          {/* Interface détaillée du système de queue */}
        </div>
      )}

      {activeTab === 'database' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database</h3>
          <p className="text-gray-600">Monitoring des connexions et performances...</p>
          {/* Interface détaillée de la base de données */}
        </div>
      )}

      {activeTab === 'cdn' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CDN</h3>
          <p className="text-gray-600">Gestion des assets et distribution...</p>
          {/* Interface détaillée du CDN */}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Système</h3>
          <p className="text-gray-600">Métriques système détaillées...</p>
          {/* Interface détaillée du système */}
        </div>
      )}
    </div>
  );
};

export default InfrastructureDashboard;
