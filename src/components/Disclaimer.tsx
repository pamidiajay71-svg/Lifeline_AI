import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

export function Disclaimer({ className }: { className?: string }) {
  const { t } = useSettings();
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive',
        className
      )}
      role="note"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{t('assistant.disclaimer')}</span>
    </div>
  );
}
