import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  HeartPulse,
  Home,
  Stethoscope,
  FileText,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  Info,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { t } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/assistant', label: t('nav.assistant'), icon: Stethoscope },
    { to: '/report', label: t('nav.report'), icon: FileText },
    { to: '/hospitals', label: t('nav.hospitals'), icon: MapPin },
    { to: '/contacts', label: t('nav.contacts'), icon: Phone },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="h-5 w-5 animate-heartbeat" />
          </span>
          <span className="text-lg tracking-tight">{t('app.name')}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" />
              {t('nav.logout')}
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">
                <LogIn className="mr-1.5 h-4 w-4" />
                {t('nav.login')}
              </Link>
            </Button>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden animate-fade-in">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <l.icon className="h-5 w-5" />
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              {user ? (
                <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-5 w-5" />
                  {t('nav.logout')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    navigate('/auth');
                  }}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {t('nav.login')}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
      {location.pathname === '/assistant' && (
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
    </header>
  );
}
