/**
 * 🔄 Gestionnaire de mode offline pour EduAI Enhanced
 * Gestion intelligente des données hors ligne avec IndexedDB
 */

export interface OfflineData {
  id: string;
  type: 'course_progress' | 'user_action' | 'ai_interaction';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface OfflineQueue {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private dbName = 'eduai-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les données offline
        if (!db.objectStoreNames.contains('offline_data')) {
          const offlineStore = db.createObjectStore('offline_data', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour la queue de synchronisation
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store pour le cache des cours
        if (!db.objectStoreNames.contains('courses_cache')) {
          const coursesStore = db.createObjectStore('courses_cache', { keyPath: 'id' });
          coursesStore.createIndex('category', 'category', { unique: false });
          coursesStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
      };
    });
  }

  // 💾 Sauvegarder des données hors ligne
  async saveOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init();

    const offlineData: OfflineData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
      ...data
    };

    const transaction = this.db!.transaction(['offline_data'], 'readwrite');
    const store = transaction.objectStore('offline_data');
    await store.add(offlineData);
  }

  // 📚 Mettre en cache les cours
  async cacheCourses(courses: any[]): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['courses_cache'], 'readwrite');
    const store = transaction.objectStore('courses_cache');

    for (const course of courses) {
      await store.put({
        ...course,
        cached_at: Date.now()
      });
    }
  }

  // 📖 Récupérer les cours en cache
  async getCachedCourses(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['courses_cache'], 'readonly');
      const store = transaction.objectStore('courses_cache');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 🔄 Ajouter à la queue de synchronisation
  async addToSyncQueue(request: Omit<OfflineQueue, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    if (!this.db) await this.init();

    const queueItem: OfflineQueue = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      ...request
    };

    const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    await store.add(queueItem);
  }

  // 📤 Synchroniser les données en attente
  async syncPendingData(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const request = store.getAll();

    request.onsuccess = async () => {
      const pendingItems: OfflineQueue[] = request.result;

      for (const item of pendingItems) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });

          if (response.ok) {
            // Supprimer de la queue si succès
            await store.delete(item.id);
          } else {
            // Incrémenter les tentatives
            if (item.retries < 3) {
              await store.put({ ...item, retries: item.retries + 1 });
            } else {
              // Supprimer après 3 tentatives
              await store.delete(item.id);
            }
          }
        } catch (error) {
          console.error('Sync failed for:', item.url, error);
          
          if (item.retries < 3) {
            await store.put({ ...item, retries: item.retries + 1 });
          } else {
            await store.delete(item.id);
          }
        }
      }
    };
  }

  // 📊 Sauvegarder la progression d'un cours hors ligne
  async saveOfflineCourseProgress(courseId: string, lessonId: string, progress: number): Promise<void> {
    await this.saveOfflineData({
      type: 'course_progress',
      data: {
        course_id: courseId,
        lesson_id: lessonId,
        progress,
        completed_at: new Date().toISOString()
      }
    });

    // Ajouter à la queue de sync
    await this.addToSyncQueue({
      url: `/api/courses/${courseId}/progress`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify({
        lesson_id: lessonId,
        progress
      })
    });
  }

  // 🤖 Sauvegarder une interaction IA hors ligne
  async saveOfflineAIInteraction(type: string, data: any): Promise<void> {
    await this.saveOfflineData({
      type: 'ai_interaction',
      data: {
        interaction_type: type,
        payload: data,
        timestamp: new Date().toISOString()
      }
    });
  }

  // 🔍 Récupérer les données hors ligne par type
  async getOfflineDataByType(type: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readonly');
      const store = transaction.objectStore('offline_data');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 🧹 Nettoyer les anciennes données
  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - maxAge;
    const transaction = this.db!.transaction(['offline_data', 'courses_cache'], 'readwrite');

    // Nettoyer les données offline anciennes
    const offlineStore = transaction.objectStore('offline_data');
    offlineStore.openCursor().onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.timestamp < cutoffTime && cursor.value.synced) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Nettoyer le cache des cours ancien
    const coursesStore = transaction.objectStore('courses_cache');
    coursesStore.openCursor().onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.cached_at < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // 📈 Obtenir les statistiques hors ligne
  async getOfflineStats(): Promise<{
    totalOfflineData: number;
    pendingSyncItems: number;
    cachedCourses: number;
    lastSync: number | null;
  }> {
    if (!this.db) await this.init();

    const [offlineData, syncQueue, cachedCourses] = await Promise.all([
      this.getOfflineDataByType('course_progress'),
      this.getSyncQueue(),
      this.getCachedCourses()
    ]);

    return {
      totalOfflineData: offlineData.length,
      pendingSyncItems: syncQueue.length,
      cachedCourses: cachedCourses.length,
      lastSync: localStorage.getItem('last_sync') ? parseInt(localStorage.getItem('last_sync')!) : null
    };
  }

  private async getSyncQueue(): Promise<OfflineQueue[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineManager = new OfflineManager();
