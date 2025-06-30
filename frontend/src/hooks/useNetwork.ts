/**
 * 🌐 Hook pour gérer le statut réseau et les fonctionnalités offline
 */

import { useState, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { offlineManager } from '../services/offline';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const setOnlineStatus = useUIStore(state => state.setOnlineStatus);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setOnlineStatus(true);
      setIsReconnecting(true);

      try {
        // Synchroniser les données en attente
        await offlineManager.syncPendingData();
        localStorage.setItem('last_sync', Date.now().toString());
      } catch (error) {
        console.error('Sync failed after reconnection:', error);
      } finally {
        setIsReconnecting(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOnlineStatus(false);
      setIsReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérification périodique de la connexion
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok && !isOnline) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    const intervalId = setInterval(checkConnection, 30000); // Vérifier toutes les 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, setOnlineStatus]);

  return {
    isOnline,
    isReconnecting
  };
};

export const useOfflineData = () => {
  const [offlineStats, setOfflineStats] = useState({
    totalOfflineData: 0,
    pendingSyncItems: 0,
    cachedCourses: 0,
    lastSync: null as number | null
  });

  useEffect(() => {
    const loadOfflineStats = async () => {
      try {
        const stats = await offlineManager.getOfflineStats();
        setOfflineStats(stats);
      } catch (error) {
        console.error('Failed to load offline stats:', error);
      }
    };

    loadOfflineStats();
    
    // Mettre à jour toutes les minutes
    const intervalId = setInterval(loadOfflineStats, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const syncNow = async () => {
    try {
      await offlineManager.syncPendingData();
      localStorage.setItem('last_sync', Date.now().toString());
      
      // Recharger les stats
      const stats = await offlineManager.getOfflineStats();
      setOfflineStats(stats);
      
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  };

  const clearOfflineData = async () => {
    try {
      await offlineManager.cleanupOldData(0); // Supprimer tout
      const stats = await offlineManager.getOfflineStats();
      setOfflineStats(stats);
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  };

  return {
    offlineStats,
    syncNow,
    clearOfflineData
  };
};
