import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BookOpen,
  Brain,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';

interface ProgressData {
  daily: {
    date: string;
    studyTime: number; // minutes
    lessonsCompleted: number;
    quizScore: number;
  }[];
  weekly: {
    week: string;
    totalTime: number;
    avgScore: number;
    streak: number;
  };
  monthly: {
    month: string;
    goalsAchieved: number;
    totalGoals: number;
    improvement: number;
  };
  subjects: {
    name: string;
    progress: number;
    timeSpent: number;
    lastActivity: string;
  }[];
}

interface ProgressWidgetProps {
  className?: string;
}

const ProgressWidget: React.FC<ProgressWidgetProps> = ({ className = '' }) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'subjects'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de données de progression
    const mockData: ProgressData = {
      daily: [
        { date: '2024-01-15', studyTime: 45, lessonsCompleted: 2, quizScore: 85 },
        { date: '2024-01-16', studyTime: 60, lessonsCompleted: 3, quizScore: 92 },
        { date: '2024-01-17', studyTime: 30, lessonsCompleted: 1, quizScore: 78 },
        { date: '2024-01-18', studyTime: 75, lessonsCompleted: 4, quizScore: 88 },
        { date: '2024-01-19', studyTime: 50, lessonsCompleted: 2, quizScore: 95 },
        { date: '2024-01-20', studyTime: 40, lessonsCompleted: 2, quizScore: 82 },
        { date: '2024-01-21', studyTime: 65, lessonsCompleted: 3, quizScore: 90 }
      ],
      weekly: {
        week: 'Semaine du 15-21 Jan',
        totalTime: 365,
        avgScore: 87.1,
        streak: 7
      },
      monthly: {
        month: 'Janvier 2024',
        goalsAchieved: 12,
        totalGoals: 15,
        improvement: 15.2
      },
      subjects: [
        { name: 'Mathématiques', progress: 75, timeSpent: 180, lastActivity: 'Il y a 2h' },
        { name: 'Physique', progress: 60, timeSpent: 120, lastActivity: 'Il y a 1 jour' },
        { name: 'Programmation', progress: 85, timeSpent: 240, lastActivity: 'Il y a 30min' },
        { name: 'Histoire', progress: 45, timeSpent: 90, lastActivity: 'Il y a 3 jours' }
      ]
    };

    setTimeout(() => {
      setProgressData(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) return null;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-xl font-bold">Progression</h2>
        </div>
        <p className="text-purple-100 mt-2">Suivez vos performances et objectifs</p>
      </div>

      {/* View Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2">
          {[
            { id: 'daily', label: 'Quotidien', icon: Calendar },
            { id: 'weekly', label: 'Hebdomadaire', icon: BarChart3 },
            { id: 'subjects', label: 'Matières', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedView === id
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedView === 'daily' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {formatTime(progressData.daily.reduce((acc, day) => acc + day.studyTime, 0))}
                </div>
                <div className="text-sm text-blue-600">Temps total</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {progressData.daily.reduce((acc, day) => acc + day.lessonsCompleted, 0)}
                </div>
                <div className="text-sm text-green-600">Leçons</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(progressData.daily.reduce((acc, day) => acc + day.quizScore, 0) / progressData.daily.length)}%
                </div>
                <div className="text-sm text-purple-600">Score moyen</div>
              </div>
            </div>

            {/* Daily Progress Chart */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Activité des 7 derniers jours</h4>
              <div className="space-y-3">
                {progressData.daily.map((day, index) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-gray-600 text-center">
                      {getDayName(day.date)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700">
                          {day.lessonsCompleted} leçon{day.lessonsCompleted > 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-gray-500">{formatTime(day.studyTime)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(day.quizScore)}`}
                          style={{ width: `${Math.min(day.studyTime / 60 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right">
                      <span className={`text-sm font-medium ${day.quizScore >= 85 ? 'text-green-600' : day.quizScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {day.quizScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'weekly' && (
          <div className="space-y-6">
            {/* Weekly Stats */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{progressData.weekly.week}</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{formatTime(progressData.weekly.totalTime)}</div>
                  <div className="text-sm text-gray-600 mt-1">Temps d'étude</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{progressData.weekly.avgScore}%</div>
                  <div className="text-sm text-gray-600 mt-1">Score moyen</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{progressData.weekly.streak}</div>
                  <div className="text-sm text-gray-600 mt-1">Jours consécutifs</div>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Objectifs mensuels</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {progressData.monthly.goalsAchieved}/{progressData.monthly.totalGoals} objectifs atteints
                  </span>
                  <span className="font-medium text-gray-900">
                    {Math.round((progressData.monthly.goalsAchieved / progressData.monthly.totalGoals) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${(progressData.monthly.goalsAchieved / progressData.monthly.totalGoals) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'subjects' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Progression par matière</h4>
            {progressData.subjects.map((subject, index) => (
              <div key={subject.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">{subject.name}</h5>
                    <p className="text-sm text-gray-500">Dernière activité: {subject.lastActivity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{subject.progress}%</div>
                    <div className="text-sm text-gray-500">{formatTime(subject.timeSpent)}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(subject.progress)}`}
                    style={{ 
                      width: `${subject.progress}%`,
                      transitionDelay: `${index * 100}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Performance Insight */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Insight IA</h5>
                  <p className="text-sm text-blue-700">
                    Excellente progression en Programmation! Concentrez-vous sur l'Histoire pour équilibrer vos compétences. 
                    Votre rythme d'apprentissage s'améliore de {progressData.monthly.improvement}% ce mois-ci.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressWidget;
