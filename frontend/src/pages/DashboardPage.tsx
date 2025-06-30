import { useState } from 'react';
import ConceptMap, { ConceptMapData } from "../components/visualizations/ConceptMap";
import LearningJourney from "../components/visualizations/LearningJourney";
import Badges from '../components/ui/Badges';
import EmotionBanner from '../components/ui/EmotionBanner';
import VoiceInteractionModal from '../components/ui/VoiceInteractionModal';
import { Button } from '../components/ui/Button'; // Corrected casing
import { Mic } from 'lucide-react';

// Données factices pour la carte conceptuelle conformes à l'interface ConceptMapData
const conceptMapData: ConceptMapData = {
  nodes: [
    { id: "React", group: "framework", size: 20 },
    { id: "TypeScript", group: "language", size: 15 },
    { id: "Vite", group: "tool", size: 10 },
    { id: "State Management", group: "concept", size: 12 },
    { id: "Components", group: "concept", size: 18 },
  ],
  links: [
    { source: "React", target: "Components", value: 1 },
    { source: "React", target: "State Management", value: 1 },
    { source: "React", target: "TypeScript", value: 1 },
    { source: "Vite", target: "React", value: 1 },
  ],
};

export default function DashboardPage() {
  const [emotion] = useState('curious'); // 'confused', 'curious', etc.
  const [showBanner, setShowBanner] = useState(true);
  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);

  const emotionMessage = {
    confused: "Il semble que vous soyez bloqué. Voulez-vous revoir les concepts de base ?",
    curious: "Votre curiosité est un atout ! Explorons des sujets connexes.",
  }[emotion] || "";

  return (
    <div className="space-y-8">
      {showBanner && emotionMessage && (
        <EmotionBanner 
          emotion={emotion} 
          message={emotionMessage} 
          onDismiss={() => setShowBanner(false)} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4">Carte Conceptuelle</h3>
            <div className="h-96">
              <ConceptMap data={conceptMapData} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-4">Parcours d'Apprentissage (3D)</h3>
            <div className="h-96">
              <LearningJourney />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <Badges />
          {/* Placeholder for Weekly Goals */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Objectifs Hebdomadaires</h3>
            <p className="text-gray-600 dark:text-gray-400">Bientôt disponible...</p>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setVoiceModalOpen(true)} 
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 bg-sky-500 hover:bg-sky-600 text-white shadow-lg animate-bounce"
        aria-label="Open voice interaction"
      >
        <Mic className="h-8 w-8" />
      </Button>

      <VoiceInteractionModal isOpen={isVoiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </div>
  );
}
