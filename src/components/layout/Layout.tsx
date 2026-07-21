import { Outlet, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightSidebar } from './RightSidebar';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, Home, Stethoscope, MapPin, Phone, Siren, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop left sidebar */}
      <div className="hidden w-[240px] shrink-0 border-r border-border lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileSidebar(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] shadow-2xl animate-slide-left">
            <button
              onClick={() => setMobileSidebar(false)}
              className="absolute -right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-surface border border-border shadow-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <Sidebar onNavigate={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileSidebar(true)} />
        <main key={location.pathname} className="flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
        {/* Mobile bottom nav */}
        <MobileBottomNav />
      </div>

      {/* Desktop right sidebar */}
      <div className="hidden w-[280px] shrink-0 border-l border-border bg-surface/50 xl:block">
        <RightSidebar />
      </div>

      {/* Floating SOS (mobile) */}
      <FloatingSOS />
    </div>
  );
}

function MobileBottomNav() {
  const items = [
    { to: '/',          icon: Home,        label: 'Home' },
    { to: '/assistant', icon: Stethoscope, label: 'AI' },
    { to: '/hospitals', icon: MapPin,      label: 'Hospitals' },
    { to: '/contacts',  icon: Phone,       label: 'Contacts' },
  ];
  return (
    <nav className="flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md px-2 py-1.5 lg:hidden">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <i.icon className="h-5 w-5" />
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}

function FloatingSOS() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/assistant')}
      className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-primary-lg lg:hidden active:scale-95 transition-transform"
      aria-label="Emergency SOS"
    >
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
      <Siren className="relative h-6 w-6" />
    </button>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useSettings();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">{t('common.loading')}</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold">{t('contacts.signin')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('settings.signin')}</p>
        <Button asChild className="mt-6">
          <Link to="/auth" state={{ from: location.pathname }}>{t('nav.login')}</Link>
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
