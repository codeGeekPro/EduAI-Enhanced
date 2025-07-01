import { Globe, Languages } from 'lucide-react';
import { useI18nStore } from '../../stores/i18nStore';
import { Language } from '../../i18n/translations';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18nStore();

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 border border-border">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 py-2 w-48 bg-card border border-border rounded-lg shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-secondary transition-colors ${
              language === lang.code ? 'bg-primary/10 text-primary' : 'text-card-foreground'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
