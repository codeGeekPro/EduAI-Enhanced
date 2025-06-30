/**
 * Client HTTP pour les appels API
 * Gère l'authentification, les tokens, et les erreurs
 */

import API_CONFIG from './config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  isFormData?: boolean;
}

interface APIResponse<T = any> {
  data: T | null;
  status: number;
  message?: string;
  success: boolean;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS };
  }

  /**
   * Récupère le token d'authentification depuis le localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Sauvegarde les tokens d'authentification
   */
  private saveTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Supprime les tokens d'authentification
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Prépare les headers de la requête
   */
  private prepareHeaders(options: RequestOptions): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Ajouter le token d'authentification
    const token = options.token || this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Headers personnalisés
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Pour FormData, supprimer Content-Type
    if (options.isFormData) {
      delete headers['Content-Type'];
    }

    return headers;
  }

  /**
   * Prépare le body de la requête
   */
  private prepareBody(body: any, isFormData: boolean): string | FormData | null {
    if (!body) return null;
    
    if (isFormData) {
      return body instanceof FormData ? body : this.objectToFormData(body);
    }
    
    return typeof body === 'string' ? body : JSON.stringify(body);
  }

  /**
   * Convertit un objet en FormData
   */
  private objectToFormData(obj: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    return formData;
  }

  /**
   * Effectue une requête HTTP
   */
  async request<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const { method = 'GET' } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(options);
    const body = this.prepareBody(options.body, options.isFormData || false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Gestion de la réponse
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Vérifier si le token a expiré
      if (response.status === 401) {
        await this.handleTokenExpiry();
        throw new Error('Token expiré. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      return {
        data,
        status: response.status,
        message: data.message,
        success: true
      };

    } catch (error: any) {
      console.error(`Erreur API [${method} ${url}]:`, error);
      
      return {
        data: null,
        status: 0,
        message: error.message || 'Erreur de connexion',
        success: false
      };
    }
  }

  /**
   * Gère l'expiration du token
   */
  private async handleTokenExpiry(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
          method: 'POST',
          body: { refresh_token: refreshToken }
        });

        if (response.success && response.data.access_token) {
          this.saveTokens(response.data.access_token, response.data.refresh_token);
          return;
        }
      } catch (error) {
        console.error('Erreur lors du refresh du token:', error);
      }
    }

    // Si le refresh échoue, nettoyer les tokens
    this.clearTokens();
    window.location.href = '/login';
  }

  /**
   * Méthodes de convenance pour les requêtes HTTP
   */
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * Upload de fichier
   */
  upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }
}

// Instances des clients API
export const backendAPI = new APIClient(API_CONFIG.BACKEND_URL);
export const aiServicesAPI = new APIClient(API_CONFIG.AI_SERVICES_URL);

export default APIClient;
