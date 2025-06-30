import React from 'react';
import { Mic, X } from 'lucide-react';

interface VoiceInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceInteractionModal: React.FC<VoiceInteractionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center relative">
        <button onClick={onClose} aria-label="Close voice interaction modal" className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Interaction Vocale</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Dites "Hey EduAI" suivi de votre commande.</p>
        <div className="flex justify-center items-center">
          <div className="relative flex items-center justify-center h-32 w-32 rounded-full bg-sky-500 animate-pulse">
            <Mic className="h-16 w-16 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Exemple : "Montre-moi ma progression en mathématiques."</p>
      </div>
    </div>
  );
};

export default VoiceInteractionModal;
