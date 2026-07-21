import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Printer, Share2, ArrowLeft, MapPin, Clock, User, Activity, ShieldPlus, Lightbulb } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { listReports, getReport } from '@/lib/api';
import type { EmergencyReport } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { Disclaimer } from '@/components/Disclaimer';
import { RiskBadge } from '@/components/RiskGauge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ReportPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [selected, setSelected] = useState<EmergencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await listReports(user.id);
        setReports(data);
        if (data.length > 0) setSelected(data[0]);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t]);

  const share = async (r: EmergencyReport) => {
    const text = `${t('report.title')} — ${new Date(r.created_at).toLocaleString()}\n${t('report.risk')}: ${t(`risk.${r.risk_level}`)}\n${t('report.symptoms')}: ${r.symptoms ?? '-'}\n${t('report.action')}: ${r.suggested_action ?? '-'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t('app.name'), text });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageHeader title={t('report.title')} icon={<FileText className="h-7 w-7 text-primary" />} />
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('report.empty')}
          </CardContent>
        </Card>
        <div className="mt-6">
          <Disclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={t('report.title')}
          icon={<FileText className="h-7 w-7 text-primary" />}
          className="mb-0"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      ) : error ? (
        <Card><CardContent className="p-6 text-destructive">{error}</CardContent></Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('report.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {reports.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={async () => {
                    const full = await getReport(r.id);
                    if (full) setSelected(full);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selected?.id === r.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {new Date(r.created_at).toLocaleString()}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <Card className="print-area border-primary/20">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold">{t('app.name')}</h2>
                    <p className="text-sm text-muted-foreground">{t('report.title')}</p>
                  </div>
                  <RiskBadge level={selected.risk_level} />
                </div>

                <dl className="space-y-4">
                  <Field icon={<User className="h-4 w-4" />} label={t('report.patient')} value={selected.patient} />
                  <Field icon={<Activity className="h-4 w-4" />} label={t('report.symptoms')} value={selected.symptoms} />
                  <Field icon={<ShieldPlus className="h-4 w-4" />} label={t('report.firstAid')} value={selected.first_aid_given} />
                  <Field icon={<Lightbulb className="h-4 w-4" />} label={t('report.action')} value={selected.suggested_action} />
                  <Field icon={<MapPin className="h-4 w-4" />} label={t('report.location')} value={selected.location} />
                  <Field icon={<Clock className="h-4 w-4" />} label={t('report.time')} value={new Date(selected.created_at).toLocaleString()} />
                </dl>

                <div className="mt-6 no-print flex flex-wrap gap-2">
                  <Button onClick={() => window.print()}>
                    <Printer className="mr-1.5 h-4 w-4" />
                    {t('report.print')}
                  </Button>
                  <Button variant="outline" onClick={() => share(selected)}>
                    <Share2 className="mr-1.5 h-4 w-4" />
                    {t('report.share')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/assistant')}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    {t('report.back')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Disclaimer />
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="sm:col-span-2 text-sm">{value || '—'}</dd>
    </div>
  );
}
