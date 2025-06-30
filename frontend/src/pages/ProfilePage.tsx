import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  BookOpen,
  Clock,
  Target,
  Bell,
  Shield,
  Palette,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('profile');

  const userStats = {
    coursesCompleted: 12,
    hoursLearned: 48,
    streakDays: 15,
    badges: 8
  };

  const recentActivity = [
    { type: 'course', title: 'Communication Efficace', action: 'Cours terminé', date: '2025-06-28' },
    { type: 'badge', title: 'Expert en IA', action: 'Badge obtenu', date: '2025-06-27' },
    { type: 'quiz', title: 'Quiz Leadership', action: 'Score: 95%', date: '2025-06-26' },
    { type: 'course', title: 'Analyse de Données', action: 'Chapitre 3 terminé', date: '2025-06-25' }
  ];

  const badges = [
    { name: 'Premier Cours', icon: '🎓', date: '2025-05-15' },
    { name: 'Série de 5 jours', icon: '🔥', date: '2025-06-10' },
    { name: 'Expert en IA', icon: '🤖', date: '2025-06-27' },
    { name: 'Communication Pro', icon: '💬', date: '2025-06-28' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Mon Profil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Jean Dupont</h3>
                <p className="text-gray-600">jean.dupont@entreprise.com</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Informations personnelles', icon: User },
                  { id: 'activity', label: 'Activité récente', icon: Clock },
                  { id: 'badges', label: 'Badges et récompenses', icon: Award },
                  { id: 'preferences', label: 'Préférences', icon: Palette },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'security', label: 'Sécurité', icon: Shield }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{userStats.coursesCompleted}</div>
                        <div className="text-sm text-gray-600">Cours terminés</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{userStats.hoursLearned}h</div>
                        <div className="text-sm text-gray-600">Heures d'apprentissage</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{userStats.streakDays}</div>
                        <div className="text-sm text-gray-600">Jours consécutifs</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-yellow-600 mr-3" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{userStats.badges}</div>
                        <div className="text-sm text-gray-600">Badges obtenus</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                        <input
                          type="text"
                          value="Jean"
                          placeholder="Prénom"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value="Dupont"
                          placeholder="Nom"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value="jean.dupont@entreprise.com"
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value="+33 1 23 45 67 89"
                          placeholder="Téléphone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          value="1985-03-15"
                          title="Date de naissance"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value="123 Rue de la Paix, 75001 Paris, France"
                      placeholder="Adresse"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="pt-4">
                      <Button>Sauvegarder les modifications</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité récente</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        {activity.type === 'course' && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {activity.type === 'badge' && <Award className="h-5 w-5 text-yellow-600" />}
                        {activity.type === 'quiz' && <Target className="h-5 w-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <div className="text-sm text-gray-500">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Badges et récompenses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h3 className="font-medium text-gray-900">{badge.name}</h3>
                      <p className="text-sm text-gray-500">Obtenu le {badge.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Préférences</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="language-select" className="font-medium text-gray-900 mb-3 block">Langue</label>
                    <select
                      id="language-select"
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Thème</h3>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="light" className="mr-2" defaultChecked />
                        Clair
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="dark" className="mr-2" />
                        Sombre
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="auto" className="mr-2" />
                        Automatique
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Apprentissage</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Activer les rappels quotidiens
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Sons et vibrations
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Mode hors ligne automatique
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Préférences de notification</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Nouveaux cours</h3>
                      <p className="text-sm text-gray-600">Recevoir des notifications pour les nouveaux cours</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Rappels d'apprentissage</h3>
                      <p className="text-sm text-gray-600">Rappels quotidiens pour maintenir votre série</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Récompenses et badges</h3>
                      <p className="text-sm text-gray-600">Notifications pour les nouveaux badges obtenus</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Changer le mot de passe</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Mot de passe actuel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Confirmer le nouveau mot de passe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button>Mettre à jour le mot de passe</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Ajoutez une couche de sécurité supplémentaire à votre compte
                    </p>
                    <Button variant="outline">Activer 2FA</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
