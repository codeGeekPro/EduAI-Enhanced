import React, { useState, memo } from 'react';
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
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import { cn } from '../lib/utils';

// Section générique pour les paramètres
const SettingsSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = memo(({ title, description, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200" aria-label={title}>{title}</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6" aria-describedby={description}>{description}</p>
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
      {children}
    </div>
  </div>
));

// Ligne de paramètre avec un interrupteur
const ToggleSetting: React.FC<{ label: string; checked: boolean; onChange: () => void; icon: React.ReactNode }> = memo(({ label, checked, onChange, icon }) => {
  const id = React.useId();

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center">
        <span className="mr-3 text-gray-500 dark:text-gray-400" aria-hidden="true">{icon}</span>
        <span className="text-gray-700 dark:text-gray-300" aria-label={label}>{label}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer" htmlFor={id} title={label}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          aria-label={label}
        />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
});

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useI18nStore();
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
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    const settings = { notifications, privacy, soundEnabled, theme, language };
    localStorage.setItem('eduai-settings', JSON.stringify(settings));
    alert(t('settings.messages.saveSuccess'));
  };

  const handleExportData = () => {
    const data = {
      settings: { notifications, privacy, soundEnabled, theme, language },
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('settings.messages.exportFilename')}-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('settings.account.deleteConfirmation') + '\n' + t('settings.account.deleteWarning'))) {
      if (window.confirm(t('settings.account.deleteFinalConfirmation'))) {
        console.log("Compte supprimé (simulation)");
        alert('Compte supprimé');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <Settings className="inline-block w-10 h-10 mr-4 align-text-bottom" />
          {t('settings.title')}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          {t('settings.subtitle')}
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Section Apparence */}
        <SettingsSection title={t('settings.theme.title')} description={t('settings.theme.description')}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <span className="mr-3 text-gray-500 dark:text-gray-400"><Sun className="w-5 h-5" /></span>
              <span className="text-gray-700 dark:text-gray-300">{t('settings.theme.light')} / {t('settings.theme.dark')}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
              title={t('settings.theme.toggle')}
              aria-label={t('settings.theme.toggle')}
            >
              <span className={cn(
                'inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out bg-white rounded-full shadow-md',
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              )} />
              <span className={cn(
                'absolute inset-0 h-full w-full rounded-full bg-gray-300 dark:bg-blue-600 transition-colors duration-200 ease-in-out'
              )}></span>
            </button>
          </div>
        </SettingsSection>

        {/* Section Langue */}
        <SettingsSection title={t('settings.language.title')} description={t('settings.language.description')}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <span className="mr-3 text-gray-500 dark:text-gray-400"><Globe className="w-5 h-5" /></span>
              <span className="text-gray-700 dark:text-gray-300">{t('settings.language.english')} / {t('settings.language.french')}</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setLanguage('en')} className={cn('px-4 py-2 rounded-md text-sm font-medium', language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200')} aria-label="Set language to English">EN</button>
              <button onClick={() => setLanguage('fr')} className={cn('px-4 py-2 rounded-md text-sm font-medium', language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200')} aria-label="Set language to French">FR</button>
            </div>
          </div>
        </SettingsSection>

        {/* Section Notifications */}
        <SettingsSection title={t('settings.notifications.title')} description={t('settings.notifications.description')}>
          <ToggleSetting icon={<Bell className="w-5 h-5" />} label={t('settings.notifications.courses')} checked={notifications.courses} onChange={() => handleNotificationChange('courses')} />
          <ToggleSetting icon={<Bell className="w-5 h-5" />} label={t('settings.notifications.achievements')} checked={notifications.achievements} onChange={() => handleNotificationChange('achievements')} />
          <ToggleSetting icon={<Bell className="w-5 h-5" />} label={t('settings.notifications.reminders')} checked={notifications.reminders} onChange={() => handleNotificationChange('reminders')} />
          <ToggleSetting icon={<Bell className="w-5 h-5" />} label={t('settings.notifications.marketing')} checked={notifications.marketing} onChange={() => handleNotificationChange('marketing')} />
        </SettingsSection>

        {/* Section Audio */}
        <SettingsSection title={t('settings.sound.title')} description={t('settings.sound.description')}>
          <ToggleSetting icon={soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />} label={t('settings.sound.enabled')} checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
        </SettingsSection>

        {/* Section Confidentialité */}
        <SettingsSection title={t('settings.privacy.title')} description={t('settings.privacy.description')}>
          <ToggleSetting icon={privacy.profilePublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />} label={t('settings.privacy.profilePublic')} checked={privacy.profilePublic} onChange={() => handlePrivacyChange('profilePublic')} />
          <ToggleSetting icon={privacy.progressVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />} label={t('settings.privacy.progressVisible')} checked={privacy.progressVisible} onChange={() => handlePrivacyChange('progressVisible')} />
          <ToggleSetting icon={privacy.analyticsEnabled ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />} label={t('settings.privacy.analyticsEnabled')} checked={privacy.analyticsEnabled} onChange={() => handlePrivacyChange('analyticsEnabled')} />
        </SettingsSection>

        {/* Section Compte */}
        <SettingsSection title={t('settings.account.title')} description={t('settings.account.description')}>
          <div className="space-y-4">
            <button onClick={handleExportData} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" aria-label="Export account data">
              <Download className="w-5 h-5 mr-2" />
              {t('settings.account.exportData')}
            </button>
            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-label="Delete account">
              <Trash2 className="w-5 h-5 mr-2" />
              {t('settings.account.deleteAccount')}
            </button>
          </div>
        </SettingsSection>

        {/* Bouton de sauvegarde flottant */}
        <div className="mt-12 text-center">
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-transform duration-200"
            aria-label="Save settings"
          >
            <Save className="inline-block w-5 h-5 mr-2" />
            {t('settings.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
