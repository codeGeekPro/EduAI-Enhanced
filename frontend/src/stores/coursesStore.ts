/**
 * 📚 Store des cours avec gestion d'état avancée
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  image: string;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  
  // Progression utilisateur
  progress?: {
    completion_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    current_lesson: number;
    last_accessed: string;
  };
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration: number;
  order: number;
  is_completed: boolean;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: Question[];
  passing_score: number;
  time_limit?: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
}

interface CoursesState {
  courses: Course[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    category: string;
    difficulty: string;
    price: 'all' | 'free' | 'paid';
    rating: number;
  };
  
  // Actions
  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CoursesState['filters']>) => void;
  
  // Méthodes utilitaires
  getFilteredCourses: () => Course[];
  getCourseProgress: (courseId: string) => number;
  updateCourseProgress: (courseId: string, progress: Course['progress']) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: [],
      currentCourse: null,
      currentLesson: null,
      loading: false,
      error: null,
      searchQuery: '',
      filters: {
        category: '',
        difficulty: '',
        price: 'all',
        rating: 0
      },

      setCourses: (courses) => set({ courses, error: null }),
      
      setCurrentCourse: (course) => set({ currentCourse: course }),
      
      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      getFilteredCourses: () => {
        const { courses, searchQuery, filters } = get();
        
        return courses.filter(course => {
          // Recherche textuelle
          if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }
          
          // Filtre par catégorie
          if (filters.category && course.category !== filters.category) {
            return false;
          }
          
          // Filtre par difficulté
          if (filters.difficulty && course.difficulty !== filters.difficulty) {
            return false;
          }
          
          // Filtre par prix
          if (filters.price === 'free' && !course.is_free) {
            return false;
          }
          if (filters.price === 'paid' && course.is_free) {
            return false;
          }
          
          // Filtre par note
          if (filters.rating > 0 && course.rating < filters.rating) {
            return false;
          }
          
          return true;
        });
      },

      getCourseProgress: (courseId) => {
        const course = get().courses.find(c => c.id === courseId);
        return course?.progress?.completion_percentage || 0;
      },

      updateCourseProgress: (courseId, progress) => {
        set((state) => ({
          courses: state.courses.map(course =>
            course.id === courseId ? { ...course, progress } : course
          )
        }));
      }
    }),
    {
      name: 'courses-storage',
      partialize: (state) => ({ 
        courses: state.courses,
        currentCourse: state.currentCourse 
      })
    }
  )
);
