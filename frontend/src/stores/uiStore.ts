/**
 * 🎨 Store UI global pour les notifications, modals, thème
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: 'confirm' | 'form' | 'custom';
  title: string;
  content: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Notifications
  toasts: Toast[];
  
  // Modals
  modals: Modal[];
  
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Performance
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    apiLatency: number;
    errorCount: number;
    lastUpdated: string;
  };
  
  // Network status
  isOnline: boolean;
  
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  
  // Toast management
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal management
  addModal: (modal: Omit<Modal, 'id'>) => void;
  removeModal: (id: string) => void;
  clearModals: () => void;
  
  // Sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Performance
  updatePerformanceMetrics: (metrics: Partial<UIState['performanceMetrics']>) => void;
  
  // Network
  setOnlineStatus: (online: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      globalLoading: false,
      pageLoading: false,
      toasts: [],
      modals: [],
      sidebarOpen: true,
      sidebarCollapsed: false,
      performanceMetrics: {
        loadTime: 0,
        renderTime: 0,
        apiLatency: 0,
        errorCount: 0,
        lastUpdated: new Date().toISOString()
      },
      isOnline: navigator.onLine,

      setTheme: (theme) => set({ theme }),
      
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
      
      setPageLoading: (loading) => set({ pageLoading: loading }),

      addToast: (toast) => {
        const id = Date.now().toString();
        const newToast = { ...toast, id };
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));
        
        // Auto-remove après duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 5000);
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      })),

      clearToasts: () => set({ toasts: [] }),

      addModal: (modal) => {
        const id = Date.now().toString();
        const newModal = { ...modal, id };
        
        set((state) => ({
          modals: [...state.modals, newModal]
        }));
      },

      removeModal: (id) => set((state) => ({
        modals: state.modals.filter(modal => modal.id !== id)
      })),

      clearModals: () => set({ modals: [] }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      updatePerformanceMetrics: (metrics) => set((state) => ({
        performanceMetrics: {
          ...state.performanceMetrics,
          ...metrics,
          lastUpdated: new Date().toISOString()
        }
      })),

      setOnlineStatus: (online) => set({ isOnline: online })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed 
      })
    }
  )
);
