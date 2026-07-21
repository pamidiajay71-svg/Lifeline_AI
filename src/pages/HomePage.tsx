import { Link, useNavigate } from 'react-router-dom';
import {
  Siren, Mic, Activity, ShieldPlus, FileText, MapPin,
  ArrowRight, Play, HeartPulse, Clock,
  ChevronRight, Brain, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Disclaimer } from '@/components/Disclaimer';
import { RiskBadge } from '@/components/RiskGauge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const recentIconColor: Record<string, string> = {
    critical: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
    high: 'bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400',
    medium: 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400',
    low: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400',
  };

  const workflow = [
    { icon: Mic,        label: 'Describe Emergency', desc: 'Speak or type what is happening' },
    { icon: Brain,     label: 'AI Understands',     desc: 'Lifeline AI analyzes the situation' },
    { icon: Activity,  label: 'Risk Analysis',      desc: 'Estimates urgency level' },
    { icon: ShieldPlus,label: 'First Aid',           desc: 'Step-by-step guidance' },
    { icon: MapPin,     label: 'Hospital Recommend', desc: 'Find the nearest hospitals' },
    { icon: FileText,  label: 'Emergency Report',    desc: 'Structured printable report' },
  ];

  const recentSessions = [
    { title: 'Chest Pain',   risk: 'high' as const,     time: '2 mins ago',   icon: HeartPulse },
    { title: 'Fall Injury',  risk: 'low' as const,      time: 'Yesterday',    icon: Activity },
    { title: 'Snake Bite',   risk: 'critical' as const, time: '3 days ago',    icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-red-50 via-rose-50/50 to-white p-6 lg:p-10 dark:from-red-950/30 dark:via-rose-950/20 dark:to-surface">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm dark:bg-white/5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              AI-Powered Emergency Triage
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-5xl">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Emergency Triage
              </span> Assistant
            </h1>

            <p className="mt-3 text-sm text-muted-foreground lg:text-base">
              Get immediate AI guidance during emergencies using voice, multilingual conversations, and intelligent risk assessment.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-6 shadow-primary-lg" onClick={() => navigate('/assistant')}>
                <Siren className="mr-2 h-5 w-5" /> Start Emergency
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 bg-white/60 backdrop-blur-sm" onClick={() => navigate('/about')}>
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Voice-enabled</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Multilingual</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Real-time triage</span>
            </div>
          </div>

          {/* 3D-ish medical illustration */}
          <div className="relative hidden lg:block">
            <div className="relative h-64 w-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-rose-200/30 blur-2xl" />
              <div className="relative grid h-64 w-64 place-items-center rounded-[2.5rem] border border-white/40 bg-white/50 backdrop-blur-md shadow-card-hover">
                <div className="absolute inset-4 rounded-[2rem] border-2 border-dashed border-primary/20 animate-spin-slow" />
                <div className="relative text-center">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-dark shadow-primary-lg">
                    <HeartPulse className="h-12 w-12 text-white animate-heartbeat" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">Lifeline AI Engine</p>
                  <div className="mt-2 flex justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-primary/60 animate-wave"
                        style={{ height: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Voice Card ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border glass p-6 lg:p-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            {/* Mic with voice wave */}
            <div className="relative">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
              <button
                onClick={() => navigate('/assistant')}
                className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-primary-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Mic className="h-7 w-7" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Describe the emergency...</h2>
              <p className="text-sm text-muted-foreground">Tap the mic and speak naturally, or type your emergency</p>
              <div className="mt-2 flex items-center gap-2">
                {/* Voice wave bars */}
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-primary/50 animate-wave"
                      style={{ height: `${8 + Math.abs(3 - i) * 4}px`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">Listening...</span>
              </div>
            </div>
          </div>

          {/* Supported languages */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Supported:</span>
            {['English', 'తెలుగు', 'हिन्दी', 'தமிழ்'].map((lang) => (
              <span key={lang} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency Workflow Timeline ────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">How it works</h2>
          <span className="text-xs text-muted-foreground">Emergency workflow</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {workflow.map((step, i) => (
            <div
              key={step.label}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center card-hover animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-semibold leading-tight">{step.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{step.desc}</p>
              {i < workflow.length - 1 && (
                <ChevronRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Two-column: Recent Sessions + Report Preview ──────────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent sessions */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Emergency Sessions</h2>
            <Link to="/report" className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {recentSessions.map((s, i) => (
              <div
                key={s.title}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 card-hover animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={cn('grid h-10 w-10 place-items-center rounded-xl', recentIconColor[s.risk])}>
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.time}
                  </p>
                </div>
                <RiskBadge level={s.risk} />
              </div>
            ))}
            {!user && (
              <p className="px-2 text-xs text-muted-foreground">Sign in to save and view your real emergency sessions.</p>
            )}
          </div>
        </div>

        {/* Report preview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Emergency Report</h2>
            <Link to="/report" className="text-xs font-medium text-primary hover:underline">Open</Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 card-hover">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
            <div className="relative flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-rose-100 text-primary dark:to-rose-900/20">
                <FileText className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Latest AI-generated report</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Structured patient, symptoms, risk, first aid, and suggested action.
                </p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">—</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk Level</span><RiskBadge level="medium" /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">—</span></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => navigate('/report')}>
                    View Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/report')}>
                    <FileText className="mr-1 h-3.5 w-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* First Aid learning card */}
          <div className="mt-3 relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-yellow-950/10">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ShieldPlus className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Learn Life-Saving First Aid</p>
                <p className="text-xs text-muted-foreground">Explore guides for common emergencies</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/firstaid')}>
                Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer banner ──────────────────────────────────────── */}
      <Disclaimer className="rounded-2xl" />
    </div>
  );
}
