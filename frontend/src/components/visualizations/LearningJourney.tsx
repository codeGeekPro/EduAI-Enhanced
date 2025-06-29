import React from 'react';

const LearningJourney: React.FC = () => {
  return (
    <div className="h-80 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Parcours d'Apprentissage 3D</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Visualisation interactive en développement</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default LearningJourney;
