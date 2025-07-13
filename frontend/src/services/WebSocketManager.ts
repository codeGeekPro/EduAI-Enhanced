/**
 * 🔌 WebSocket Manager Sophistiqué avec Reconnexion Automatique
 * Gestion avancée des connexions WebSocket pour EduAI
 */

import { EventEmitter } from 'events';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  timeout?: number;
  enableLogging?: boolean;
}

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export class AdvancedWebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private connectionId: string | null = null;
  private metrics = {
    messagesReceived: 0,
    messagesSent: 0,
    reconnections: 0,
    lastActivity: new Date(),
    connectionDuration: 0,
    connectionStartTime: null as Date | null
  };

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      maxReconnectAttempts: 10,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      timeout: 5000,
      enableLogging: true,
      protocols: [],
      ...config
    };
  }

  /**
   * 🚀 Connecter au WebSocket avec gestion sophistiquée
   */
  async connect(): Promise<void> {
    if (this.state === WebSocketState.CONNECTED || this.state === WebSocketState.CONNECTING) {
      this.log('WebSocket déjà connecté ou en cours de connexion');
      return;
    }

    this.setState(WebSocketState.CONNECTING);
    this.log(`Connexion WebSocket à ${this.config.url}`);

    try {
      await this.createConnection();
    } catch (error) {
      this.log(`Erreur de connexion: ${error}`, 'error');
      this.setState(WebSocketState.ERROR);
      this.handleConnectionError(error);
    }
  }

  /**
   * 🔗 Créer la connexion WebSocket
   */
  private async createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        
        const timeout = setTimeout(() => {
          reject(new Error('Timeout de connexion WebSocket'));
        }, this.config.timeout);

        this.ws.onopen = (event) => {
          clearTimeout(timeout);
          this.handleOpen(event);
          resolve();
        };

        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onclose = (event) => this.handleClose(event);
        this.ws.onerror = (event) => {
          clearTimeout(timeout);
          this.handleError(event);
          reject(new Error('Erreur WebSocket'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🎯 Gérer l'ouverture de connexion
   */
  private handleOpen(event: Event): void {
    this.setState(WebSocketState.CONNECTED);
    this.reconnectAttempts = 0;
    this.connectionId = this.generateConnectionId();
    this.metrics.connectionStartTime = new Date();
    
    this.log('✅ WebSocket connecté');
    this.emit('connected', { connectionId: this.connectionId });
    
    // Démarrer le heartbeat
    this.startHeartbeat();
    
    // Envoyer les messages en attente
    this.flushMessageQueue();
  }

  /**
   * 📨 Gérer les messages entrants
   */
  private handleMessage(event: MessageEvent): void {
    this.metrics.messagesReceived++;
    this.metrics.lastActivity = new Date();

    try {
      const data = JSON.parse(event.data);
      
      // Gérer les messages de heartbeat
      if (data.type === 'pong') {
        this.log('💓 Pong reçu');
        return;
      }

      const message: WebSocketMessage = {
        id: data.id || this.generateMessageId(),
        type: data.type,
        payload: data.payload || data,
        timestamp: new Date(data.timestamp || Date.now()),
        correlationId: data.correlationId
      };

      this.log(`📩 Message reçu: ${message.type}`);
      this.emit('message', message);
      this.emit(`message:${message.type}`, message);

    } catch (error) {
      this.log(`Erreur parsing message: ${error}`, 'error');
      this.emit('messageError', { error, rawData: event.data });
    }
  }

  /**
   * 🔒 Gérer la fermeture de connexion
   */
  private handleClose(event: CloseEvent): void {
    this.setState(WebSocketState.DISCONNECTED);
    this.stopHeartbeat();
    
    if (this.metrics.connectionStartTime) {
      this.metrics.connectionDuration = Date.now() - this.metrics.connectionStartTime.getTime();
    }

    this.log(`❌ WebSocket fermé: ${event.code} - ${event.reason}`);
    this.emit('disconnected', { 
      code: event.code, 
      reason: event.reason,
      wasClean: event.wasClean 
    });

    // Reconnexion automatique si ce n'est pas volontaire
    if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * ⚠️ Gérer les erreurs
   */
  private handleError(event: Event): void {
    this.log('Erreur WebSocket', 'error');
    this.emit('error', event);
  }

  /**
   * 🔄 Planifier une reconnexion
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;
    this.metrics.reconnections++;

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 secondes
    );

    this.log(`🔄 Reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        this.log(`Échec de reconnexion: ${error}`, 'error');
      });
    }, delay);

    this.emit('reconnecting', { 
      attempt: this.reconnectAttempts, 
      delay,
      maxAttempts: this.config.maxReconnectAttempts 
    });
  }

  /**
   * 💓 Gérer le heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendRaw({ type: 'ping', timestamp: Date.now() });
        this.log('💓 Ping envoyé');
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 📤 Envoyer un message
   */
  send(type: string, payload: any, options?: { 
    priority?: 'high' | 'normal' | 'low';
    timeout?: number;
    correlationId?: string;
  }): string {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: new Date(),
      correlationId: options?.correlationId
    };

    if (!this.isConnected()) {
      // Ajouter à la queue si priorité haute ou normale
      if (options?.priority !== 'low') {
        this.messageQueue.push(message);
        this.log(`📤 Message mis en queue: ${type}`);
      }
      return message.id;
    }

    this.sendMessage(message);
    return message.id;
  }

  /**
   * 📨 Envoyer un message directement
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket non connecté');
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.metrics.messagesSent++;
      this.metrics.lastActivity = new Date();
      this.log(`📤 Message envoyé: ${message.type}`);
      this.emit('messageSent', message);
    } catch (error) {
      this.log(`Erreur envoi message: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * 🔄 Vider la queue de messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.sendMessage(message);
        } catch (error) {
          this.log(`Erreur envoi message en queue: ${error}`, 'error');
          break;
        }
      }
    }
  }

  /**
   * 📋 Envoyer données brutes
   */
  private sendRaw(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * ❌ Déconnecter
   */
  disconnect(code?: number, reason?: string): void {
    this.setState(WebSocketState.DISCONNECTING);
    
    // Arrêter les timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    // Fermer la connexion
    if (this.ws) {
      this.ws.close(code || 1000, reason || 'Disconnection requested');
      this.ws = null;
    }

    this.setState(WebSocketState.DISCONNECTED);
    this.log('🔌 Déconnexion WebSocket');
  }

  /**
   * 📊 Obtenir les métriques
   */
  getMetrics() {
    return {
      ...this.metrics,
      state: this.state,
      connectionId: this.connectionId,
      queueLength: this.messageQueue.length,
      isConnected: this.isConnected()
    };
  }

  /**
   * 🔍 Utilitaires
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getState(): WebSocketState {
    return this.state;
  }

  private setState(newState: WebSocketState): void {
    const oldState = this.state;
    this.state = newState;
    if (oldState !== newState) {
      this.emit('stateChange', { oldState, newState });
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleConnectionError(error: any): void {
    this.emit('connectionError', error);
    
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.log('❌ Toutes les tentatives de reconnexion ont échoué', 'error');
      this.emit('reconnectFailed');
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.config.enableLogging) return;
    
    const prefix = `[WebSocket ${this.connectionId || 'N/A'}]`;
    switch (level) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }
}

/**
 * 🎣 Hook React pour WebSocket sophistiqué
 */
export const useAdvancedWebSocket = (config: WebSocketConfig) => {
  const [wsManager] = React.useState(() => new AdvancedWebSocketManager(config));
  const [state, setState] = React.useState<WebSocketState>(WebSocketState.DISCONNECTED);
  const [metrics, setMetrics] = React.useState(wsManager.getMetrics());

  React.useEffect(() => {
    const handleStateChange = ({ newState }: { newState: WebSocketState }) => {
      setState(newState);
      setMetrics(wsManager.getMetrics());
    };

    const handleMessage = () => {
      setMetrics(wsManager.getMetrics());
    };

    wsManager.on('stateChange', handleStateChange);
    wsManager.on('message', handleMessage);
    wsManager.on('messageSent', handleMessage);

    // Auto-connect
    wsManager.connect();

    return () => {
      wsManager.off('stateChange', handleStateChange);
      wsManager.off('message', handleMessage);
      wsManager.off('messageSent', handleMessage);
      wsManager.disconnect();
    };
  }, [wsManager]);

  const send = React.useCallback((type: string, payload: any, options?: any) => {
    return wsManager.send(type, payload, options);
  }, [wsManager]);

  const subscribe = React.useCallback((messageType: string, handler: (message: WebSocketMessage) => void) => {
    wsManager.on(`message:${messageType}`, handler);
    return () => wsManager.off(`message:${messageType}`, handler);
  }, [wsManager]);

  return {
    state,
    metrics,
    send,
    subscribe,
    connect: () => wsManager.connect(),
    disconnect: (code?: number, reason?: string) => wsManager.disconnect(code, reason),
    isConnected: wsManager.isConnected()
  };
};

// Import React pour le hook
import React from 'react';
