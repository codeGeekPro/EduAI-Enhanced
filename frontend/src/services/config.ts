/**
 * Configuration des services API pour EduAI Enhanced
 */

const API_CONFIG = {
  // URLs des services
  BACKEND_URL: (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000',
  AI_SERVICES_URL: (import.meta as any).env?.VITE_AI_SERVICES_URL || 'http://localhost:8001',
  
  // Endpoints
  ENDPOINTS: {
    // Authentification
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile'
    },
    
    // Utilisateurs
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update',
      DELETE: '/api/users/delete',
      PREFERENCES: '/api/users/preferences'
    },
    
    // Cours
    COURSES: {
      LIST: '/api/courses',
      DETAILS: '/api/courses/:id',
      ENROLL: '/api/courses/:id/enroll',
      PROGRESS: '/api/courses/:id/progress',
      COMPLETE: '/api/courses/:id/complete'
    },
    
    // IA Services
    AI: {
      // Tuteur IA (Backend)
      TUTOR_CHAT: '/api/ai-tutor/chat',
      TUTOR_EXERCISE: '/api/ai-tutor/generate-exercise',
      TUTOR_FEEDBACK: '/api/ai-tutor/feedback',
      
      // Services IA directs (AI Services)
      NLP_ANALYZE: '/nlp/analyze',
      EMOTION_DETECT: '/emotion/detect',
      SPEECH_TO_TEXT: '/speech/transcribe',
      TEXT_TO_SPEECH: '/speech/synthesize',
      VISION_ANALYZE: '/vision/analyze'
    },
    
    // Analytics
    ANALYTICS: {
      DASHBOARD: '/api/analytics/dashboard',
      PROGRESS: '/api/analytics/progress',
      PERFORMANCE: '/api/analytics/performance'
    }
  },
  
  // Configuration des requêtes
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout en millisecondes
  TIMEOUT: 30000
};

export default API_CONFIG;
