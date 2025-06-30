/**
 * 🔄 Hooks React Query pour la gestion des données
 * Optimise les appels API avec cache, invalidation et retry
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendAPI, aiServicesAPI } from '../services/api';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';
import { Course, Lesson } from '../stores/coursesStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

// Query Keys
export const QUERY_KEYS = {
  USER: ['user'],
  COURSES: ['courses'],
  COURSE: (id: string) => ['course', id],
  LESSONS: (courseId: string) => ['lessons', courseId],
  ANALYTICS: ['analytics'],
  AI_SERVICES: ['ai-services']
} as const;

// 🔐 Authentication Hooks

export const useLogin = () => {
  const setUser = useAuthStore(state => state.setUser);
  const addToast = useUIStore(state => state.addToast);
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      addToast({
        type: 'success',
        title: 'Connexion réussie',
        message: `Bienvenue ${data.user.username} !`
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: error.message || 'Vérifiez vos identifiants'
      });
    }
  });
};

export const useRegister = () => {
  const addToast = useUIStore(state => state.addToast);
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Inscription réussie',
        message: 'Vous pouvez maintenant vous connecter'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: error.message || 'Une erreur est survenue'
      });
    }
  });
};

export const useLogout = () => {
  const logout = useAuthStore(state => state.logout);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    }
  });
};

export const useUser = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

// 📚 Courses Hooks

export const useCourses = (filters?: any) => {
  const updatePerformanceMetrics = useUIStore(state => state.updatePerformanceMetrics);
  
  return useQuery({
    queryKey: [...QUERY_KEYS.COURSES, filters],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        // Build query string from filters if present
        let url = '/api/courses';
        if (filters && Object.keys(filters).length > 0) {
          const query = new URLSearchParams(filters).toString();
          url += `?${query}`;
        }
        const response = await backendAPI.get(url);
        
        const endTime = performance.now();
        updatePerformanceMetrics({
          apiLatency: endTime - startTime
        });
        
        return response.data;
      } catch (error) {
        updatePerformanceMetrics({
          errorCount: 1
        });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COURSE(courseId),
    queryFn: () => backendAPI.get(`/api/courses/${courseId}`),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });
};

export const useLessons = (courseId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.LESSONS(courseId),
    queryFn: () => backendAPI.get(`/api/courses/${courseId}/lessons`),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  
  return useMutation({
    mutationFn: (courseId: string) => backendAPI.post(`/api/courses/${courseId}/enroll`),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSE(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
      
      addToast({
        type: 'success',
        title: 'Inscription réussie',
        message: 'Vous êtes maintenant inscrit au cours'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        message: error.message
      });
    }
  });
};

// 🤖 AI Services Hooks

export const useAITutorChat = () => {
  const addToast = useUIStore(state => state.addToast);
  
  return useMutation({
    mutationFn: async (data: { message: string; context?: string }) => {
      const response = await backendAPI.post('/api/ai-tutor/chat', data);
      return response.data;
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Erreur IA',
        message: 'Le tuteur IA n\'est pas disponible actuellement'
      });
    }
  });
};

export const useEmotionDetection = () => {
  return useMutation({
    mutationFn: async (data: { text?: string; image?: File }) => {
      if (data.text) {
        const response = await aiServicesAPI.post('/emotion/detect', { text: data.text });
        return response.data;
      } else if (data.image) {
        const formData = new FormData();
        formData.append('image', data.image);
        const response = await aiServicesAPI.post('/emotion/detect-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
      throw new Error('Données manquantes pour la détection d\'émotion');
    }
  });
};

export const useSpeechToText = () => {
  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await aiServicesAPI.post('/speech/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    }
  });
};

export const useTextToSpeech = () => {
  return useMutation({
    mutationFn: async (data: { text: string; voice?: string; speed?: number }) => {
      const response = await aiServicesAPI.post('/speech/synthesize', data, {
        responseType: 'blob'
      } as any);
      
      return response.data;
    }
  });
};

export const useVisionAnalysis = () => {
  return useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await aiServicesAPI.post('/vision/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    }
  });
};

export const useNLPAnalysis = () => {
  return useMutation({
    mutationFn: async (data: { text: string; task?: string }) => {
      const response = await aiServicesAPI.post('/nlp/analyze', data);
      return response.data;
    }
  });
};

// 📊 Analytics Hooks

export const useAnalytics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS,
    queryFn: () => backendAPI.get('/api/analytics/dashboard'),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000 // Refresh toutes les 30 secondes
  });
};

export const useProgressAnalytics = (courseId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'progress', courseId],
    queryFn: () => backendAPI.get(`/api/analytics/progress${courseId ? `?course_id=${courseId}` : ''}`),
    staleTime: 2 * 60 * 1000
  });
};

// 🔧 Hook API général pour regrouper toutes les fonctionnalités
export const useAPI = () => {
  const login = useLogin();
  const register = useRegister();
  const courses = useCourses();
  const analytics = useAnalytics();
  const aiTutorChat = useAITutorChat();
  const visionAnalysis = useVisionAnalysis();
  const nlpAnalysis = useNLPAnalysis();

  return {
    // Auth
    login: login.mutate,
    register: register.mutate,
    isLoggingIn: login.isPending,
    isRegistering: register.isPending,
    
    // Courses
    getCourses: () => courses.data,
    isLoadingCourses: courses.isLoading,
    
    // Analytics
    getAnalytics: async (timeRange?: string) => {
      // Simulation d'appel avec timeRange
      return analytics.data || {
        learningTime: { daily: [], weekly: [], monthly: [] },
        courseProgress: [],
        achievements: [],
        strengths: [],
        goals: []
      };
    },
    isLoadingAnalytics: analytics.isLoading,
    
    // AI Services
    chatWithAI: aiTutorChat.mutate,
    analyzeWithAI: visionAnalysis.mutate,
    uploadFile: (file: File) => {
      // Simulation d'upload de fichier
      return Promise.resolve({ url: URL.createObjectURL(file), id: Date.now().toString() });
    },
    isAIProcessing: aiTutorChat.isPending || visionAnalysis.isPending,
    
    // Utility
    refetchCourses: courses.refetch,
    refetchAnalytics: analytics.refetch
  };
};
