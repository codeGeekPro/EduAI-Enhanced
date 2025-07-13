import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string;
  lastSyncTime?: Date;
  pendingActions?: number;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    syncStatus: 'synced',
    pendingActions: 0
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        syncStatus: 'syncing'
      }));

      // Simuler la synchronisation
      setTimeout(() => {
        setNetworkStatus(prev => ({
          ...prev,
          syncStatus: 'synced',
          lastSyncTime: new Date(),
          pendingActions: 0
        }));
        setLastUpdateTime(new Date());
      }, 2000);
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        syncStatus: 'pending'
      }));
    };

    // Écouter les changements de connectivité
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simuler des actions en attente quand hors ligne
    const pendingActionsInterval = setInterval(() => {
      if (!networkStatus.isOnline) {
        setNetworkStatus(prev => ({
          ...prev,
          pendingActions: (prev.pendingActions || 0) + 1
        }));
      }
    }, 10000); // Nouvelle action en attente toutes les 10 secondes

    // Vérifier la connexion réseau périodiquement
    const connectionCheckInterval = setInterval(() => {
      if (navigator.onLine !== networkStatus.isOnline) {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: navigator.onLine
        }));
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pendingActionsInterval);
      clearInterval(connectionCheckInterval);
    };
  }, [networkStatus.isOnline]);

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }

    switch (networkStatus.syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return 'Hors ligne';
    }

    switch (networkStatus.syncStatus) {
      case 'syncing':
        return 'Synchronisation...';
      case 'synced':
        return 'En ligne';
      case 'pending':
        return `${networkStatus.pendingActions} en attente`;
      case 'error':
        return 'Erreur de sync';
      default:
        return 'En ligne';
    }
  };

  const getStatusColor = () => {
    if (!networkStatus.isOnline) {
      return 'bg-red-100 border-red-300 text-red-700';
    }

    switch (networkStatus.syncStatus) {
      case 'syncing':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'synced':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'error':
        return 'bg-orange-100 border-orange-300 text-orange-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const formatLastSync = () => {
    if (!networkStatus.lastSyncTime) return 'Jamais';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - networkStatus.lastSyncTime.getTime()) / 1000);
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return networkStatus.lastSyncTime.toLocaleDateString('fr-FR');
  };

  const forceSync = () => {
    if (networkStatus.isOnline) {
      setNetworkStatus(prev => ({
        ...prev,
        syncStatus: 'syncing'
      }));

      setTimeout(() => {
        setNetworkStatus(prev => ({
          ...prev,
          syncStatus: 'synced',
          lastSyncTime: new Date(),
          pendingActions: 0
        }));
        setLastUpdateTime(new Date());
      }, 1500);
    }
  };

  if (showDetails) {
    return (
      <div className={`${className}`}>
        <div className={`border-2 rounded-lg p-4 transition-all duration-300 ${getStatusColor()}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">{getStatusText()}</span>
            </div>
            {networkStatus.isOnline && networkStatus.syncStatus !== 'syncing' && (
              <button
                onClick={forceSync}
                className="text-xs px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                Synchroniser
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Type de connexion:</span>
              <span className="font-medium">
                {networkStatus.isOnline ? 'WiFi/Ethernet' : 'Aucune'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dernière sync:</span>
              <span className="font-medium">{formatLastSync()}</span>
            </div>
            {networkStatus.pendingActions! > 0 && (
              <div className="flex justify-between">
                <span>Actions en attente:</span>
                <span className="font-medium">{networkStatus.pendingActions}</span>
              </div>
            )}
          </div>

          {!networkStatus.isOnline && (
            <div className="mt-3 p-2 bg-white bg-opacity-30 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3" />
                <span className="font-medium">Mode hors ligne activé</span>
              </div>
              <p>Vos données seront synchronisées dès la reconnexion.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm transition-all duration-300 cursor-pointer ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
        {networkStatus.pendingActions! > 0 && (
          <span className="bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">
            {networkStatus.pendingActions}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="flex flex-col gap-1">
              <div>Status: {getStatusText()}</div>
              <div>Dernière sync: {formatLastSync()}</div>
              {!networkStatus.isOnline && (
                <div className="text-yellow-300">Mode hors ligne</div>
              )}
            </div>
            {/* Flèche du tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Dot indicator pour un affichage minimal */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
        networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
      } ${networkStatus.syncStatus === 'syncing' ? 'animate-pulse' : ''}`}></div>
    </div>
  );
};

export default OfflineIndicator;
