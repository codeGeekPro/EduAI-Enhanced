import React, { useState } from 'react';
import { 
  Play, 
  MessageSquare, 
  FileText, 
  Camera, 
  Mic, 
  Calculator,
  Brain,
  Search,
  PlusCircle,
  BookOpen,
  Video,
  HelpCircle
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
  category: 'learn' | 'create' | 'practice' | 'explore';
  action: () => void;
  isNew?: boolean;
  isPremium?: boolean;
}

interface QuickActionsWidgetProps {
  className?: string;
  onActionClick?: (actionId: string) => void;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ 
  className = '',
  onActionClick 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    // Learning Actions
    {
      id: 'start-lesson',
      title: 'Nouvelle leçon',
      description: 'Commencer une nouvelle leçon interactive',
      icon: <Play className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      category: 'learn',
      action: () => handleAction('start-lesson')
    },
    {
      id: 'video-lesson',
      title: 'Cours vidéo',
      description: 'Regarder des vidéos explicatives',
      icon: <Video className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      category: 'learn',
      action: () => handleAction('video-lesson')
    },
    {
      id: 'reading-material',
      title: 'Matériel de lecture',
      description: 'Accéder aux documents et ressources',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      category: 'learn',
      action: () => handleAction('reading-material')
    },

    // Creation Actions
    {
      id: 'chat-ai',
      title: 'Chat avec l\'IA',
      description: 'Poser des questions à l\'assistant IA',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      category: 'create',
      action: () => handleAction('chat-ai'),
      isNew: true
    },
    {
      id: 'create-note',
      title: 'Prendre des notes',
      description: 'Créer et organiser vos notes',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
      category: 'create',
      action: () => handleAction('create-note')
    },
    {
      id: 'voice-record',
      title: 'Enregistrement vocal',
      description: 'Enregistrer des mémos vocaux',
      icon: <Mic className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      category: 'create',
      action: () => handleAction('voice-record'),
      isPremium: true
    },

    // Practice Actions
    {
      id: 'practice-quiz',
      title: 'Quiz pratique',
      description: 'Tester vos connaissances',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      category: 'practice',
      action: () => handleAction('practice-quiz')
    },
    {
      id: 'calculator',
      title: 'Calculatrice',
      description: 'Outil de calcul avancé',
      icon: <Calculator className="w-5 h-5" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
      category: 'practice',
      action: () => handleAction('calculator')
    },
    {
      id: 'ai-tutor',
      title: 'Tuteur IA',
      description: 'Séance personnalisée avec l\'IA',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100',
      category: 'practice',
      action: () => handleAction('ai-tutor'),
      isPremium: true
    },

    // Exploration Actions
    {
      id: 'search-resources',
      title: 'Rechercher',
      description: 'Explorer la bibliothèque de ressources',
      icon: <Search className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      category: 'explore',
      action: () => handleAction('search-resources')
    },
    {
      id: 'scan-document',
      title: 'Scanner document',
      description: 'Scanner et analyser des documents',
      icon: <Camera className="w-5 h-5" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      category: 'explore',
      action: () => handleAction('scan-document'),
      isPremium: true
    },
    {
      id: 'create-custom',
      title: 'Action personnalisée',
      description: 'Créer une action sur mesure',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      hoverColor: 'hover:bg-violet-100',
      category: 'explore',
      action: () => handleAction('create-custom')
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes', count: quickActions.length },
    { id: 'learn', label: 'Apprendre', count: quickActions.filter(a => a.category === 'learn').length },
    { id: 'create', label: 'Créer', count: quickActions.filter(a => a.category === 'create').length },
    { id: 'practice', label: 'Pratiquer', count: quickActions.filter(a => a.category === 'practice').length },
    { id: 'explore', label: 'Explorer', count: quickActions.filter(a => a.category === 'explore').length }
  ];

  const handleAction = (actionId: string) => {
    console.log(`Action déclenchée: ${actionId}`);
    if (onActionClick) {
      onActionClick(actionId);
    }
    
    // Ici, vous pouvez ajouter la logique spécifique pour chaque action
    switch (actionId) {
      case 'start-lesson':
        // Naviguer vers une nouvelle leçon
        break;
      case 'chat-ai':
        // Ouvrir le chat IA
        break;
      case 'create-note':
        // Ouvrir l'éditeur de notes
        break;
      // ... autres actions
      default:
        console.log(`Action non implémentée: ${actionId}`);
    }
  };

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
        <h2 className="text-xl font-bold mb-2">Actions rapides</h2>
        <p className="text-green-100">Accédez rapidement à vos outils favoris</p>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              onClick={action.action}
              className={`relative p-4 rounded-lg border-2 border-gray-100 cursor-pointer transition-all duration-200 ${action.bgColor} ${action.hoverColor} hover:border-gray-300 hover:shadow-md group`}
            >
              {/* Premium Badge */}
              {action.isPremium && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  Pro
                </div>
              )}

              {/* New Badge */}
              {action.isNew && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Nouveau
                </div>
              )}

              {/* Icon */}
              <div className={`${action.color} mb-3 transition-transform group-hover:scale-110`}>
                {action.icon}
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-500">
                {action.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* No Actions Message */}
        {filteredActions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Aucune action trouvée pour cette catégorie</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} disponible{filteredActions.length > 1 ? 's' : ''}
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Personnaliser →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsWidget;
