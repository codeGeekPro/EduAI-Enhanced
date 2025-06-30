
import React from 'react';

interface GamifiedProgressBarProps {
  progress: number; // 0 to 100
  level: number;
}

const GamifiedProgressBar: React.FC<GamifiedProgressBarProps> = ({ progress, level }) => {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-semibold text-sky-200">Niveau {level}</span>
        <span className="text-xs font-bold text-yellow-300 animate-pulse">XP {progress * 10} / 1000</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GamifiedProgressBar;
