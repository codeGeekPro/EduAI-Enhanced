import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Clock, Trophy, TrendingUp } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  category: string;
  nextLesson?: {
    id: string;
    title: string;
    duration: string;
  };
}

interface LearningPathWidgetProps {
  className?: string;
}

const LearningPathWidget: React.FC<LearningPathWidgetProps> = ({ className = '' }) => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de données d'apprentissage
    const mockPaths: LearningPath[] = [
      {
        id: '1',
        title: 'Mathématiques Avancées',
        description: 'Maîtrisez les concepts mathématiques complexes',
        progress: 65,
        totalLessons: 24,
        completedLessons: 16,
        difficulty: 'advanced',
        estimatedTime: '8 semaines',
        category: 'Mathématiques',
        nextLesson: {
          id: 'l17',
          title: 'Intégrales par parties',
          duration: '45 min'
        }
      },
      {
        id: '2',
        title: 'Programmation Python',
        description: 'Apprenez Python de zéro',
        progress: 30,
        totalLessons: 32,
        completedLessons: 10,
        difficulty: 'beginner',
        estimatedTime: '10 semaines',
        category: 'Informatique',
        nextLesson: {
          id: 'l11',
          title: 'Boucles et conditions',
          duration: '30 min'
        }
      }
    ];

    setTimeout(() => {
      setLearningPaths(mockPaths);
      setSelectedPath(mockPaths[0]);
      setLoading(false);
    }, 500);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-bold">Parcours d'apprentissage</h2>
        </div>
        <p className="text-blue-100 mt-2">Suivez votre progression et continuez à apprendre</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedPath && (
          <div className="space-y-6">
            {/* Current Path Info */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{selectedPath.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedPath.difficulty)}`}>
                  {selectedPath.difficulty}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{selectedPath.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedPath.completedLessons}/{selectedPath.totalLessons} leçons terminées
                  </span>
                  <span className="font-medium text-gray-900">{selectedPath.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(selectedPath.progress)}`}
                    style={{ width: `${selectedPath.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Temps estimé: {selectedPath.estimatedTime}</span>
              </div>
            </div>

            {/* Next Lesson */}
            {selectedPath.nextLesson && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Prochaine leçon
                </h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">{selectedPath.nextLesson.title}</p>
                    <p className="text-sm text-blue-600">{selectedPath.nextLesson.duration}</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    Continuer
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* All Paths */}
            {learningPaths.length > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tous vos parcours</h4>
                <div className="space-y-2">
                  {learningPaths.map((path) => (
                    <div 
                      key={path.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPath.id === path.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPath(path)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{path.title}</p>
                          <p className="text-xs text-gray-600">{path.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{path.progress}%</p>
                          <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className={`h-1 rounded-full ${getProgressColor(path.progress)}`}
                              style={{ width: `${path.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Objectif de la semaine</p>
                  <p className="text-sm text-yellow-700">Terminez 3 leçons supplémentaires pour débloquer le niveau suivant!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathWidget;
