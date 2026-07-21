import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Input } from '@/components/ui/input';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const greetingName = user?.email?.split('@')[0] ?? 'Guest';
  const capName = greetingName.charAt(0).toUpperCase() + greetingName.slice(1);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 backdrop-blur-md px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold leading-tight">
          {greeting}, {capName} <span className="inline-block animate-fade-in">👋</span>
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Search */}
      <div className="ml-auto hidden md:flex max-w-sm flex-1">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search emergencies, guides, contacts..."
            className="h-9 border-border bg-muted/50 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="ml-auto md:ml-3 flex items-center gap-2">
        <button
          onClick={() => setDark((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border p-1 pr-2 hover:bg-muted transition-colors"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-white">
              {capName.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">{capName}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover animate-fade-up z-50">
              <div className="border-b border-border px-3 py-2">
                <p className="text-xs font-semibold truncate">{user?.email ?? 'Guest user'}</p>
                <p className="text-[10px] text-muted-foreground">{user ? 'Signed in' : 'Not signed in'}</p>
              </div>
              {user ? (
                <button
                  onClick={async () => { await signOut(); setProfileOpen(false); navigate('/'); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t('nav.logout')}
                </button>
              ) : (
                <button
                  onClick={() => { setProfileOpen(false); navigate('/auth'); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
