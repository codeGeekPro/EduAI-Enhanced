/**
 * 💾 Gestion Offline Intelligente avec IndexedDB
 * Synchronisation avancée et cache intelligent pour EduAI
 */

// Types pour la gestion offline
export interface OfflineData {
  id: string;
  type: 'lesson' | 'progress' | 'chat' | 'ai_response' | 'user_action';
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
  metadata?: {
    userId?: string;
    sessionId?: string;
    priority?: 'high' | 'medium' | 'low';
    expiresAt?: number;
  };
}

export interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

export interface CachePolicy {
  maxAge: number; // Durée de vie en millisecondes
  maxSize: number; // Taille max en MB
  priority: 'high' | 'medium' | 'low';
  syncStrategy: 'immediate' | 'background' | 'manual';
}

/**
 * 🗄️ Gestionnaire IndexedDB Avancé
 */
class AdvancedIndexedDBManager {
  private dbName = 'EduAI_Enhanced_DB';
  private dbVersion = 3;
  private db: IDBDatabase | null = null;
  
  public stores = {
    lessons: 'lessons_store',
    progress: 'progress_store',
    chats: 'chats_store',
    ai_responses: 'ai_responses_store',
    user_actions: 'user_actions_store',
    sync_queue: 'sync_queue_store',
    cache_metadata: 'cache_metadata_store',
    files: 'files_store'
  };

  private cachePolicies: Map<string, CachePolicy> = new Map([
    ['lessons', { maxAge: 24 * 60 * 60 * 1000, maxSize: 50, priority: 'high', syncStrategy: 'immediate' }],
    ['progress', { maxAge: 7 * 24 * 60 * 60 * 1000, maxSize: 10, priority: 'high', syncStrategy: 'background' }],
    ['chats', { maxAge: 30 * 24 * 60 * 60 * 1000, maxSize: 100, priority: 'medium', syncStrategy: 'background' }],
    ['ai_responses', { maxAge: 7 * 24 * 60 * 60 * 1000, maxSize: 200, priority: 'medium', syncStrategy: 'background' }],
    ['user_actions', { maxAge: 24 * 60 * 60 * 1000, maxSize: 20, priority: 'low', syncStrategy: 'manual' }]
  ]);

  /**
   * 🚀 Initialiser la base de données
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.createStores();
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ IndexedDB initialisée');
        resolve();
      };

      request.onerror = (event) => {
        console.error('❌ Erreur IndexedDB:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * 🏗️ Créer les stores
   */
  private createStores(): void {
    if (!this.db) return;

    // Store pour les leçons
    if (!this.db.objectStoreNames.contains(this.stores.lessons)) {
      const lessonStore = this.db.createObjectStore(this.stores.lessons, { keyPath: 'id' });
      lessonStore.createIndex('timestamp', 'timestamp', { unique: false });
      lessonStore.createIndex('synced', 'synced', { unique: false });
      lessonStore.createIndex('userId', 'metadata.userId', { unique: false });
    }

    // Store pour la progression
    if (!this.db.objectStoreNames.contains(this.stores.progress)) {
      const progressStore = this.db.createObjectStore(this.stores.progress, { keyPath: 'id' });
      progressStore.createIndex('timestamp', 'timestamp', { unique: false });
      progressStore.createIndex('userId', 'metadata.userId', { unique: false });
    }

    // Store pour les chats
    if (!this.db.objectStoreNames.contains(this.stores.chats)) {
      const chatStore = this.db.createObjectStore(this.stores.chats, { keyPath: 'id' });
      chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      chatStore.createIndex('sessionId', 'metadata.sessionId', { unique: false });
    }

    // Store pour les réponses IA
    if (!this.db.objectStoreNames.contains(this.stores.ai_responses)) {
      const aiStore = this.db.createObjectStore(this.stores.ai_responses, { keyPath: 'id' });
      aiStore.createIndex('timestamp', 'timestamp', { unique: false });
      aiStore.createIndex('type', 'type', { unique: false });
    }

    // Store pour les actions utilisateur
    if (!this.db.objectStoreNames.contains(this.stores.user_actions)) {
      const actionStore = this.db.createObjectStore(this.stores.user_actions, { keyPath: 'id' });
      actionStore.createIndex('timestamp', 'timestamp', { unique: false });
      actionStore.createIndex('synced', 'synced', { unique: false });
    }

    // Store pour la queue de synchronisation
    if (!this.db.objectStoreNames.contains(this.stores.sync_queue)) {
      const syncStore = this.db.createObjectStore(this.stores.sync_queue, { keyPath: 'id' });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('retries', 'retries', { unique: false });
    }

    // Store pour les métadonnées de cache
    if (!this.db.objectStoreNames.contains(this.stores.cache_metadata)) {
      const metaStore = this.db.createObjectStore(this.stores.cache_metadata, { keyPath: 'storeType' });
    }

    // Store pour les fichiers
    if (!this.db.objectStoreNames.contains(this.stores.files)) {
      const fileStore = this.db.createObjectStore(this.stores.files, { keyPath: 'id' });
      fileStore.createIndex('timestamp', 'timestamp', { unique: false });
      fileStore.createIndex('size', 'size', { unique: false });
    }
  }

