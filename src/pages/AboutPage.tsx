import { Info, AlertTriangle, Stethoscope, Phone, HeartPulse } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { PageHeader } from '@/components/PageHeader';
import { Disclaimer } from '@/components/Disclaimer';
import { Card, CardContent } from '@/components/ui/card';

export function AboutPage() {
  const { t } = useSettings();

  const emergencyNumbers = [
    { country: 'India', ambulance: '108 / 102', police: '100', general: '112' },
    { country: 'USA / Canada', ambulance: '911', police: '911', general: '911' },
    { country: 'UK', ambulance: '999 / 112', police: '999', general: '999' },
    { country: 'EU', ambulance: '112', police: '112', general: '112' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title={t('about.title')} icon={<Info className="h-7 w-7 text-primary" />} />

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-primary" />
              {t('about.problem')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('about.problem.desc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <HeartPulse className="h-5 w-5 text-primary" />
              {t('about.solution')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('about.solution.desc')}</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-destructive">
              <Stethoscope className="h-5 w-5" />
              {t('about.notDoctor')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('about.notDoctor.desc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5 text-primary" />
              {t('about.numbers')}
            </h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Region</th>
                    <th className="px-3 py-2 text-left font-medium">Ambulance</th>
                    <th className="px-3 py-2 text-left font-medium">Police</th>
                    <th className="px-3 py-2 text-left font-medium">General</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyNumbers.map((n) => (
                    <tr key={n.country} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{n.country}</td>
                      <td className="px-3 py-2">
                        <a href={`tel:${n.ambulance.split(' ')[0]}`} className="text-primary hover:underline">
                          {n.ambulance}
                        </a>
                      </td>
                      <td className="px-3 py-2">{n.police}</td>
                      <td className="px-3 py-2">{n.general}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Disclaimer />
      </div>
    </div>
  );
}
