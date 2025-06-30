/**
 * Configuration de setup pour Vitest
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock pour les APIs Web qui ne sont pas disponibles dans jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock pour ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');

// Mock pour les modules problématiques
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => children,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ scene: {}, camera: {}, gl: {} })),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Text: () => null,
  Box: () => null,
  Sphere: () => null,
}));

// Mock pour les services Web Workers
vi.mock('../services/offline', () => ({
  offlineManager: {
    syncPendingData: vi.fn(),
    getCachedData: vi.fn(),
    cacheData: vi.fn(),
  }
}));
