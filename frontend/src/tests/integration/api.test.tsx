/**
 * Tests d'intégration pour les hooks API
 */

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin, useCourses, useAITutorChat } from '../../hooks/useAPI';
import { authService } from '../../services/auth';
import { backendAPI } from '../../services/api';

// Mock des services
jest.mock('../../services/auth');
jest.mock('../../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    test('should login successfully', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        language: 'fr',
        created_at: '2023-01-01'
      };

      const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        expires_in: 3600
      };

      (authService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'password123'
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should handle login error', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Invalid credentials');
    });
  });

  describe('Courses Flow', () => {
    test('should fetch courses successfully', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Test Course',
          description: 'Test Description',
          instructor: 'Test Instructor',
          duration: 120,
          difficulty: 'beginner' as const,
          category: 'Test',
          image: 'test.jpg',
          rating: 4.5,
          enrolled_count: 100,
          price: 29.99,
          is_free: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ];

      (backendAPI.get as jest.Mock).mockResolvedValue({
        data: mockCourses
      });

      const { result } = renderHook(() => useCourses(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCourses);
      expect(backendAPI.get).toHaveBeenCalledWith('/api/courses', {
        params: undefined
      });
    });
  });

  describe('AI Services Flow', () => {
    test('should handle AI tutor chat', async () => {
      const mockResponse = {
        response: 'Bonjour ! Comment puis-je vous aider ?',
        context: 'greeting',
        suggestions: ['Poser une question', 'Commencer un exercice']
      };

      (backendAPI.post as jest.Mock).mockResolvedValue({
        data: mockResponse
      });

      const { result } = renderHook(() => useAITutorChat(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        message: 'Bonjour',
        context: 'general'
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(backendAPI.post).toHaveBeenCalledWith('/api/ai-tutor/chat', {
        message: 'Bonjour',
        context: 'general'
      });
    });
  });
});
