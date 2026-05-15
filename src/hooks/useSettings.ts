import { useState, useEffect } from 'react';

export interface AppSettings {
  appName: string;
  teacherName: string;
}

const STORAGE_KEY = 'interactive_aula_settings';

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'AULA ACTIVA',
  teacherName: 'Prof. Martínez',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { settings, updateSettings };
}
