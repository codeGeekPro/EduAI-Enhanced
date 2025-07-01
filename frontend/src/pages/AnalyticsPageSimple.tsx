import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAPI } from '../hooks/useAPI';

interface AnalyticsData {
  learningTime: {
    daily: Array<{ date: string; minutes: number; }>;
    weekly: Array<{ week: string; hours: number; }>;
    monthly: Array<{ month: string; hours: number; }>;
  };
  courseProgress: Array<{
    courseName: string;
    progress: number;
    timeSpent: number;
    lastActivity: string;
  }>;
  achievements: Array<{
    name: string;
    date: string;
    type: 'badge' | 'certificate' | 'milestone';
  }>;
  strengths: Array<{
    subject: string;
    score: number;
    improvement: number;
  }>;
  goals: Array<{
    name: string;
    progress: number;
    target: number;
    deadline: string;
  }>;
}

const AnalyticsPageSimple: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  const { getAnalytics } = useAPI();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {      const data = await getAnalytics(timeRange);
      if (data && typeof data === 'object' && 'data' in data) {
        setAnalyticsData(data.data as AnalyticsData);
      } else {
        setAnalyticsData(data as AnalyticsData);
      }
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error);
        // Données de démonstration
        setAnalyticsData({
          learningTime: {
            daily: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
              minutes: Math.floor(Math.random() * 120) + 30
            })),
            weekly: Array.from({ length: 4 }, (_, i) => ({
              week: `Semaine ${i + 1}`,
              hours: Math.floor(Math.random() * 15) + 5
            })),
            monthly: Array.from({ length: 6 }, (_, i) => ({
              month: new Date(Date.now() - (5-i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { month: 'short' }),
              hours: Math.floor(Math.random() * 40) + 20
            }))
          },
          courseProgress: [
            { courseName: 'JavaScript Avancé', progress: 85, timeSpent: 24, lastActivity: '2024-01-15' },
            { courseName: 'React & TypeScript', progress: 60, timeSpent: 18, lastActivity: '2024-01-14' },
            { courseName: 'Node.js & API', progress: 40, timeSpent: 12, lastActivity: '2024-01-13' },
            { courseName: 'Base de données', progress: 75, timeSpent: 20, lastActivity: '2024-01-12' }
          ],
          achievements: [
            { name: 'Premier cours terminé', date: '2024-01-10', type: 'badge' },
            { name: 'Certification JavaScript', date: '2024-01-08', type: 'certificate' },
            { name: '100 heures d\'apprentissage', date: '2024-01-05', type: 'milestone' }
          ],
          strengths: [
            { subject: 'JavaScript', score: 92, improvement: 8 },
            { subject: 'React', score: 88, improvement: 12 },
            { subject: 'CSS', score: 85, improvement: -2 },
            { subject: 'Node.js', score: 76, improvement: 15 },
            { subject: 'SQL', score: 82, improvement: 5 }
          ],
          goals: [
            { name: 'Terminer le cours React', progress: 60, target: 100, deadline: '2024-02-01' },
            { name: 'Obtenir la certification', progress: 75, target: 100, deadline: '2024-01-25' },
            { name: '50h ce mois-ci', progress: 32, target: 50, deadline: '2024-01-31' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, getAnalytics]);

  const handleExportReport = () => {
    if (!analyticsData) return;
    
    const report = {
      généré: new Date().toISOString(),
      période: timeRange,
      données: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-analytics-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement des analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Aucune donnée disponible
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Commencez à utiliser la plateforme pour voir vos analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Sélectionner la période"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          
          <button
            onClick={handleExportReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Temps total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.learningTime.weekly.reduce((acc, w) => acc + w.hours, 0)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Cours actifs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.courseProgress.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Réussites
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.achievements.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Progression moy.
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analyticsData.courseProgress.reduce((acc, c) => acc + c.progress, 0) / analyticsData.courseProgress.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques - Version simplifiée sans Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Temps d'apprentissage quotidien
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.learningTime.daily.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ height: `${(day.minutes / 120) * 100}%` }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {day.date.split('/')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progression par cours
          </h3>
          <div className="space-y-4">
            {analyticsData.courseProgress.map((course, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {course.courseName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Objectifs en cours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.goals.map((goal, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {goal.name}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round((goal.progress / goal.target) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{goal.progress}/{goal.target}</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Réussites récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Réussites récentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.achievements.map((achievement, index) => (
            <div key={index} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className={`p-2 rounded-lg mr-4 ${
                achievement.type === 'badge' ? 'bg-yellow-100 dark:bg-yellow-900' :
                achievement.type === 'certificate' ? 'bg-blue-100 dark:bg-blue-900' :
                'bg-green-100 dark:bg-green-900'
              }`}>
                <Award className={`h-6 w-6 ${
                  achievement.type === 'badge' ? 'text-yellow-600' :
                  achievement.type === 'certificate' ? 'text-blue-600' :
                  'text-green-600'
                }`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {achievement.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPageSimple;
