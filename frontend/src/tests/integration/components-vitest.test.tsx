/**
 * Tests d'intégration des composants - Compatible Vitest
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import LoginPage from '../../pages/LoginPage';
import CoursesPage from '../../pages/CoursesPage';

// Mock des stores et hooks
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../hooks/useAPI', () => ({
  useLogin: vi.fn(),
  useCourses: vi.fn(),
  useEnrollCourse: vi.fn()
}));

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

describe('Components Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage Component', () => {
    test('should render login form', () => {
      const { useAuthStore } = require('../../stores/authStore');
      const { useLogin } = require('../../hooks/useAPI');
      
      useAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false
      });

      useLogin.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null
      });

      render(<LoginPage />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    test('should handle form submission', async () => {
      const mockLogin = vi.fn();
      const { useAuthStore } = require('../../stores/authStore');
      const { useLogin } = require('../../hooks/useAPI');
      
      useAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false
      });

      useLogin.mockReturnValue({
        mutate: mockLogin,
        isPending: false,
        error: null
      });

      render(<LoginPage />, { wrapper: createWrapper() });
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
  });

  describe('CoursesPage Component', () => {
    test('should render courses list', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Test Course',
          description: 'Test Description',
          instructor: 'Test Instructor',
          duration: 120,
          level: 'beginner',
          thumbnail: 'test.jpg',
          enrolled: false
        }
      ];

      const { useAuthStore } = require('../../stores/authStore');
      const { useCourses, useEnrollCourse } = require('../../hooks/useAPI');
      
      useAuthStore.mockReturnValue({
        user: { id: '1', username: 'testuser' },
        isAuthenticated: true
      });

      useCourses.mockReturnValue({
        data: { courses: mockCourses, total: 1 },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      useEnrollCourse.mockReturnValue({
        mutate: vi.fn(),
        isPending: false
      });

      render(<CoursesPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Test Course')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
      });
    });

    test('should handle search functionality', async () => {
      const mockSetSearchQuery = vi.fn();
      const { useAuthStore } = require('../../stores/authStore');
      const { useCourses } = require('../../hooks/useAPI');
      
      useAuthStore.mockReturnValue({
        user: { id: '1' },
        isAuthenticated: true
      });

      useCourses.mockReturnValue({
        data: { courses: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<CoursesPage />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('React');
      });
    });
  });
});
