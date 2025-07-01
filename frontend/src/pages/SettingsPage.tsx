import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  Smartphone,
  Monitor,
  Save,
  Download,
  Trash2
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useThemeStore } from '../stores/themeStore';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const [notifications, setNotifications] = useState({
    courses: true,
    achievements: true,
    reminders: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    progressVisible: true,
    analyticsEnabled: true
  });
  const [preferences, setPreferences] = useState({
    language: 'fr',
    soundEnabled: true,
    animationsEnabled: true,
    autoSave: true
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Simulation sauvegarde des paramètres
      const settings = {
        notifications,
        privacy,
        preferences,
        theme: isDarkMode ? 'dark' : 'light'
      };
      
      localStorage.setItem('eduai-settings', JSON.stringify(settings));
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleExportData = () => {
    const data = {
      settings: { notifications, privacy, preferences },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduai-settings-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      // Simulation suppression de compte
      alert('Fonctionnalité de suppression de compte non implémentée dans cette démo');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
      </div>

      {/* Apparence */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          Apparence
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode sombre
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activer le mode sombre pour réduire la fatigue oculaire
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              {isDarkMode ? (
                <Moon className="absolute left-1 h-3 w-3 text-blue-600" />
              ) : (
                <Sun className="absolute right-1 h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Animations
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activer les animations et transitions
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('animationsEnabled', !preferences.animationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.animationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle animations"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key === 'courses' && 'Nouveaux cours'}
                  {key === 'achievements' && 'Réussites'}
                  {key === 'reminders' && 'Rappels'}
                  {key === 'marketing' && 'Marketing'}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'courses' && 'Notifications pour les nouveaux cours disponibles'}
                  {key === 'achievements' && 'Notifications pour les badges et récompenses'}
                  {key === 'reminders' && 'Rappels pour les cours en cours'}
                  {key === 'marketing' && 'Offres spéciales et actualités'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`Toggle ${key} notifications`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confidentialité */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Confidentialité
        </h2>
        <div className="space-y-4">
          {Object.entries(privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key === 'profilePublic' && 'Profil public'}
                  {key === 'progressVisible' && 'Progression visible'}
                  {key === 'analyticsEnabled' && 'Analytics activées'}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'profilePublic' && 'Rendre votre profil visible aux autres utilisateurs'}
                  {key === 'progressVisible' && 'Permettre aux autres de voir votre progression'}
                  {key === 'analyticsEnabled' && 'Collecter des données pour améliorer l\'expérience'}
                </p>
              </div>
              <button
                onClick={() => handlePrivacyChange(key as keyof typeof privacy)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={`Toggle ${key}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Préférences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Préférences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Langue
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choisir la langue de l'interface
              </p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Sélectionner la langue"
              title="Sélectionner la langue de l'interface"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Son activé
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activer les effets sonores et notifications audio
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle sound"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              {preferences.soundEnabled ? (
                <Volume2 className="absolute left-1 h-3 w-3 text-blue-600" />
              ) : (
                <VolumeX className="absolute right-1 h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sauvegarde automatique
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sauvegarder automatiquement votre progression
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoSave ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle auto-save"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Actions
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleSaveSettings}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </button>

          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter mes données
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
