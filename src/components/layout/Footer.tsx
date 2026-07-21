import { Link } from 'react-router-dom';
import { HeartPulse, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export function Footer() {
  const { t } = useSettings();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="h-4 w-4" />
              </span>
              {t('app.name')}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t('app.tagline')}</p>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {t('about.notDoctor')}
            </div>
            <p className="mt-1 text-destructive/80">{t('home.disclaimer')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {t('app.name')}. Built for safer emergencies.</p>
          <nav className="flex gap-4">
            <Link to="/about" className="hover:text-foreground">{t('nav.about')}</Link>
            <Link to="/settings" className="hover:text-foreground">{t('nav.settings')}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