  /**
   * 💾 Sauvegarder des données avec politique de cache
   */
  async saveData<T>(storeType: keyof typeof this.stores, data: OfflineData): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const storeName = this.stores[storeType];
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    // Appliquer la politique de cache
    await this.applyCachePolicy(storeType, data);

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      
      request.onsuccess = () => {
        console.log(`💾 Données sauvegardées dans ${storeType}:`, data.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error(`❌ Erreur sauvegarde ${storeType}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📖 Récupérer des données par ID
   */
  async getData<T>(storeType: keyof typeof this.stores, id: string): Promise<OfflineData | null> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const storeName = this.stores[storeType];
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        
        // Vérifier l'expiration
        if (result && this.isExpired(storeType, result)) {
          this.deleteData(storeType, id);
          resolve(null);
        } else {
          resolve(result || null);
        }
      };
      
      request.onerror = () => {
        console.error(`❌ Erreur récupération ${storeType}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📋 Récupérer toutes les données d'un type
   */
  async getAllData<T>(storeType: keyof typeof this.stores, filter?: (data: OfflineData) => boolean): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const storeName = this.stores[storeType];
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        let results = request.result || [];
        
        // Filtrer les données expirées
        results = results.filter(item => !this.isExpired(storeType, item));
        
        // Appliquer le filtre personnalisé
        if (filter) {
          results = results.filter(filter);
        }
        
        resolve(results);
      };
      
      request.onerror = () => {
        console.error(`❌ Erreur récupération toutes données ${storeType}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🗑️ Supprimer des données
   */
  async deleteData(storeType: keyof typeof this.stores, id: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const storeName = this.stores[storeType];
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log(`🗑️ Données supprimées de ${storeType}:`, id);
        resolve();
      };
      
      request.onerror = () => {
        console.error(`❌ Erreur suppression ${storeType}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🔄 Ajouter à la queue de synchronisation
   */
  async addToSyncQueue(item: SyncQueue): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const transaction = this.db.transaction([this.stores.sync_queue], 'readwrite');
    const store = transaction.objectStore(this.stores.sync_queue);

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      
      request.onsuccess = () => {
        console.log('🔄 Ajouté à la queue de sync:', item.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Erreur ajout queue sync:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📤 Récupérer la queue de synchronisation
   */
  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const transaction = this.db.transaction([this.stores.sync_queue], 'readonly');
    const store = transaction.objectStore(this.stores.sync_queue);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        console.error('❌ Erreur récupération queue sync:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🧹 Nettoyer le cache selon les politiques
   */
  async cleanupCache(): Promise<void> {
    console.log('🧹 Début du nettoyage de cache...');

    for (const [storeType, policy] of this.cachePolicies) {
      const storeKey = storeType as keyof typeof this.stores;
      const allData = await this.getAllData(storeKey);
      
      // Trier par timestamp (plus ancien en premier)
      allData.sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculer la taille actuelle
      const currentSize = this.calculateStoreSize(allData);
      
      // Nettoyer si nécessaire
      if (currentSize > policy.maxSize * 1024 * 1024) { // Convertir MB en bytes
        const itemsToDelete = allData.slice(0, Math.floor(allData.length * 0.2)); // Supprimer 20% des plus anciens
        
        for (const item of itemsToDelete) {
          await this.deleteData(storeKey, item.id);
        }
        
        console.log(`🧹 Nettoyé ${itemsToDelete.length} items de ${storeType}`);
      }
    }
  }

  /**
   * 📊 Obtenir les statistiques de cache
   */
  async getCacheStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const storeType of Object.keys(this.stores)) {
      const storeKey = storeType as keyof typeof this.stores;
      const allData = await this.getAllData(storeKey);
      const syncedCount = allData.filter(item => item.synced).length;
      const size = this.calculateStoreSize(allData);

      stats[storeType] = {
        totalItems: allData.length,
        syncedItems: syncedCount,
        unsyncedItems: allData.length - syncedCount,
        sizeBytes: size,
        sizeMB: Math.round(size / (1024 * 1024) * 100) / 100
      };
    }

    return stats;
  }

  /**
   * 🔍 Recherche intelligente dans le cache
   */
  async search(query: string, storeTypes?: (keyof typeof this.stores)[]): Promise<OfflineData[]> {
    const searchStores = storeTypes || Object.keys(this.stores) as (keyof typeof this.stores)[];
    const results: OfflineData[] = [];

    for (const storeType of searchStores) {
      const allData = await this.getAllData(storeType);
      
      const filtered = allData.filter(item => {
        const searchText = JSON.stringify(item.data).toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      results.push(...filtered);
    }

    // Trier par pertinence (timestamp récent)
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 🔒 Utilitaires privés
   */
  private async applyCachePolicy(storeType: keyof typeof this.stores, data: OfflineData): Promise<void> {
    const policy = this.cachePolicies.get(storeType);
    if (!policy) return;

    // Ajouter métadonnées d'expiration
    if (!data.metadata) data.metadata = {};
    data.metadata.expiresAt = Date.now() + policy.maxAge;
  }

  private isExpired(storeType: keyof typeof this.stores, data: OfflineData): boolean {
    const policy = this.cachePolicies.get(storeType);
    if (!policy || !data.metadata?.expiresAt) return false;

    return Date.now() > data.metadata.expiresAt;
  }

  private calculateStoreSize(data: OfflineData[]): number {
    return data.reduce((total, item) => {
      return total + JSON.stringify(item).length * 2; // Approximation UTF-16
    }, 0);
  }
}

/**
 * 🎣 Hook React pour la gestion offline
 */
export const useOfflineManager = () => {
  const [dbManager] = React.useState(() => new AdvancedIndexedDBManager());
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = React.useState<SyncQueue[]>([]);

  // Initialisation
  React.useEffect(() => {
    dbManager.init().then(() => {
      setIsInitialized(true);
      console.log('✅ Gestionnaire offline initialisé');
    }).catch(error => {
      console.error('❌ Erreur initialisation offline:', error);
    });
  }, [dbManager]);

  // Surveillance de la connexion
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Connexion rétablie');
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Mode offline activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger la queue de sync
  React.useEffect(() => {
    if (isInitialized) {
      dbManager.getSyncQueue().then(setSyncQueue);
    }
  }, [isInitialized, dbManager]);

  // Fonctions utilitaires
  const saveOfflineData = React.useCallback(async (
    type: keyof typeof dbManager.stores,
    data: any,
    metadata?: any
  ) => {
    if (!isInitialized) return;

    const offlineData: OfflineData = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1,
      metadata
    };

    await dbManager.saveData(type, offlineData);
    return offlineData.id;
  }, [isInitialized, dbManager]);

  const getOfflineData = React.useCallback(async (
    type: keyof typeof dbManager.stores,
    id?: string
  ) => {
    if (!isInitialized) return null;

    if (id) {
      return await dbManager.getData(type, id);
    } else {
      return await dbManager.getAllData(type);
    }
  }, [isInitialized, dbManager]);

  const syncPendingData = React.useCallback(async () => {
    if (!isOnline || !isInitialized) return;

    const queue = await dbManager.getSyncQueue();
    console.log(`🔄 Synchronisation de ${queue.length} éléments...`);

    // Traitement de la queue (simulation)
    for (const item of queue) {
      try {
        // Ici on ferait l'appel API réel
        console.log(`📤 Sync: ${item.action} ${item.endpoint}`);
        
        // Marquer comme synchronisé (simulation)
        await dbManager.deleteData('sync_queue', item.id);
        
      } catch (error) {
        console.error('❌ Erreur sync:', error);
        
        // Incrémenter les retries
        item.retries++;
        item.lastError = (error as Error).message;
        
        if (item.retries < 3) {
          await dbManager.addToSyncQueue(item);
        }
      }
    }

    // Recharger la queue
    setSyncQueue(await dbManager.getSyncQueue());
  }, [isOnline, isInitialized, dbManager]);

  const cleanupCache = React.useCallback(async () => {
    if (!isInitialized) return;
    await dbManager.cleanupCache();
  }, [isInitialized, dbManager]);

  const getCacheStats = React.useCallback(async () => {
    if (!isInitialized) return {};
    return await dbManager.getCacheStats();
  }, [isInitialized, dbManager]);

  const search = React.useCallback(async (query: string) => {
    if (!isInitialized) return [];
    return await dbManager.search(query);
  }, [isInitialized, dbManager]);

  return {
    isInitialized,
    isOnline,
    syncQueue,
    saveOfflineData,
    getOfflineData,
    syncPendingData,
    cleanupCache,
    getCacheStats,
    search,
    pendingCount: syncQueue.length
  };
};

// Import React pour le hook
import React from 'react';

export default AdvancedIndexedDBManager;
