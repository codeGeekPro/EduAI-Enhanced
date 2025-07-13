/**
 * 🔐 Service d'Authentification OAuth2/JWT Robuste
 * Gestion complète de l'authentification avec sécurité avancée
 */

import { aiMetrics } from './AIMonitoring';
import { aiCache } from './AICache';

// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    expiresAt?: Date;
    features: string[];
  };
  metadata: {
    lastLogin: Date;
    loginCount: number;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: Date;
  tokenType: 'Bearer';
  scope: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface OAuth2Config {
  clientId: string;
  redirectUri: string;
  scope: string[];
  provider: 'google' | 'microsoft' | 'github' | 'apple';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  sessionTimeout: number;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'token_refresh' | 'permission_denied' | 'suspicious_activity';
  userId?: string;
  timestamp: Date;
  details: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    riskScore?: number;
    action?: string;
    resource?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 🛡️ Gestionnaire d'Authentification Avancé
 */
export class AuthenticationService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    isLoading: false,
    error: null,
    mfaRequired: false,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private refreshTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private securityEvents: SecurityEvent[] = [];

  private readonly API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
  private readonly STORAGE_KEYS = {
    TOKENS: 'eduai_auth_tokens',
    USER: 'eduai_user',
    SECURITY: 'eduai_security_events'
  };

  constructor() {
    this.loadFromStorage();
    this.setupSessionManagement();
    this.setupSecurityMonitoring();
  }

  /**
   * 🔑 Authentification par Email/Mot de passe
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; mfaRequired?: boolean }> {
    const startTime = Date.now();
    
    try {
      this.setState({ isLoading: true, error: null });

      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
          mfaCode: credentials.mfaCode,
          deviceInfo: await this.getDeviceFingerprint()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.mfaRequired) {
          this.setState({ mfaRequired: true });
          return { success: false, mfaRequired: true };
        }
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stocker les tokens et l'utilisateur
      await this.setAuthData(data.tokens, data.user);

      // Enregistrer l'événement de sécurité
      await this.logSecurityEvent({
        type: 'login',
        userId: data.user.id,
        details: {
          ipAddress: (await this.getClientIP()) || 'unknown',
          userAgent: navigator.userAgent,
          riskScore: data.riskScore || 0
        },
        severity: data.riskScore > 0.7 ? 'high' : 'low'
      });

      // Enregistrer la métrique
      aiMetrics.recordMetric({
        service: 'auth',
        operation: 'login',
        duration: Date.now() - startTime,
        success: true,
        metadata: {
          userId: data.user.id,
          mfaUsed: !!credentials.mfaCode
        }
      });

      console.log('✅ Connexion réussie:', data.user.email);
      return { success: true };

    } catch (error) {
      const errorMessage = (error as Error).message;
      this.setState({ error: errorMessage, isLoading: false });

      // Enregistrer l'échec
      await this.logSecurityEvent({
        type: 'login',
        details: {
          ipAddress: (await this.getClientIP()) || 'unknown',
          userAgent: navigator.userAgent,
          action: 'failed_login',
          resource: credentials.email
        },
        severity: 'medium'
      });

      aiMetrics.recordMetric({
        service: 'auth',
        operation: 'login',
        duration: Date.now() - startTime,
        success: false,
        error: errorMessage
      });

      console.error('❌ Erreur de connexion:', error);
      return { success: false };
    }
  }

  /**
   * 🌐 Authentification OAuth2
   */
  async loginWithOAuth2(config: OAuth2Config): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });

      // Générer un state sécurisé pour CSRF protection
      const state = this.generateSecureState();
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Stocker les paramètres pour la validation
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_code_verifier', codeVerifier);

      // Construire l'URL d'autorisation
      const authUrl = this.buildAuthorizationUrl(config, state, codeChallenge);

      // Rediriger vers le provider OAuth2
      window.location.href = authUrl;

    } catch (error) {
      this.setState({ error: (error as Error).message, isLoading: false });
      console.error('❌ Erreur OAuth2:', error);
    }
  }

  /**
   * 🔄 Traitement du callback OAuth2
   */
  async handleOAuth2Callback(code: string, state: string): Promise<boolean> {
    try {
      // Vérifier le state pour CSRF protection
      const savedState = sessionStorage.getItem('oauth_state');
      if (state !== savedState) {
        throw new Error('État OAuth2 invalide');
      }

      const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier manquant');
      }

      // Échanger le code contre des tokens
      const response = await fetch(`${this.API_BASE}/auth/oauth2/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          state,
          codeVerifier,
          deviceInfo: await this.getDeviceFingerprint()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur OAuth2');
      }

      // Nettoyer le sessionStorage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_code_verifier');

      // Stocker les données d'authentification
      await this.setAuthData(data.tokens, data.user);

      console.log('✅ Authentification OAuth2 réussie');
      return true;

    } catch (error) {
      this.setState({ error: (error as Error).message, isLoading: false });
      console.error('❌ Erreur callback OAuth2:', error);
      return false;
    }
  }

  /**
   * 🔄 Actualisation des tokens
   */
  async refreshTokens(): Promise<boolean> {
    try {
      if (!this.state.tokens?.refreshToken) {
        throw new Error('Token de rafraîchissement manquant');
      }

      const response = await fetch(`${this.API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.tokens.refreshToken}`
        },
        body: JSON.stringify({
          refreshToken: this.state.tokens.refreshToken,
          deviceInfo: await this.getDeviceFingerprint()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, déconnexion forcée
          await this.logout();
          return false;
        }
        throw new Error(data.message || 'Erreur de rafraîchissement');
      }

      // Mettre à jour les tokens
      await this.setAuthData(data.tokens, data.user);

      // Enregistrer l'événement
      await this.logSecurityEvent({
        type: 'token_refresh',
        userId: this.state.user?.id,
        details: {
          ipAddress: (await this.getClientIP()) || 'unknown',
          userAgent: navigator.userAgent
        },
        severity: 'low'
      });

      console.log('✅ Tokens actualisés');
      return true;

    } catch (error) {
      console.error('❌ Erreur rafraîchissement tokens:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * 🚪 Déconnexion
   */
  async logout(): Promise<void> {
    try {
      const userId = this.state.user?.id;

      // Appeler l'endpoint de déconnexion si connecté
      if (this.state.tokens?.accessToken) {
        try {
          await fetch(`${this.API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.state.tokens.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              refreshToken: this.state.tokens.refreshToken
            })
          });
        } catch (error) {
          console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
        }
      }

      // Nettoyer les timers
      this.clearTimers();

      // Effacer le stockage local
      this.clearStorage();

      // Réinitialiser l'état
      this.setState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        isLoading: false,
        error: null,
        mfaRequired: false,
        sessionTimeout: 30 * 60 * 1000
      });

      // Enregistrer l'événement de déconnexion
      if (userId) {
        await this.logSecurityEvent({
          type: 'logout',
          userId,
          details: {
            ipAddress: (await this.getClientIP()) || 'unknown',
            userAgent: navigator.userAgent
          },
          severity: 'low'
        });
      }

      console.log('✅ Déconnexion réussie');

    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  }

  /**
   * 🔍 Vérification des permissions
   */
  hasPermission(permission: string): boolean {
    if (!this.state.user) return false;
    
    return this.state.user.permissions.includes(permission) ||
           this.state.user.roles.some(role => 
             this.getRolePermissions(role).includes(permission)
           );
  }

  hasRole(role: string): boolean {
    return this.state.user?.roles.includes(role) || false;
  }

  async canAccessResource(resource: string, action: string = 'read'): Promise<boolean> {
    const permission = `${resource}:${action}`;
    const hasAccess = this.hasPermission(permission);

    if (!hasAccess) {
      // Enregistrer la tentative d'accès non autorisée
      await this.logSecurityEvent({
        type: 'permission_denied',
        userId: this.state.user?.id,
        details: {
          action,
          resource,
          ipAddress: (await this.getClientIP()) || 'unknown',
          userAgent: navigator.userAgent
        },
        severity: 'medium'
      });
    }

    return hasAccess;
  }

  /**
   * 🛡️ Méthodes utilitaires de sécurité
   */
  private async setAuthData(tokens: AuthTokens, user: User): Promise<void> {
    // Chiffrer les données sensibles avant stockage
    const encryptedTokens = await this.encryptSensitiveData(tokens);
    const encryptedUser = await this.encryptSensitiveData(user);

    localStorage.setItem(this.STORAGE_KEYS.TOKENS, encryptedTokens);
    localStorage.setItem(this.STORAGE_KEYS.USER, encryptedUser);

    this.setState({
      isAuthenticated: true,
      user,
      tokens,
      isLoading: false,
      error: null,
      mfaRequired: false
    });

    // Planifier l'actualisation automatique des tokens
    this.scheduleTokenRefresh();

    // Démarrer la gestion de session
    this.startSessionTimer();

    // Notifier les listeners
    this.notifyListeners();
  }

  private loadFromStorage(): void {
    try {
      const encryptedTokens = localStorage.getItem(this.STORAGE_KEYS.TOKENS);
      const encryptedUser = localStorage.getItem(this.STORAGE_KEYS.USER);

      if (encryptedTokens && encryptedUser) {
        const tokens = this.decryptSensitiveData(encryptedTokens) as AuthTokens;
        const user = this.decryptSensitiveData(encryptedUser) as User;

        // Vérifier si les tokens ne sont pas expirés
        if (new Date(tokens.expiresAt) > new Date()) {
          this.setState({
            isAuthenticated: true,
            user,
            tokens,
            isLoading: false
          });

          this.scheduleTokenRefresh();
          this.startSessionTimer();
        } else {
          this.clearStorage();
        }
      }

      // Charger les événements de sécurité
      const securityData = localStorage.getItem(this.STORAGE_KEYS.SECURITY);
      if (securityData) {
        this.securityEvents = JSON.parse(securityData);
      }

    } catch (error) {
      console.error('❌ Erreur chargement données auth:', error);
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKENS);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
  }

  private scheduleTokenRefresh(): void {
    if (!this.state.tokens) return;

    this.clearTimers();

    const expiresAt = new Date(this.state.tokens.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    // Actualiser 5 minutes avant l'expiration
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

    this.refreshTimer = setTimeout(() => {
      this.refreshTokens();
    }, refreshTime);
  }

  private startSessionTimer(): void {
    this.sessionTimer = setTimeout(() => {
      this.logout();
    }, this.state.sessionTimeout);
  }

  private clearTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private setupSessionManagement(): void {
    // Détecter l'inactivité de l'utilisateur
    let lastActivity = Date.now();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Vérifier l'inactivité toutes les minutes
    setInterval(() => {
      if (this.state.isAuthenticated) {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime > this.state.sessionTimeout) {
          console.warn('⚠️ Session expirée par inactivité');
          this.logout();
        }
      }
    }, 60 * 1000);
  }

  private setupSecurityMonitoring(): void {
    // Détecter les tentatives de manipulation du localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key: string, value: string) => {
      if (key.startsWith('eduai_auth')) {
        this.getClientIP().then(ip => {
          this.logSecurityEvent({
            type: 'suspicious_activity',
            details: {
              action: 'localStorage_manipulation',
              resource: key,
              ipAddress: ip || 'unknown',
              userAgent: navigator.userAgent
            },
            severity: 'high'
          });
        });
      }
      return originalSetItem.call(localStorage, key, value);
    };

    // Surveiller les changements de fenêtre (onglets)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.isAuthenticated) {
        // L'utilisateur a changé d'onglet, prolonger légèrement la session
        this.startSessionTimer();
      }
    });
  }

  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.securityEvents.push(fullEvent);

    // Garder seulement les 1000 derniers événements
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Sauvegarder
    try {
      localStorage.setItem(this.STORAGE_KEYS.SECURITY, JSON.stringify(this.securityEvents));
    } catch (error) {
      console.error('❌ Erreur sauvegarde événement sécurité:', error);
    }

    // Envoyer au serveur si critique
    if (event.severity === 'critical' || event.severity === 'high') {
      try {
        await fetch(`${this.API_BASE}/security/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.state.tokens?.accessToken && {
              'Authorization': `Bearer ${this.state.tokens.accessToken}`
            })
          },
          body: JSON.stringify(fullEvent)
        });
      } catch (error) {
        console.error('❌ Erreur envoi événement sécurité:', error);
      }
    }

    console.log(`🛡️ Événement sécurité: ${event.type} (${event.severity})`);
  }

  // Méthodes utilitaires
  private generateSecureState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private buildAuthorizationUrl(config: OAuth2Config, state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      github: 'https://github.com/login/oauth/authorize',
      apple: 'https://appleid.apple.com/auth/authorize'
    };

    return `${baseUrls[config.provider]}?${params.toString()}`;
  }

  private async getDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private getRolePermissions(role: string): string[] {
    const rolePermissions = {
      admin: ['*'],
      teacher: ['lessons:read', 'lessons:write', 'students:read', 'analytics:read'],
      student: ['lessons:read', 'progress:read', 'progress:write'],
      guest: ['lessons:read']
    };
    return rolePermissions[role as keyof typeof rolePermissions] || [];
  }

  private async encryptSensitiveData(data: any): Promise<string> {
    // Simulation de chiffrement (utiliser une vraie librairie en production)
    return btoa(JSON.stringify(data));
  }

  private decryptSensitiveData(encryptedData: string): any {
    // Simulation de déchiffrement
    return JSON.parse(atob(encryptedData));
  }

  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * 📡 API publique
   */
  getState(): AuthState {
    return { ...this.state };
  }

  getUser(): User | null {
    return this.state.user;
  }

  getTokens(): AuthTokens | null {
    return this.state.tokens;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.tokens?.accessToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          deviceInfo: await this.getDeviceFingerprint()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur changement mot de passe');
      }

      await this.logSecurityEvent({
        type: 'login',
        userId: this.state.user?.id,
        details: {
          action: 'password_changed',
          ipAddress: (await this.getClientIP()) || 'unknown',
          userAgent: navigator.userAgent
        },
        severity: 'medium'
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur changement mot de passe:', error);
      return false;
    }
  }

  async enableMFA(): Promise<{ secret: string; qrCode: string }> {
    const response = await fetch(`${this.API_BASE}/auth/mfa/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.state.tokens?.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur activation MFA');
    }

    return response.json();
  }

  async verifyMFA(code: string): Promise<boolean> {
    const response = await fetch(`${this.API_BASE}/auth/mfa/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.state.tokens?.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    return response.ok;
  }
}

// Instance globale
export const authService = new AuthenticationService();
