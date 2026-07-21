import { NavLink, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  MapPin,
  Phone,
  ShieldPlus,
  FileText,
  Settings,
  Bell,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { LANGUAGES, type Language } from '@/lib/i18n';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, key: 'nav.home',       label: 'Dashboard' },
  { to: '/assistant',  icon: Stethoscope,     key: 'nav.assistant',  label: 'Emergency Assistant' },
  { to: '/hospitals',  icon: MapPin,          key: 'nav.hospitals',  label: 'Nearby Hospitals' },
  { to: '/contacts',   icon: Phone,           key: 'nav.contacts',   label: 'Emergency Contacts' },
  { to: '/firstaid',   icon: ShieldPlus,      key: 'nav.firstaid',   label: 'First Aid Guide' },
  { to: '/report',     icon: FileText,        key: 'nav.report',     label: 'Emergency Reports' },
  { to: '/settings',   icon: Settings,        key: 'nav.settings',   label: 'Settings' },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, settings, setLanguage } = useSettings();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-primary">
          <HeartPulse className="h-5 w-5 text-white animate-heartbeat" />
        </div>
        <div>
          <p className="text-[15px] font-bold leading-tight tracking-tight">
            Lifeline <span className="text-primary">AI</span>
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">AI Emergency Assistant</p>
        </div>
      </div>

      {/* Start Emergency CTA */}
      <div className="px-4 pt-4">
        <button
          onClick={() => { navigate('/assistant'); onNavigate?.(); }}
          className="group relative w-full overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-primary transition-all hover:shadow-primary-lg hover:brightness-105 active:scale-[0.98]"
        >
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="relative flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            Start Emergency
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                {t(item.key) || item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Language + SOS card */}
      <div className="border-t border-border px-4 py-4 space-y-3">
        {/* SOS Emergency card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 p-4 dark:from-red-950/40 dark:to-rose-900/30">
          <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/10" />
          <p className="text-xs font-semibold text-foreground">In an emergency?</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
            Share your location and get immediate help
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                <span>Share location</span>
              </div>
            </div>
            <button
              onClick={() => { navigate('/assistant'); onNavigate?.(); }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-primary"
            >
              <span className="absolute inset-0 rounded-full animate-pulse-ring bg-primary/40" />
              SOS
            </button>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              {LANGUAGES.find((l) => l.code === settings.language)?.native}
            </span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', langOpen && 'rotate-180')} />
          </button>
          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover animate-fade-up z-50">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code as Language); setLangOpen(false); }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors',
                    settings.language === l.code && 'text-primary font-semibold'
                  )}
                >
                  {l.native} <span className="text-muted-foreground">({l.label})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
