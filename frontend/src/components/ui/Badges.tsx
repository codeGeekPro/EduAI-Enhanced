import React from 'react';
import { Award, Star, Zap } from 'lucide-react';

interface BadgeProps {
  type: 'award' | 'star' | 'zap';
  label: string;
}

const iconMap = {
  award: Award,
  star: Star,
  zap: Zap,
};

const colorMap = {
  award: 'bg-yellow-400 text-yellow-900',
  star: 'bg-blue-400 text-blue-900',
  zap: 'bg-green-400 text-green-900',
};

const Badge: React.FC<BadgeProps> = ({ type, label }) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div className={`flex items-center p-2 rounded-lg ${colors}`}>
      <Icon className="h-6 w-6 mr-2" />
      <span className="font-semibold">{label}</span>
    </div>
  );
};

const Badges: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Badges Récents</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Badge type="award" label="Maître des Concepts" />
        <Badge type="star" label="Apprentissage Rapide" />
        <Badge type="zap" label="Série de 5 jours" />
      </div>
    </div>
  );
};

export default Badges;
