/**
 * 🎣 Hooks Personnalisés Robustes pour API et État
 * Gestion avancée des requêtes API avec cache, retry et optimistic updates
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient, useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';

// Types génériques
export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

export interface QueryOptions<T> {
  enabled?: boolean;
  retry?: number | boolean;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
  select?: (data: any) => T;
}

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: APIError, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => void;
  optimisticUpdate?: boolean;
  invalidateQueries?: string[];
}

// Configuration API globale
export const API_CONFIG = {
  baseURL: 'http://localhost:8001/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

/**
 * 🌐 Client API avancé avec intercepteurs
 */
class AdvancedAPIClient {
  private baseURL: string;
  private timeout: number;
  private interceptors: {
    request: Array<(config: RequestInit) => RequestInit>;
    response: Array<(response: Response) => Response>;
    error: Array<(error: Error) => Error>;
  };

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.interceptors = { request: [], response: [], error: [] };
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors() {
    // Intercepteur de requête pour l'authentification
    this.addRequestInterceptor((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      return config;
    });

    // Intercepteur de réponse pour la gestion des erreurs
    this.addResponseInterceptor((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    });
  }

  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response) {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: Error) => Error) {
    this.interceptors.error.push(interceptor);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Appliquer les intercepteurs de requête
    for (const interceptor of this.interceptors.request) {
      config = interceptor(config);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Appliquer les intercepteurs de réponse
      for (const interceptor of this.interceptors.response) {
        response = interceptor(response);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Appliquer les intercepteurs d'erreur
      let processedError = error as Error;
      for (const interceptor of this.interceptors.error) {
        processedError = interceptor(processedError);
      }
      
      throw processedError;
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instance globale du client API
export const apiClient = new AdvancedAPIClient(API_CONFIG);

/**
 * 🎣 Hook pour requêtes GET avec cache intelligent
 */
export function useAPIQuery<T>(
  key: string | string[],
  endpoint: string,
  params?: Record<string, any>,
  options?: QueryOptions<T>
) {
  const queryKey = Array.isArray(key) ? key : [key];
  if (params) queryKey.push(JSON.stringify(params));

  return useQuery({
    queryKey,
    queryFn: () => apiClient.get<APIResponse<T>>(endpoint, params),
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 3,
    retryDelay: options?.retryDelay ?? 1000,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    select: options?.select ? (data: APIResponse<T>) => options.select!(data.data) : (data: APIResponse<T>) => data.data,
    ...(options?.onSuccess && { onSuccess: options.onSuccess }),
    ...(options?.onError && { onError: options.onError }),
  });
}

/**
 * 🔄 Hook pour requêtes infinies (pagination)
 */
export function useInfiniteAPIQuery<T>(
  key: string | string[],
  endpoint: string,
  options?: QueryOptions<T> & {
    pageParam?: string;
    getNextPageParam?: (lastPage: APIResponse<T[]>) => string | undefined;
  }
) {
  const queryKey = Array.isArray(key) ? key : [key];

  const queryResult = useInfiniteQuery<APIResponse<T[]>, Error>({
    queryKey,
    queryFn: ({ pageParam = '1' }) => 
      apiClient.get<APIResponse<T[]>>(endpoint, { page: pageParam }),
    initialPageParam: '1',
    getNextPageParam: options?.getNextPageParam ||
      ((lastPage: APIResponse<T[]>) => lastPage.meta?.hasMore ? String(Number(lastPage.meta.page || 1) + 1) : undefined),
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 3,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });

  // Success callback
  useEffect(() => {
    if (queryResult.isSuccess && options?.onSuccess) {
      options.onSuccess(queryResult.data as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryResult.isSuccess, queryResult.data]);

  // Error callback
  useEffect(() => {
    if (queryResult.isError && options?.onError) {
      options.onError(queryResult.error as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryResult.isError, queryResult.error]);

  return queryResult;
}

/**
 * ✏️ Hook pour mutations avec optimistic updates
 */
export function useAPIMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<APIResponse<TData>>,
  options?: MutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (options?.optimisticUpdate && options?.onMutate) {
        await options.onMutate(variables);
      }
    },
    onSuccess: (data, variables) => {
      // Invalider les queries spécifiées
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      options?.onSuccess?.(data.data, variables);
    },
    onError: (error, variables) => {
      // Revenir en arrière en cas d'erreur avec optimistic update
      if (options?.optimisticUpdate && options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      options?.onError?.(error as APIError, variables);
    },
  });
}

/**
 * 📱 Hook pour l'état local avancé avec persistance
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    syncAcrossTabs?: boolean;
  }
) {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;

  // Initialiser depuis localStorage
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Synchroniser avec localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      
      try {
        localStorage.setItem(key, serialize(newValue));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
      return newValue;
    });
  }, [key, serialize]);

  // Synchroniser entre onglets
  useEffect(() => {
    if (!options?.syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(deserialize(e.newValue));
        } catch {
          // Ignore errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, options?.syncAcrossTabs]);

  return [state, setValue] as const;
}

/**
 * 🔄 Hook pour retry intelligent avec backoff exponentiel
 */
export function useRetryOperation<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
    maxDelay?: number;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const config = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 10000,
    ...options,
  };

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    const attemptOperation = async (attempt: number): Promise<T> => {
      try {
        const result = await operation();
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        
        if (attempt >= config.maxRetries) {
          setError(error);
          throw error;
        }

        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        );

        setRetryCount(attempt + 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptOperation(attempt + 1);
      }
    };

    try {
      return await attemptOperation(0);
    } finally {
      setIsLoading(false);
    }
  }, [operation, config]);

  return {
    execute,
    isLoading,
    error,
    data,
    retryCount,
  };
}

/**
 * 📊 Hook pour cache local intelligent
 */
export function useSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number; // Time to live en millisecondes
    maxSize?: number; // Taille max du cache
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const config = {
    ttl: 5 * 60 * 1000, // 5 minutes par défaut
    maxSize: 100,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    ...options,
  };

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > config.ttl;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [key, config.ttl]);

  const setCachedData = useCallback((newData: T) => {
    // Vérifier la taille du cache
    if (cacheRef.current.size >= config.maxSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }

    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now(),
    });

    setData(newData);
  }, [key, config.maxSize]);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetcher();
      setCachedData(newData);
      return newData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, getCachedData, setCachedData]);

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    fetchData,
  };
}
