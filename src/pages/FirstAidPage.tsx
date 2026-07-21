import { useState } from 'react';
import {
  ShieldPlus, HeartPulse, Activity, Flame, Bone, Bug, Droplet, Sun, Brain,
  Search, ChevronDown, AlertTriangle, Phone,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Guide = {
  id: string;
  title: string;
  icon: typeof HeartPulse;
  color: string;
  bg: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
  warning?: string;
};

const GUIDES: Guide[] = [
  {
    id: 'cpr',
    title: 'CPR (Not Breathing)',
    icon: HeartPulse,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    severity: 'critical',
    steps: [
      'Call your local emergency number immediately.',
      'Place the person flat on their back on a firm surface.',
      'Place the heel of one hand on the center of the chest, other hand on top.',
      'Push hard and fast — 100 to 120 compressions per minute.',
      'Continue until help arrives or the person starts breathing.',
    ],
    warning: 'Only perform CPR if the person is not breathing and has no pulse.',
  },
  {
    id: 'choking',
    title: 'Choking',
    icon: Activity,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    severity: 'critical',
    steps: [
      'Ask: "Are you choking?" If they cannot speak or cough, act immediately.',
      'Stand behind the person and wrap arms around their waist.',
      'Make a fist above the navel, grasp with other hand.',
      'Give 5 sharp upward abdominal thrusts (Heimlich maneuver).',
      'Repeat until the object is expelled or help arrives.',
    ],
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    icon: Droplet,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    severity: 'high',
    steps: [
      'Call your local emergency number for severe bleeding.',
      'Apply firm, direct pressure with a clean cloth.',
      'Keep pressure steady — do not lift to check.',
      'If possible, raise the wound above heart level.',
      'Do not remove embedded objects — press around them.',
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    icon: Flame,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    severity: 'medium',
    steps: [
      'Cool the burn with running cool water for at least 10 minutes.',
      'Do not apply ice, butter, or any creams.',
      'Remove jewellery or tight clothing before swelling starts.',
      'Cover loosely with a clean, non-stick dressing.',
      'Seek medical help for large, deep, or facial burns.',
    ],
  },
  {
    id: 'fractures',
    title: 'Fractures & Broken Bones',
    icon: Bone,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    severity: 'high',
    steps: [
      'Keep the person still and support the injured area.',
      'Do not try to move or straighten the bone.',
      'Immobilise with a makeshift splint if trained.',
      'Apply a cold pack wrapped in cloth to reduce swelling.',
      'Seek medical attention.',
    ],
  },
  {
    id: 'snakebite',
    title: 'Snake Bite',
    icon: Bug,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    severity: 'high',
    steps: [
      'Move away from the snake and stay calm.',
      'Keep the bitten limb still and below heart level.',
      'Remove rings, watches, and tight clothing near the bite.',
      'Do not cut the wound, suck venom, or apply a tourniquet.',
      'Get to a hospital with antivenom as soon as possible.',
    ],
    warning: 'Do not apply ice or tourniquet — these can cause more harm.',
  },
  {
    id: 'heatstroke',
    title: 'Heat Stroke',
    icon: Sun,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    severity: 'high',
    steps: [
      'Move the person to a cool, shaded area.',
      'Remove excess clothing and loosen tight garments.',
      'Cool with water, fans, or ice packs on neck, armpits, groin.',
      'Do not give fluids if the person is unconscious.',
      'Seek emergency medical help immediately.',
    ],
  },
  {
    id: 'seizure',
    title: 'Seizure',
    icon: Brain,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    severity: 'high',
    steps: [
      'Clear the area of hard or sharp objects.',
      'Do not restrain the person or put anything in their mouth.',
      'Gently roll them onto their side once jerking stops.',
      'Stay with them until fully alert.',
      'Call emergency services if it lasts over 5 minutes or repeats.',
    ],
  },
];

export function FirstAidPage() {
  const { t } = useSettings();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('cpr');

  const filtered = GUIDES.filter((g) =>
    g.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title={t('nav.firstaid')}
        subtitle="Evidence-based first-aid guides for common emergencies"
        icon={<ShieldPlus className="h-7 w-7 text-primary" />}
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search first aid guides..."
          className="h-11 pl-9"
        />
      </div>

      {/* Guide grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((g, i) => {
          const open = openId === g.id;
          return (
            <Card
              key={g.id}
              className={cn('overflow-hidden border-border card-hover animate-fade-up', open && 'ring-2 ring-primary/30')}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <button
                onClick={() => setOpenId(open ? null : g.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className={cn('grid h-11 w-11 place-items-center rounded-xl', g.bg, g.color)}>
                  <g.icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{g.title}</p>
                  <span className={cn('text-[10px] font-medium', `text-risk-${g.severity}`)}>
                    {t(`risk.${g.severity}`)} severity
                  </span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <CardContent className="border-t border-border pt-4 animate-fade-in">
                  <ol className="space-y-2">
                    {g.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {g.warning && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{g.warning}</span>
                    </div>
                  )}
                  <a
                    href="tel:108"
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:brightness-105"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Emergency
                  </a>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No guides match "{query}".
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-red-200/50 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">Disclaimer:</span> These guides are for general awareness only and are not a substitute for professional medical training or advice.
        </p>
      </div>
    </div>
  );
}
