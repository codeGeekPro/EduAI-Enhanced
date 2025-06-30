// Test simple pour identifier les erreurs d'import
console.log('Testing imports...');

// Test des hooks
import { useAPI } from './hooks/useAPI';
console.log('useAPI imported successfully');

// Test des composants IA  
import AITutorChat from './components/ai/AITutorChat';
console.log('AITutorChat imported successfully');

import AdvancedAIAnalysis from './components/ai/AdvancedAIAnalysis';
console.log('AdvancedAIAnalysis imported successfully');

// Test des pages
import AnalyticsPage from './pages/AnalyticsPage';
console.log('AnalyticsPage imported successfully');

console.log('All imports successful!');

export {};
