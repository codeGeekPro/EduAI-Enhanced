/**
 * 💬 Service WebSocket pour chat temps réel
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  userId?: string;
  metadata?: {
    typing?: boolean;
    error?: boolean;
    attachment?: {
      type: 'image' | 'file';
      url: string;
      name: string;
    };
  };
}

export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers = new Set<(message: ChatMessage) => void>();
  private typingHandlers = new Set<(typing: TypingIndicator[]) => void>();
  private connectionHandlers = new Set<(connected: boolean) => void>();

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://localhost:8001/ws/chat?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.startPing();
      this.notifyConnectionHandlers(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
      this.stopPing();
      this.notifyConnectionHandlers(false);
      this.attemptReconnect(token);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        const message: ChatMessage = {
          id: data.id,
          type: data.messageType,
          content: data.content,
          timestamp: new Date(data.timestamp),
          userId: data.userId,
          metadata: data.metadata
        };
        this.notifyMessageHandlers(message);
        break;

      case 'typing':
        this.notifyTypingHandlers(data.users);
        break;

      case 'error':
        console.error('Server error:', data.message);
        break;
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping toutes les 30 secondes
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendMessage(content: string, metadata?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content,
        metadata
      }));
    }
  }

  sendTyping(isTyping: boolean) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        isTyping
      }));
    }
  }

  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onTyping(handler: (typing: TypingIndicator[]) => void) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyTypingHandlers(typing: TypingIndicator[]) {
    this.typingHandlers.forEach(handler => handler(typing));
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

const wsManager = new WebSocketManager();

export const useWebSocket = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const addToast = useUIStore(state => state.addToast);
  
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<TypingIndicator[]>([]);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Connexion WebSocket
    wsManager.connect(token);

    // Gestionnaires d'événements
    const unsubscribeMessage = wsManager.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    const unsubscribeTyping = wsManager.onTyping((typingUsers) => {
      setTyping(typingUsers);
    });

    const unsubscribeConnection = wsManager.onConnection((isConnected) => {
      setConnected(isConnected);
      
      if (isConnected) {
        addToast({
          type: 'success',
          title: 'Chat connecté',
          message: 'Vous êtes maintenant connecté au chat temps réel'
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Chat déconnecté',
          message: 'Tentative de reconnexion...'
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeConnection();
    };
  }, [isAuthenticated, user, addToast]);

  const sendMessage = useCallback((content: string, metadata?: any) => {
    if (!connected) {
      addToast({
        type: 'error',
        title: 'Chat déconnecté',
        message: 'Impossible d\'envoyer le message'
      });
      return;
    }

    wsManager.sendMessage(content, metadata);
  }, [connected, addToast]);

  const startTyping = useCallback(() => {
    wsManager.sendTyping(true);
    
    // Arrêter automatiquement après 3 secondes
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      wsManager.sendTyping(false);
    }, 3000);
  }, []);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    wsManager.sendTyping(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    connected,
    messages,
    typing,
    sendMessage,
    startTyping,
    stopTyping,
    clearMessages
  };
};
