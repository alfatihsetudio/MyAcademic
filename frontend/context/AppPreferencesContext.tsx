'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, SupportedTheme, getTranslation } from '@/lib/i18n';
import { fetchStudentSettingsOverview, updateStudentPreferences } from '@/lib/api';

interface AppPreferencesContextType {
  theme: SupportedTheme;
  setTheme: (theme: SupportedTheme) => Promise<void>;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const AppPreferencesContext = createContext<AppPreferencesContextType>({
  theme: 'formal',
  setTheme: async () => {},
  language: 'id',
  setLanguage: async () => {},
  dir: 'ltr',
  t: (key: string) => key,
});

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SupportedTheme>('formal');
  const [language, setLanguageState] = useState<SupportedLanguage>('id');
  const [mounted, setMounted] = useState(false);

  // Apply theme class to document body
  const applyThemeToDOM = useCallback((newTheme: SupportedTheme) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-formal', 'theme-glass', 'theme-midnight');
      document.body.classList.add(`theme-${newTheme}`);
    }
  }, []);

  // Apply language and dir attribute to html document
  const applyLanguageToDOM = useCallback((newLang: SupportedLanguage) => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const isRtl = newLang === 'ar';
      html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      html.setAttribute('lang', newLang);
    }
  }, []);

  // Initialize from localStorage and optionally sync from API
  useEffect(() => {
    setMounted(true);
    let initialTheme: SupportedTheme = 'formal';
    let initialLang: SupportedLanguage = 'id';

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ma_theme') as SupportedTheme | null;
      if (savedTheme && ['formal', 'glass', 'midnight'].includes(savedTheme)) {
        initialTheme = savedTheme;
      }
      const savedLang = localStorage.getItem('ma_lang') as SupportedLanguage | null;
      if (savedLang && ['id', 'en', 'zh', 'ja', 'ar'].includes(savedLang)) {
        initialLang = savedLang;
      }
    }

    setThemeState(initialTheme);
    setLanguageState(initialLang);
    applyThemeToDOM(initialTheme);
    applyLanguageToDOM(initialLang);

    // Asynchronously try to fetch preferences if user is logged in
    fetchStudentSettingsOverview()
      .then((data) => {
        if (data && data.success && data.preferences) {
          if (data.preferences.theme && ['formal', 'glass', 'midnight'].includes(data.preferences.theme)) {
            const apiTheme = data.preferences.theme as SupportedTheme;
            setThemeState(apiTheme);
            applyThemeToDOM(apiTheme);
            localStorage.setItem('ma_theme', apiTheme);
          }
          if (data.preferences.language && ['id', 'en', 'zh', 'ja', 'ar'].includes(data.preferences.language)) {
            const apiLang = data.preferences.language as SupportedLanguage;
            setLanguageState(apiLang);
            applyLanguageToDOM(apiLang);
            localStorage.setItem('ma_lang', apiLang);
          }
        }
      })
      .catch(() => {
        // Fallback to local storage values silently
      });
  }, [applyThemeToDOM, applyLanguageToDOM]);

  const setTheme = async (newTheme: SupportedTheme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ma_theme', newTheme);
    }
    try {
      await updateStudentPreferences({ theme: newTheme });
    } catch {
      // Non-blocking
    }
  };

  const setLanguage = async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    applyLanguageToDOM(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ma_lang', newLang);
    }
    try {
      await updateStudentPreferences({ language: newLang });
    } catch {
      // Non-blocking
    }
  };

  const t = useCallback(
    (key: string) => {
      return getTranslation(key, language);
    },
    [language]
  );

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <AppPreferencesContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        dir,
        t,
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  return useContext(AppPreferencesContext);
}
