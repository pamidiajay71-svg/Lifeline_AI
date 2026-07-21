import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { translate, type Language } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';

type Settings = {
  language: Language;
  voiceEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  voiceEnabled: true,
  highContrast: false,
  largeText: false,
};

type SettingsContextValue = {
  settings: Settings;
  setLanguage: (l: Language) => void;
  setVoiceEnabled: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  t: (key: string) => string;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = 'lifeline-settings';

function loadLocal(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocal(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(loadLocal);

  // Apply accessibility classes to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
  }, [settings.highContrast, settings.largeText]);

  // Load persisted settings when user changes.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('language, voice_enabled, high_contrast, large_text')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setSettings({
          language: data.language as Language,
          voiceEnabled: data.voice_enabled,
          highContrast: data.high_contrast,
          largeText: data.large_text,
        });
      }
    })();
  }, [user]);

  const persist = useCallback(
    async (next: Settings) => {
      setSettings(next);
      saveLocal(next);
      if (user) {
        await supabase.from('user_settings').upsert(
          {
            user_id: user.id,
            language: next.language,
            voice_enabled: next.voiceEnabled,
            high_contrast: next.highContrast,
            large_text: next.largeText,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    },
    [user]
  );

  const setLanguage = (l: Language) => persist({ ...settings, language: l });
  const setVoiceEnabled = (v: boolean) => persist({ ...settings, voiceEnabled: v });
  const setHighContrast = (v: boolean) => persist({ ...settings, highContrast: v });
  const setLargeText = (v: boolean) => persist({ ...settings, largeText: v });

  const t = (key: string) => translate(settings.language, key);

  return (
    <SettingsContext.Provider
      value={{ settings, setLanguage, setVoiceEnabled, setHighContrast, setLargeText, t }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
