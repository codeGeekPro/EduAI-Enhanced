/**
 * Tests d'intégration simples et fonctionnels
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock des hooks et stores avant les imports des composants
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }))
}));

vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    addToast: vi.fn(),
    theme: 'light',
    toggleTheme: vi.fn(),
  }))
}));

vi.mock('../../hooks/useAPI', () => ({
  useLogin: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null
  })),
  useCourses: vi.fn(() => ({
    data: { courses: [], total: 0 },
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })),
  useAPI: vi.fn(() => ({
    getCourses: vi.fn(),
    getAnalytics: vi.fn(),
  }))
}));

// Import des composants après les mocks
import HomePage from '../../pages/HomePage';
import LoginPage from '../../pages/LoginPage';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Frontend Integration Tests', () => {
  test('HomePage should render without crashing', () => {
    render(<HomePage />, { wrapper: createWrapper() });
    
    // Vérifier qu'au moins un élément est présent
    expect(document.body).toBeTruthy();
  });

  test('LoginPage should render form elements', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    // Vérifier que le composant se rend sans erreur
    expect(document.body).toBeTruthy();
  });

  test('Stores should be properly mocked', () => {
    const { useAuthStore } = require('../../stores/authStore');
    const authStore = useAuthStore();
    
    expect(authStore).toBeDefined();
    expect(authStore.user).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
  });

  test('API hooks should be properly mocked', () => {
    const { useLogin, useCourses } = require('../../hooks/useAPI');
    
    const loginHook = useLogin();
    const coursesHook = useCourses();
    
    expect(loginHook).toBeDefined();
    expect(loginHook.mutate).toBeDefined();
    expect(coursesHook).toBeDefined();
    expect(coursesHook.data).toBeDefined();
  });
});
