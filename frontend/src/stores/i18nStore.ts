import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from '../i18n/translations';

interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// Function to get nested translation
const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] ? current[key] : path;
  }, obj);
};

// Function to replace parameters in translation
const replaceParams = (text: string, params?: Record<string, string>): string => {
  if (!params) return text;
  
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }, text);
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'en', // Default to English for the jury
      setLanguage: (language: Language) => {
        set({ language });
        // Force re-render by triggering a state change
        console.log('Language changed to:', language);
      },
      t: (key: string, params?: Record<string, string>) => {
        const { language } = get();
        const translation = getNestedTranslation(translations[language], key);
        return replaceParams(translation, params);
      },
    }),
    {
      name: 'i18n-storage',
      onRehydrateStorage: () => (state) => {
        console.log('i18n store rehydrated:', state);
        console.log('Language after rehydration:', state?.language || 'undefined');
      },
    }
  )
);

export default useI18nStore;
