/**
 * 📊 Composant de monitoring des performances en temps réel
 */

import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNetworkStatus, useOfflineData } from '../../hooks/useNetwork';
import { useUIStore } from '../../stores/uiStore';

const PerformanceMonitor: React.FC = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();
  const { offlineStats } = useOfflineData();
  const performanceMetrics = useUIStore(state => state.performanceMetrics);
  
  const [showDetails, setShowDetails] = useState(false);
  const [vitals, setVitals] = useState({
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    fcp: 0, // First Contentful Paint
    ttfb: 0 // Time to First Byte
  });

  useEffect(() => {
    // Mesurer les Core Web Vitals
    const measureVitals = async () => {
      if ('web-vital' in window) {
        // Utiliser la librairie web-vitals si disponible
        const { getCLS, getFCP, getFID, getLCP, getTTFB } = await import('web-vitals');
        
        getCLS(metric => setVitals(prev => ({ ...prev, cls: metric.value })));
        getFCP(metric => setVitals(prev => ({ ...prev, fcp: metric.value })));
        getFID(metric => setVitals(prev => ({ ...prev, fid: metric.value })));
        getLCP(metric => setVitals(prev => ({ ...prev, lcp: metric.value })));
        getTTFB(metric => setVitals(prev => ({ ...prev, ttfb: metric.value })));
      } else {
        // Fallback manuel
        if (performance.timing) {
          const timing = performance.timing;
          setVitals(prev => ({
            ...prev,
            ttfb: timing.responseStart - timing.navigationStart,
            fcp: timing.loadEventEnd - timing.navigationStart
          }));
        }
      }
    };

    measureVitals();
  }, []);

  const getPerformanceScore = () => {
    const { apiLatency, loadTime, errorCount } = performanceMetrics;
    
    let score = 100;
    
    // Pénalités basées sur les métriques
    if (apiLatency > 1000) score -= 20;
    else if (apiLatency > 500) score -= 10;
    
    if (loadTime > 3000) score -= 15;
    else if (loadTime > 1000) score -= 5;
    
    score -= errorCount * 5;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const score = getPerformanceScore();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicator compact */}
      <div 
        className={`bg-white rounded-lg shadow-lg p-3 cursor-pointer transition-all duration-200 ${
          showDetails ? 'w-80' : 'w-auto'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-3">
          {/* Status réseau */}
          <div className="flex items-center">
            {isOnline ? (
              isReconnecting ? (
                <div className="animate-spin">
                  <Wifi className="h-4 w-4 text-blue-500" />
                </div>
              ) : (
                <Wifi className="h-4 w-4 text-green-500" />
              )
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>

          {/* Score de performance */}
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <span className={`font-medium ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>

          {/* Indicateur d'erreurs */}
          {performanceMetrics.errorCount > 0 && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}

          {/* Données offline en attente */}
          {offlineStats.pendingSyncItems > 0 && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {offlineStats.pendingSyncItems}
            </div>
          )}
        </div>

        {/* Détails étendus */}
        {showDetails && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {/* Métriques de performance */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>API Latency:</span>
                  <span className={performanceMetrics.apiLatency > 1000 ? 'text-red-600' : 'text-green-600'}>
                    {formatTime(performanceMetrics.apiLatency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Load Time:</span>
                  <span className={performanceMetrics.loadTime > 3000 ? 'text-red-600' : 'text-green-600'}>
                    {formatTime(performanceMetrics.loadTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span className={vitals.lcp > 2500 ? 'text-red-600' : vitals.lcp > 1200 ? 'text-yellow-600' : 'text-green-600'}>
                    {formatTime(vitals.lcp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FID:</span>
                  <span className={vitals.fid > 100 ? 'text-red-600' : 'text-green-600'}>
                    {formatTime(vitals.fid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status réseau */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Réseau</h4>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
                {!isOnline && offlineStats.cachedCourses > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Cours en cache:</span>
                    <span className="text-blue-600">{offlineStats.cachedCourses}</span>
                  </div>
                )}
                {offlineStats.pendingSyncItems > 0 && (
                  <div className="flex items-center justify-between">
                    <span>En attente sync:</span>
                    <span className="text-orange-600">{offlineStats.pendingSyncItems}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex space-x-2 pt-2 border-t">
              <button 
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
              >
                Actualiser
              </button>
              {offlineStats.pendingSyncItems > 0 && (
                <button 
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded"
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Déclencher la sync manuelle
                    await useOfflineData().syncNow();
                  }}
                >
                  Sync
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
