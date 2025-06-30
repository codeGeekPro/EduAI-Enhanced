/**
 * Service d'authentification
 * Gère la connexion, inscription, et gestion des tokens
 */

import { backendAPI } from './api';
import API_CONFIG from './config';

export interface User {
  id: string;
  username: string;
  email: string;
  language: string;
  country?: string;
  learning_preferences?: Record<string, any>;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  language?: string;
  country?: string;
  learning_preferences?: Record<string, any>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await backendAPI.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      // Sauvegarder les tokens
      localStorage.setItem('access_token', response.data.tokens.access_token);
      localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    }

    throw new Error(response.message || 'Erreur de connexion');
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await backendAPI.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );

    if (response.success && response.data) {
      // Sauvegarder les tokens
      localStorage.setItem('access_token', response.data.tokens.access_token);
      localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    }

    throw new Error(response.message || 'Erreur d\'inscription');
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      await backendAPI.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile(): Promise<User> {
    const response = await backendAPI.get<User>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );

    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }

    throw new Error(response.message || 'Erreur lors de la récupération du profil');
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }

    const response = await backendAPI.post<AuthTokens>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken }
    );

    if (response.success && response.data) {
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      return response.data;
    }

    throw new Error(response.message || 'Erreur lors du rafraîchissement du token');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Récupérer l'utilisateur actuel depuis le stockage local
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Récupérer le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
export default authService;
