/**
 * 🔄 Système de Queue Intelligent pour Tâches IA
 * Gestion des tâches lourdes avec priorités et retry automatique
 */

import { aiMetrics } from './AIMonitoring';
import { loadBalancingService } from './LoadBalancingService';

// Types pour le système de queue
export interface QueueTask {
  id: string;
  type: 'chat' | 'image_generation' | 'transcription' | 'embeddings' | 'analysis' | 'custom';
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  userId: string;
  sessionId?: string;
  maxRetries: number;
  currentRetries: number;
  timeout: number; // en millisecondes
  delay?: number; // délai avant exécution
  dependencies?: string[]; // IDs des tâches dépendantes
  metadata: {
    estimatedDuration: number;
    estimatedCost: number;
    requiredModel: string;
    computeIntensive: boolean;
    retryable: boolean;
    tags: string[];
  };
  timestamps: {
    created: Date;
    scheduled?: Date;
    started?: Date;
    completed?: Date;
    failed?: Date;
  };
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  result?: any;
  error?: string;
  progress?: {
    current: number;
    total: number;
    message: string;
  };
}

export interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultTimeout: number;
  retryDelayBase: number; // délai de base pour retry exponentiel
  retryDelayMax: number;
  priorityWeights: {
    critical: number;
    high: number;
    normal: number;
    low: number;
  };
  autoStart: boolean;
  persistTasks: boolean;
  deadLetterQueue: boolean;
}

export interface QueueStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cancelledTasks: number;
  runningTasks: number;
  pendingTasks: number;
  averageExecutionTime: number;
  averageWaitTime: number;
  successRate: number;
  throughputPerHour: number;
  priorityDistribution: Record<string, number>;
  taskTypeDistribution: Record<string, number>;
}

export interface Worker {
  id: string;
  name: string;
  taskTypes: string[];
  maxConcurrent: number;
  currentTasks: number;
  status: 'active' | 'paused' | 'stopped';
  handler: (task: QueueTask) => Promise<any>;
  lastActivity: Date;
  stats: {
    tasksProcessed: number;
    tasksSucceeded: number;
    tasksFailed: number;
    averageProcessingTime: number;
  };
}

/**
 * 🎯 Gestionnaire de Queue IA
 */
