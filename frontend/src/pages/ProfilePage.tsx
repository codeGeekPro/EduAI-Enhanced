import React, { useState } from 'react';
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
  Target,
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useI18nStore } from '../stores/i18nStore';

type TabType = 'profile' | 'activity' | 'badges' | 'preferences' | 'notifications' | 'security';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useI18nStore();

  const tabs = [
    { id: 'profile' as const, label: t('profile.tabs.profile'), icon: User },
    { id: 'activity' as const, label: t('profile.tabs.activity'), icon: BookOpen },
    { id: 'badges' as const, label: t('profile.tabs.badges'), icon: Award },
    { id: 'preferences' as const, label: t('profile.tabs.preferences'), icon: Settings },
    { id: 'notifications' as const, label: t('profile.tabs.notifications'), icon: Bell },
    { id: 'security' as const, label: t('profile.tabs.security'), icon: Shield }
  ];

  const recentActivity = [
    { type: 'course', title: `${t('profile.activity.completed')}: ${t('courseData.mathematics.title')}`, date: '2025-07-10', time: '14:30' },
    { type: 'badge', title: `${t('profile.activity.badgeEarned')}: Expert Python`, date: '2025-07-09', time: '16:45' },
    { type: 'quiz', title: `${t('profile.activity.quizPassed')}: Bases de ML`, date: '2025-07-08', time: '10:15' }
  ];

  const badges = [
    { name: t('profile.badges.firstCourse'), icon: '🎯', date: '2025-06-01' },
    { name: t('progress.achievementTitles.studious'), icon: '🔥', date: '2025-06-10' },
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
            {t('profile.backToDashboard')}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{t('profile.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Marie Dubois</h2>
                <p className="text-gray-600">{t('profile.userDescription')}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((item) => (
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
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">{t('profile.stats.completedCourses')}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">87%</div>
                    <div className="text-sm text-gray-600">{t('profile.stats.successRate')}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">156h</div>
                    <div className="text-sm text-gray-600">{t('profile.stats.studyTime')}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">8</div>
                    <div className="text-sm text-gray-600">{t('profile.stats.badgesEarned')}</div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.personalInfo.title')}</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">{t('profile.personalInfo.firstName')}</label>
                        <input
                          id="firstName"
                          type="text"
                          value="Marie"
                          placeholder={t('profile.personalInfo.firstName')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">{t('profile.personalInfo.lastName')}</label>
                        <input
                          id="lastName"
                          type="text"
                          value="Dubois"
                          placeholder={t('profile.personalInfo.lastName')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">{t('profile.personalInfo.email')}</label>
                      <input
                        id="email"
                        type="email"
                        value="marie.dubois@email.com"
                        placeholder={t('profile.personalInfo.email')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">{t('profile.personalInfo.phone')}</label>
                        <input
                          id="phone"
                          type="tel"
                          value="+33 1 23 45 67 89"
                          placeholder={t('profile.personalInfo.phone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="birthdate">{t('profile.personalInfo.birthdate')}</label>
                        <input
                          id="birthdate"
                          type="date"
                          value="1985-03-15"
                          title={t('profile.personalInfo.birthdate')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button>{t('profile.personalInfo.saveChanges')}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.activity.title')}</h2>
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
                        <p className="text-sm text-gray-500">{activity.date} à {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.badges.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h3 className="font-medium text-gray-900">{badge.name}</h3>
                      <p className="text-sm text-gray-500">{t('profile.badges.earnedOn')} {badge.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.preferences.title')}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('profile.preferences.language')}</h3>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      aria-label={t('profile.preferences.language')}
                    >
                      <option>Français</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('profile.preferences.timezone')}</h3>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      aria-label={t('profile.preferences.timezone')}
                    >
                      <option>Europe/Paris</option>
                      <option>America/New_York</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('profile.preferences.theme')}</h3>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="light" className="mr-2" defaultChecked />
                        {t('profile.preferences.light')}
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="dark" className="mr-2" />
                        {t('profile.preferences.dark')}
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="theme" value="auto" className="mr-2" />
                        {t('profile.preferences.auto')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.notifications.title')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{t('profile.notifications.courseNotifications')}</h3>
                      <p className="text-sm text-gray-600">{t('profile.notifications.courseNotificationsDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked aria-label={t('profile.notifications.courseNotifications')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{t('profile.notifications.studyReminders')}</h3>
                      <p className="text-sm text-gray-600">{t('profile.notifications.studyRemindersDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked aria-label={t('profile.notifications.studyReminders')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{t('profile.notifications.emailNotifications')}</h3>
                      <p className="text-sm text-gray-600">{t('profile.notifications.emailNotificationsDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" aria-label={t('profile.notifications.emailNotifications')} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('profile.security.title')}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('profile.security.changePassword')}</h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={t('profile.security.currentPassword')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          aria-label={t('profile.security.currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder={t('profile.security.newPassword')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label={t('profile.security.newPassword')}
                      />
                      <input
                        type="password"
                        placeholder={t('profile.security.confirmPassword')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label={t('profile.security.confirmPassword')}
                      />
                      <Button>{t('profile.security.updatePassword')}</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">{t('profile.security.twoFactor')}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('profile.security.twoFactorDesc')}
                    </p>
                    <Button variant="outline">{t('profile.security.enable2FA')}</Button>
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
