import { Settings as SettingsIcon, Languages, Mic, Contrast, Type } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { LANGUAGES, type Language } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { t, settings, setLanguage, setVoiceEnabled, setHighContrast, setLargeText } = useSettings();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader title={t('settings.title')} icon={<SettingsIcon className="h-7 w-7 text-primary" />} />

      {!user && (
        <p className="mb-6 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {t('settings.signin')}
        </p>
      )}

      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Languages className="h-5 w-5" />
              </span>
              <div>
                <Label className="text-base font-medium">{t('settings.language')}</Label>
                <p className="text-sm text-muted-foreground">English · తెలుగు · हिन्दी</p>
              </div>
            </div>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    settings.language === l.code
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <ToggleRow
          icon={<Mic className="h-5 w-5" />}
          label={t('settings.voice')}
          checked={settings.voiceEnabled}
          onChange={setVoiceEnabled}
        />
        <ToggleRow
          icon={<Contrast className="h-5 w-5" />}
          label={t('settings.highContrast')}
          checked={settings.highContrast}
          onChange={setHighContrast}
        />
        <ToggleRow
          icon={<Type className="h-5 w-5" />}
          label={t('settings.largeText')}
          checked={settings.largeText}
          onChange={setLargeText}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
          <Label className="text-base font-medium">{label}</Label>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </CardContent>
    </Card>
  );
}
