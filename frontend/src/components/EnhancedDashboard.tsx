/**
 * 🎮 Composant Principal pour les Améliorations Avancées
 * Intégration des fonctionnalités WebSocket, API, Visualisations et Offline
 */

import React, { useState, useEffect } from 'react';
import { useAdvancedWebSocket } from '../services/WebSocketManager';
import { useAPIQuery, useAPIMutation, usePersistedState } from '../hooks/useRobustAPI';
import { useOfflineManager } from '../services/OfflineManager';
import { InteractiveLearningViz } from './visualizations/LearningVisualizationsD3';
import { LearningWorld3D } from './visualizations/LearningWorld3D';

// Types pour les données
interface EnhancedLearningData {
  nodes: Array<{
    id: string;
    name: string;
    type: 'concept' | 'skill' | 'topic' | 'achievement';
    level: number;
    mastery: number;
    connections: string[];
    position?: { x: number; y: number; z?: number };
  }>;
  progressData: Array<{
    date: Date;
    score: number;
    topics: string[];
    timeSpent: number;
  }>;
  skills: Array<{
    name: string;
    value: number;
    maxValue: number;
  }>;
}

interface EnhancedDashboardProps {
  userId: string;
  className?: string;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ userId, className = '' }) => {
  // États locaux
  const [activeTab, setActiveTab] = usePersistedState('dashboard-active-tab', 'overview');
  const [selectedWorld, setSelectedWorld] = useState('default');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Gestionnaire offline
  const {
    isInitialized: offlineReady,
    isOnline,
    syncQueue,
    saveOfflineData,
    getOfflineData,
    syncPendingData,
    getCacheStats,
    pendingCount
  } = useOfflineManager();

  // WebSocket avancé
  const {
    state: wsState,
    metrics: wsMetrics,
    send: sendWebSocketMessage,
    subscribe: subscribeToMessages,
    isConnected: wsConnected
  } = useAdvancedWebSocket({
    url: `ws://localhost:8001/ws/enhanced/${userId}`,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    enableLogging: true
  });

  // Requêtes API robustes
  const { 
    data: learningData, 
    isLoading: dataLoading, 
    error: dataError,
    refetch: refetchData 
  } = useAPIQuery<EnhancedLearningData>(
    ['learning-data', userId],
    `/learning/enhanced/${userId}`,
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        // Sauvegarder en cache offline
        if (offlineReady) {
          saveOfflineData('lessons', data, { userId, priority: 'high' });
        }
      }
    }
  );

  // Mutation pour mise à jour de progression
  const progressMutation = useAPIMutation(
    (progress: any) => 
      fetch(`/api/learning/progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      }).then(r => r.json()),
    {
      onSuccess: () => {
        console.log('✅ Progression sauvegardée');
      },
      onError: (error) => {
        console.error('❌ Erreur sauvegarde:', error);
        // Sauvegarder localement en cas d'erreur
        if (offlineReady) {
          saveOfflineData('progress', error, { userId, needsSync: true });
        }
      }
    }
  );

  // Données par défaut pour la démo
  const defaultLearningData: EnhancedLearningData = {
    nodes: [
      {
        id: 'math-1',
        name: 'Algèbre de base',
        type: 'concept',
        level: 1,
        mastery: 0.8,
        connections: ['math-2'],
        position: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'math-2',
        name: 'Équations linéaires',
        type: 'skill',
        level: 2,
        mastery: 0.6,
        connections: ['math-3'],
        position: { x: 10, y: 5, z: 2 }
      },
      {
        id: 'math-3',
        name: 'Fonctions',
        type: 'topic',
        level: 3,
        mastery: 0.4,
        connections: [],
        position: { x: 20, y: 10, z: 5 }
      }
    ],
    progressData: [
      { date: new Date('2024-01-01'), score: 65, topics: ['math'], timeSpent: 120 },
      { date: new Date('2024-01-02'), score: 72, topics: ['math'], timeSpent: 90 },
      { date: new Date('2024-01-03'), score: 78, topics: ['math'], timeSpent: 105 },
      { date: new Date('2024-01-04'), score: 85, topics: ['math'], timeSpent: 80 }
    ],
    skills: [
      { name: 'Mathématiques', value: 75, maxValue: 100 },
      { name: 'Sciences', value: 60, maxValue: 100 },
      { name: 'Langues', value: 85, maxValue: 100 },
      { name: 'Histoire', value: 70, maxValue: 100 },
      { name: 'Programmation', value: 90, maxValue: 100 }
    ]
  };

  const displayData = learningData || defaultLearningData;

  // Monde 3D pour la visualisation
  const learningWorld = {
    id: 'enhanced-world',
    name: 'Monde d\'Apprentissage Immersif',
    nodes: displayData.nodes.map(node => ({
      ...node,
      position: {
        x: node.position?.x ?? Math.random() * 40 - 20,
        y: node.position?.y ?? Math.random() * 40 - 20,
        z: node.position?.z !== undefined ? node.position.z : Math.random() * 40 - 20
      }
    })),
    environment: 'space' as const,
    theme: 'educational'
  };

  // Effets pour la synchronisation
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (wsConnected) {
      setConnectionStatus('connected');
      
      // S'abonner aux mises à jour de progression
      unsubscribe = subscribeToMessages('progress_update', (message) => {
        console.log('📊 Mise à jour progression reçue:', message);
        refetchData(); // Recharger les données
      });
    } else {
      setConnectionStatus(wsState === 'connecting' ? 'connecting' : 'disconnected');
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [wsConnected, wsState, subscribeToMessages, refetchData]);

  // Synchronisation automatique quand on revient en ligne
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncPendingData();
    }
  }, [isOnline, pendingCount, syncPendingData]);

  // Gestionnaires d'événements
  const handleNodeClick = (node: any) => {
    console.log('🎯 Nœud sélectionné:', node);
    
    // Envoyer via WebSocket
    if (wsConnected) {
      sendWebSocketMessage('node_interaction', {
        nodeId: node.id,
        action: 'click',
        timestamp: Date.now()
      });
    }

    // Sauvegarder l'action localement
    if (offlineReady) {
      saveOfflineData('user_actions', {
        type: 'node_click',
        nodeId: node.id,
        timestamp: Date.now()
      }, { userId });
    }
  };

  const handleProgressUpdate = (progress: any) => {
    // Tenter la mutation
    progressMutation.mutate(progress);
  };

  // Statut de connexion
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚫';
    }
  };

  return (
    <div className={`enhanced-dashboard ${className}`}>
      {/* Header avec status */}
      <div className="dashboard-header bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🚀 Dashboard EduAI Enhanced
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Statut de connexion */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()} {connectionStatus}
              </span>
            </div>

            {/* Statut offline */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                {isOnline ? '🌐 En ligne' : '📴 Hors ligne'}
              </span>
              {pendingCount > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {pendingCount} en attente
                </span>
              )}
            </div>

            {/* Métriques WebSocket */}
            {wsMetrics && (
              <div className="text-xs text-gray-500">
                📨 {wsMetrics.messagesReceived} | 📤 {wsMetrics.messagesSent}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4">
          <nav className="flex space-x-1">
            {[
              { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
              { id: 'network', label: '🕸️ Réseau de connaissances', icon: '🕸️' },
              { id: 'world3d', label: '🌍 Monde 3D', icon: '🌍' },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' },
              { id: 'settings', label: '⚙️ Paramètres', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="dashboard-content p-6">
        {activeTab === 'overview' && (
          <div className="overview-tab space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats principales */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Progression Générale</h3>
                  <InteractiveLearningViz
                    data={displayData.nodes}
                    progressData={displayData.progressData}
                    skills={displayData.skills}
                  />
                </div>
              </div>

              {/* Panneau latéral */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h4 className="font-semibold mb-3">🎯 Objectifs du jour</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mathématiques</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">80%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sciences</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Langues</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">85%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h4 className="font-semibold mb-3">🔗 Connexions récentes</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Algèbre → Équations</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>Fonctions → Graphiques</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Variables → Expressions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="network-tab">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">🕸️ Réseau de Connaissances Interactif</h3>
              <InteractiveLearningViz
                data={displayData.nodes}
                progressData={displayData.progressData}
                skills={displayData.skills}
              />
            </div>
          </div>
        )}

        {activeTab === 'world3d' && (
          <div className="world3d-tab">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <LearningWorld3D
                worldData={learningWorld}
                onNodeClick={handleNodeClick}
                onEnvironmentChange={(env) => console.log('Environnement changé:', env)}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-600">Score moyen</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(displayData.progressData.reduce((sum, p) => sum + p.score, 0) / displayData.progressData.length)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">⏱️</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-600">Temps total</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(displayData.progressData.reduce((sum, p) => sum + p.timeSpent, 0) / 60)}h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-600">Compétences</h4>
                    <p className="text-2xl font-bold text-gray-900">{displayData.skills.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600 text-xl">🔗</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-600">Connexions</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayData.nodes.reduce((sum, node) => sum + node.connections.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques détaillés */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Évolution détaillée</h3>
              <InteractiveLearningViz
                data={displayData.nodes}
                progressData={displayData.progressData}
                skills={displayData.skills}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ Paramètres avancés</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">🔗 WebSocket</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>État: <span className={getConnectionStatusColor()}>{connectionStatus}</span></p>
                    <p>Messages reçus: {wsMetrics?.messagesReceived || 0}</p>
                    <p>Messages envoyés: {wsMetrics?.messagesSent || 0}</p>
                    <p>Reconnexions: {wsMetrics?.reconnections || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">💾 Cache local</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Mode: {isOnline ? 'En ligne' : 'Hors ligne'}</p>
                    <p>Éléments en attente: {pendingCount}</p>
                    <p>Base initialisée: {offlineReady ? 'Oui' : 'Non'}</p>
                    
                    <button
                      onClick={syncPendingData}
                      disabled={!isOnline || pendingCount === 0}
                      className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs disabled:opacity-50"
                    >
                      🔄 Synchroniser maintenant
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">🎮 Visualisations</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Mode 3D: Activé</p>
                    <p>Animations: Activées</p>
                    <p>Particules: Performance élevée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
