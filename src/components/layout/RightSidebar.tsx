import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, MapPin, Users, ShieldPlus, HeartPulse, Navigation, Activity } from 'lucide-react';

export function RightSidebar() {
  const navigate = useNavigate();

  const quickActions = [
    { icon: Phone,       label: 'Call Ambulance',    color: 'text-primary',  bg: 'bg-red-50 dark:bg-red-950/30',     action: () => window.open('tel:108') },
    { icon: MapPin,      label: 'Share Location',     color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30',  action: () => navigate('/contacts') },
    { icon: Users,       label: 'Emergency Contacts',  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', action: () => navigate('/contacts') },
    { icon: ShieldPlus,  label: 'First Aid',          color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', action: () => navigate('/firstaid') },
  ];

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Safety Status */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-green-50 p-4 dark:border-emerald-800/30 dark:from-emerald-950/30 dark:to-green-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Safety Status</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Safe
            </p>
          </div>
          <div className="relative">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400/30" />
            <div className="relative grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10">
              <HeartPulse className="h-5 w-5 text-emerald-500 animate-heartbeat" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-emerald-500" /> HR 72 bpm</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-500" /> Located</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${a.bg} ${a.color}`}>
                <a.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mini hospitals preview */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nearby Hospitals
          </p>
          <button onClick={() => navigate('/hospitals')} className="text-[10px] font-medium text-primary hover:underline">
            View all
          </button>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5 card-hover">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-primary dark:bg-red-950/30">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">City Hospital {i}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-2.5 w-2.5" /> {(i * 1.2).toFixed(1)} km · {i * 3} min
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto rounded-xl border border-red-200/50 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-primary">Disclaimer:</span> Lifeline AI assists users during emergencies but does not replace professional medical advice.
        </p>
      </div>
    </aside>
  );
}
