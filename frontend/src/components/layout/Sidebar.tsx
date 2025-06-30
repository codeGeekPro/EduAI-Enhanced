import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, BarChart, Settings, LifeBuoy, User, Brain } from 'lucide-react';
import GamifiedProgressBar from '../ui/GamifiedProgressBar';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { path: '/courses', icon: Book, label: 'Mes Cours' },
    { path: '/ai-services', icon: Brain, label: 'Services IA' },
    { path: '/analytics', icon: BarChart, label: 'Analyses' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
    { path: '/support', icon: LifeBuoy, label: 'Support' }
  ];

  return (
    <div className="h-full w-64 bg-gray-900 text-white flex flex-col fixed top-0 left-0">
      <div className="p-4 border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold text-center block">EduAI Enhanced</Link>
      </div>
      <div className="p-4 flex items-center">
        <User className="h-10 w-10 rounded-full bg-sky-500 p-2" />
        <div className="ml-3">
          <p className="font-semibold">Apprenant</p>
          <p className="text-sm text-gray-400">Statut : Motivé</p>
        </div>
      </div>
      <div className="px-4 mb-4">
        <GamifiedProgressBar progress={75} level={3} />
      </div>
      <nav className="flex-grow px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link to="/support" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md">
          <LifeBuoy className="h-5 w-5 mr-3" />
          Aide & Support
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