export class AIQueueService {
  private tasks: Map<string, QueueTask> = new Map();
  private workers: Map<string, Worker> = new Map();
  private runningTasks: Set<string> = new Set();
  private deadLetterQueue: QueueTask[] = [];
  private config: QueueConfig;
  private stats: QueueStats;
  private processingInterval?: NodeJS.Timeout;
  private isProcessing = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      maxConcurrent: 5,
      maxQueueSize: 1000,
      defaultTimeout: 5 * 60 * 1000, // 5 minutes
      retryDelayBase: 1000,
      retryDelayMax: 60000,
      priorityWeights: {
        critical: 100,
        high: 50,
        normal: 10,
        low: 1
      },
      autoStart: true,
      persistTasks: true,
      deadLetterQueue: true,
      ...config
    };

    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      cancelledTasks: 0,
      runningTasks: 0,
      pendingTasks: 0,
      averageExecutionTime: 0,
      averageWaitTime: 0,
      successRate: 0,
      throughputPerHour: 0,
      priorityDistribution: {},
      taskTypeDistribution: {}
    };

    this.initialize();
  }

  /**
   * 🚀 Initialisation du service
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadFromStorage();
      this.setupDefaultWorkers();
      
      if (this.config.autoStart) {
        this.start();
      }
      
      console.log('🔄 Service Queue IA initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation queue:', error);
    }
  }

  /**
   * 🔧 Configuration des workers par défaut
   */
  private setupDefaultWorkers(): void {
    const defaultWorkers: Omit<Worker, 'handler'>[] = [
      {
        id: 'chat_worker',
        name: 'Worker Chat IA',
        taskTypes: ['chat'],
        maxConcurrent: 3,
        currentTasks: 0,
        status: 'active',
        lastActivity: new Date(),
        stats: {
          tasksProcessed: 0,
          tasksSucceeded: 0,
          tasksFailed: 0,
          averageProcessingTime: 0
        }
      },
      {
        id: 'image_worker',
        name: 'Worker Génération Images',
        taskTypes: ['image_generation'],
        maxConcurrent: 1,
        currentTasks: 0,
        status: 'active',
        lastActivity: new Date(),
        stats: {
          tasksProcessed: 0,
          tasksSucceeded: 0,
          tasksFailed: 0,
          averageProcessingTime: 0
        }
      },
      {
        id: 'analysis_worker',
        name: 'Worker Analyse IA',
        taskTypes: ['analysis', 'embeddings', 'transcription'],
        maxConcurrent: 2,
        currentTasks: 0,
        status: 'active',
        lastActivity: new Date(),
        stats: {
          tasksProcessed: 0,
          tasksSucceeded: 0,
          tasksFailed: 0,
          averageProcessingTime: 0
        }
      }
    ];

    for (const workerDef of defaultWorkers) {
      const worker: Worker = {
        ...workerDef,
        handler: this.createDefaultHandler(workerDef.id)
      };
      this.workers.set(worker.id, worker);
    }
  }

  /**
   * 🎯 Créer un handler par défaut
   */
  private createDefaultHandler(workerId: string): (task: QueueTask) => Promise<any> {
    return async (task: QueueTask) => {
      console.log(`🔄 ${workerId} traite la tâche ${task.id}`);
      
      try {
        // Utiliser le load balancer pour sélectionner une instance
        const instanceResult = await loadBalancingService.selectInstance({
          model: task.metadata.requiredModel,
          priority: task.priority,
          expectedTokens: 1000,
          retryable: task.metadata.retryable,
          userId: task.userId,
          sessionId: task.sessionId
        });

        // Simuler le traitement selon le type de tâche
        const processingTime = this.simulateProcessing(task.type);
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Enregistrer la performance de l'instance
        loadBalancingService.recordPerformance(
          instanceResult.instance.id,
          processingTime,
          true,
          instanceResult.estimatedCost
        );

        // Retourner un résultat simulé
        return this.generateMockResult(task.type);

      } catch (error) {
        console.error(`❌ Erreur traitement tâche ${task.id}:`, error);
        throw error;
      }
    };
  }

  /**
   * 🎭 Simuler le traitement
   */
  private simulateProcessing(taskType: string): number {
    const baseTimes = {
      chat: 1500,
      image_generation: 8000,
      transcription: 5000,
      embeddings: 800,
      analysis: 3000,
      custom: 2000
    };
    
    const baseTime = baseTimes[taskType as keyof typeof baseTimes] || 2000;
    return baseTime + Math.random() * 1000; // Ajouter de la variance
  }

  /**
   * 📄 Générer un résultat fictif
   */
  private generateMockResult(taskType: string): any {
    switch (taskType) {
      case 'chat':
        return {
          response: 'Réponse IA simulée pour le chat',
          tokens_used: 150,
          model: 'gpt-4'
        };
      
      case 'image_generation':
        return {
          image_url: 'https://example.com/generated-image.jpg',
          prompt_used: 'Image générée',
          model: 'dall-e-3'
        };
      
      case 'transcription':
        return {
          text: 'Transcription simulée du fichier audio',
          duration: 120,
          language: 'fr'
        };
      
      case 'embeddings':
        return {
          embeddings: Array(1536).fill(0).map(() => Math.random()),
          model: 'text-embedding-ada-002'
        };
      
      case 'analysis':
        return {
          analysis: 'Analyse complète du contenu',
          sentiment: 'positive',
          confidence: 0.85
        };
      
      default:
        return { result: 'Tâche exécutée avec succès' };
    }
  }

  /**
   * ➕ Ajouter une tâche à la queue
   */
  async addTask(taskDef: Omit<QueueTask, 'id' | 'currentRetries' | 'timestamps' | 'status'>): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: QueueTask = {
      id: taskId,
      currentRetries: 0,
      timestamps: {
        created: new Date()
      },
      status: 'pending',
      ...taskDef
    };

    // Vérifier la limite de queue
    if (this.tasks.size >= this.config.maxQueueSize) {
      throw new Error('Queue pleine - impossible d\'ajouter la tâche');
    }

    // Vérifier les dépendances
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        const depTask = this.tasks.get(depId);
        if (!depTask || depTask.status !== 'completed') {
          throw new Error(`Dépendance non satisfaite: ${depId}`);
        }
      }
    }

    this.tasks.set(taskId, task);
    this.stats.totalTasks++;
    this.stats.pendingTasks++;
    
    // Mettre à jour la distribution
    this.stats.priorityDistribution[task.priority] = 
      (this.stats.priorityDistribution[task.priority] || 0) + 1;
    this.stats.taskTypeDistribution[task.type] = 
      (this.stats.taskTypeDistribution[task.type] || 0) + 1;

    this.emit('taskAdded', task);

    // Persister si activé
    if (this.config.persistTasks) {
      this.saveToStorage();
    }

    console.log(`➕ Tâche ajoutée: ${taskId} (${task.type}, priorité: ${task.priority})`);
    return taskId;
  }

  /**
   * ▶️ Démarrer le traitement
   */
  start(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 1000);
    
    console.log('▶️ Queue IA démarrée');
    this.emit('queueStarted');
  }

  /**
   * ⏸️ Arrêter le traitement
   */
  stop(): void {
    this.isProcessing = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    
    console.log('⏸️ Queue IA arrêtée');
    this.emit('queueStopped');
  }

  /**
   * 🔄 Traiter la queue
   */
  private async processQueue(): Promise<void> {
    if (!this.isProcessing) return;

    try {
      // Mettre à jour les stats en temps réel
      this.updateStats();

      // Obtenir les tâches prêtes à être exécutées
      const readyTasks = this.getReadyTasks();
      
      if (readyTasks.length === 0) return;

      // Obtenir les workers disponibles
      const availableWorkers = this.getAvailableWorkers();
      
      if (availableWorkers.length === 0) return;

      // Assigner les tâches aux workers
      for (const worker of availableWorkers) {
        const assignableTask = this.findAssignableTask(readyTasks, worker);
        if (assignableTask) {
          await this.executeTask(assignableTask, worker);
          
          // Retirer la tâche de la liste des tâches prêtes
          const index = readyTasks.indexOf(assignableTask);
          if (index > -1) readyTasks.splice(index, 1);
        }
      }

    } catch (error) {
      console.error('❌ Erreur traitement queue:', error);
    }
  }

  /**
   * 📋 Obtenir les tâches prêtes
   */
  private getReadyTasks(): QueueTask[] {
    const now = new Date();
    
    return Array.from(this.tasks.values())
      .filter(task => {
        // Statut approprié
        if (task.status !== 'pending' && task.status !== 'scheduled') return false;
        
        // Délai respecté
        if (task.delay && task.timestamps.created.getTime() + task.delay > now.getTime()) return false;
        
        // Dépendances satisfaites
        if (task.dependencies) {
          for (const depId of task.dependencies) {
            const depTask = this.tasks.get(depId);
            if (!depTask || depTask.status !== 'completed') return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Tri par priorité puis par date de création
        const priorityDiff = this.config.priorityWeights[b.priority] - this.config.priorityWeights[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return a.timestamps.created.getTime() - b.timestamps.created.getTime();
      });
  }

  /**
   * 👷 Obtenir les workers disponibles
   */
  private getAvailableWorkers(): Worker[] {
    return Array.from(this.workers.values())
      .filter(worker => 
        worker.status === 'active' && 
        worker.currentTasks < worker.maxConcurrent
      );
  }

  /**
   * 🎯 Trouver une tâche assignable
   */
  private findAssignableTask(tasks: QueueTask[], worker: Worker): QueueTask | undefined {
    return tasks.find(task => 
      worker.taskTypes.includes(task.type) || 
      worker.taskTypes.includes('*')
    );
  }

  /**
   * 🚀 Exécuter une tâche
   */
  private async executeTask(task: QueueTask, worker: Worker): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Marquer comme en cours
      task.status = 'running';
      task.timestamps.started = new Date();
      this.runningTasks.add(task.id);
      worker.currentTasks++;
      worker.lastActivity = new Date();
      
      this.stats.runningTasks++;
      this.stats.pendingTasks--;
      
      this.emit('taskStarted', task);

      // Configurer le timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), task.timeout);
      });

      // Exécuter la tâche
      const resultPromise = worker.handler(task);
      const result = await Promise.race([resultPromise, timeoutPromise]);

      // Succès
      task.status = 'completed';
      task.timestamps.completed = new Date();
      task.result = result;
      
      this.stats.completedTasks++;
      this.stats.runningTasks--;
      
      worker.stats.tasksSucceeded++;
      const duration = Date.now() - startTime;
      worker.stats.averageProcessingTime = 
        (worker.stats.averageProcessingTime * worker.stats.tasksProcessed + duration) / 
        (worker.stats.tasksProcessed + 1);

      console.log(`✅ Tâche ${task.id} complétée en ${duration}ms`);
      this.emit('taskCompleted', task);

    } catch (error) {
      // Échec
      task.error = (error as Error).message;
      task.currentRetries++;
      
      worker.stats.tasksFailed++;
      
      if (task.currentRetries >= task.maxRetries) {
        task.status = 'failed';
        task.timestamps.failed = new Date();
        
        this.stats.failedTasks++;
        this.stats.runningTasks--;
        
        // Ajouter au dead letter queue si activé
        if (this.config.deadLetterQueue) {
          this.deadLetterQueue.push({ ...task });
        }
        
        console.log(`❌ Tâche ${task.id} échouée définitivement`);
        this.emit('taskFailed', task);
      } else {
        // Programmer un retry
        const delay = Math.min(
          this.config.retryDelayBase * Math.pow(2, task.currentRetries - 1),
          this.config.retryDelayMax
        );
        
        task.status = 'scheduled';
        task.delay = delay;
        task.timestamps.created = new Date(); // Reset pour le délai
        
        this.stats.runningTasks--;
        this.stats.pendingTasks++;
        
        console.log(`🔄 Tâche ${task.id} reprogrammée (retry ${task.currentRetries}/${task.maxRetries})`);
        this.emit('taskRetried', task);
      }
    } finally {
      this.runningTasks.delete(task.id);
      worker.currentTasks--;
      worker.stats.tasksProcessed++;
      
      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'queue',
        operation: 'execute_task',
        duration: Date.now() - startTime,
        success: task.status === 'completed',
        metadata: {
          taskId: task.id,
          taskType: task.type,
          priority: task.priority,
          workerId: worker.id,
          retries: task.currentRetries
        }
      });
    }
  }

  /**
   * 📊 Mettre à jour les statistiques
   */
  private updateStats(): void {
    this.stats.runningTasks = this.runningTasks.size;
    this.stats.pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending' || t.status === 'scheduled').length;
    
    this.stats.successRate = this.stats.totalTasks > 0 
      ? this.stats.completedTasks / this.stats.totalTasks 
      : 0;

    // Calculer le throughput
    const completedTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'completed' && t.timestamps.completed);
    
    if (completedTasks.length > 0) {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentTasks = completedTasks.filter(t => 
        t.timestamps.completed!.getTime() > oneHourAgo
      );
      this.stats.throughputPerHour = recentTasks.length;
    }
  }

  /**
   * 📡 Système d'événements
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`❌ Erreur handler événement ${event}:`, error);
      }
    });
  }

  /**
   * 💾 Persistance
   */
  private saveToStorage(): void {
    try {
      const data = {
        tasks: Array.from(this.tasks.entries()),
        stats: this.stats,
        config: this.config,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('eduai_queue', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Erreur sauvegarde queue:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('eduai_queue');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      if (data.tasks) {
        this.tasks = new Map(data.tasks);
        
        // Réinitialiser les tâches en cours comme pending
        for (const [_, task] of this.tasks) {
          if (task.status === 'running') {
            task.status = 'pending';
          }
        }
      }
      
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      
      console.log('💾 Configuration queue chargée');
    } catch (error) {
      console.error('❌ Erreur chargement queue:', error);
    }
  }

  /**
   * 📊 API publique
   */
  getTask(taskId: string): QueueTask | undefined {
    return this.tasks.get(taskId);
  }

  getTasks(filter?: { status?: string; type?: string; userId?: string }): QueueTask[] {
    let tasks = Array.from(this.tasks.values());
    
    if (filter) {
      if (filter.status) tasks = tasks.filter(t => t.status === filter.status);
      if (filter.type) tasks = tasks.filter(t => t.type === filter.type);
      if (filter.userId) tasks = tasks.filter(t => t.userId === filter.userId);
    }
    
    return tasks;
  }

  getStats(): QueueStats {
    this.updateStats();
    return { ...this.stats };
  }

  getWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return false;
    }
    
    task.status = 'cancelled';
    task.timestamps.failed = new Date();
    this.runningTasks.delete(taskId);
    
    this.stats.cancelledTasks++;
    // Mettre à jour les compteurs selon le statut précédent
    this.stats.pendingTasks = Math.max(0, this.stats.pendingTasks - 1);
    
    console.log(`🚫 Tâche ${taskId} annulée`);
    this.emit('taskCancelled', task);
    
    return true;
  }

  retryTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'failed') {
      return false;
    }
    
    task.status = 'pending';
    task.currentRetries = 0;
    task.error = undefined;
    task.timestamps.failed = undefined;
    
    this.stats.failedTasks--;
    this.stats.pendingTasks++;
    
    console.log(`🔄 Tâche ${taskId} relancée manuellement`);
    this.emit('taskRetried', task);
    
    return true;
  }

  addWorker(worker: Worker): void {
    this.workers.set(worker.id, worker);
    console.log(`👷 Worker ajouté: ${worker.name}`);
  }

  removeWorker(workerId: string): boolean {
    const deleted = this.workers.delete(workerId);
    if (deleted) {
      console.log(`🗑️ Worker supprimé: ${workerId}`);
    }
    return deleted;
  }

  pauseWorker(workerId: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) return false;
    
    worker.status = 'paused';
    console.log(`⏸️ Worker mis en pause: ${workerId}`);
    return true;
  }

  resumeWorker(workerId: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) return false;
    
    worker.status = 'active';
    console.log(`▶️ Worker repris: ${workerId}`);
    return true;
  }

  clearCompleted(): number {
    const completed = Array.from(this.tasks.entries())
      .filter(([_, task]) => task.status === 'completed');
    
    for (const [id, _] of completed) {
      this.tasks.delete(id);
    }
    
    console.log(`🧹 ${completed.length} tâches complétées supprimées`);
    return completed.length;
  }

  getDeadLetterQueue(): QueueTask[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue(): number {
    const count = this.deadLetterQueue.length;
    this.deadLetterQueue = [];
    console.log(`🧹 ${count} tâches supprimées du dead letter queue`);
    return count;
  }
}

// Instance globale
export const aiQueueService = new AIQueueService();
