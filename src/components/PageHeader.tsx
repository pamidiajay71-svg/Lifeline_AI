import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 animate-fade-up', className)}>
      <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight lg:text-3xl">
        {icon}
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
