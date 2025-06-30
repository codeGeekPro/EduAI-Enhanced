/**
 * Tests d'intégration des composants
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../../pages/LoginPage';
import CoursesPage from '../../pages/CoursesPage';
import { useAuthStore } from '../../stores/authStore';

// Mock des stores
jest.mock('../../stores/authStore');
jest.mock('../../hooks/useAPI');

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

describe('Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginPage', () => {
    test('should render login form', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false
      });

      render(<LoginPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    test('should handle form submission', async () => {
      const mockLogin = jest.fn();
      
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false
      });

      require('../../hooks/useAPI').useLogin.mockReturnValue({
        mutateAsync: mockLogin,
        isPending: false,
        error: null
      });

      render(<LoginPage />, { wrapper: createWrapper() });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/mot de passe/i), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember_me: false
        });
      });
    });
  });

  describe('CoursesPage', () => {
    test('should render courses list', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Test Course',
          description: 'Test Description',
          instructor: 'Test Instructor',
          duration: 120,
          difficulty: 'beginner',
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

      require('../../hooks/useAPI').useCourses.mockReturnValue({
        data: mockCourses,
        isLoading: false,
        error: null
      });

      require('../../stores/coursesStore').useCoursesStore.mockReturnValue({
        searchQuery: '',
        filters: { category: '', difficulty: '', price: 'all', rating: 0 },
        setSearchQuery: jest.fn(),
        setFilters: jest.fn(),
        getFilteredCourses: () => mockCourses
      });

      render(<CoursesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Course')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Par Test Instructor')).toBeInTheDocument();
      });
    });

    test('should filter courses by search', async () => {
      const mockSetSearchQuery = jest.fn();

      require('../../stores/coursesStore').useCoursesStore.mockReturnValue({
        searchQuery: '',
        filters: { category: '', difficulty: '', price: 'all', rating: 0 },
        setSearchQuery: mockSetSearchQuery,
        setFilters: jest.fn(),
        getFilteredCourses: () => []
      });

      render(<CoursesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/rechercher un cours/i);
      fireEvent.change(searchInput, { target: { value: 'Python' } });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('Python');
    });
  });
});
