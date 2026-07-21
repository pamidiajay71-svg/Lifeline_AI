import { useEffect, useState } from 'react';
import { MapPin, Phone, Navigation, RefreshCw, Search, Loader2, Hospital } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type HospitalResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string | null;
  travelTime: string | null;
  phone: string | null;
  mapsUrl: string;
};

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nearby-hospitals`;

export function HospitalsPage() {
  const { t } = useSettings();
  const [status, setStatus] = useState<'idle' | 'locating' | 'loading' | 'denied' | 'error' | 'done'>('idle');
  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  const searchByCoords = async (lat: number, lng: number) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ lat, lng }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setHospitals(data.formatted ?? data.hospitals ?? []);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
      setStatus('error');
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => searchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setStatus('loading');
    setError(null);
    try {
      // Free Nominatim geocoding fallback (no key required).
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (!r.ok) throw new Error('Geocoding failed');
      const j = await r.json();
      if (!j || j.length === 0) {
        setError('Address not found.');
        setStatus('error');
        return;
      }
      await searchByCoords(parseFloat(j[0].lat), parseFloat(j[0].lon));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
      setStatus('error');
    }
  };

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title={t('hospitals.title')}
        icon={<MapPin className="h-7 w-7 text-primary" />}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={searchAddress} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('hospitals.searchPlaceholder')}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="mr-1.5 h-4 w-4" />
              {t('hospitals.search')}
            </Button>
            <Button type="button" onClick={locate} variant="outline">
              <Navigation className="mr-1.5 h-4 w-4" />
              GPS
            </Button>
          </form>
        </CardContent>
      </Card>

      {status === 'locating' && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t('hospitals.locating')}
        </div>
      )}

      {status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))}
        </div>
      )}

      {status === 'denied' && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{t('hospitals.denied')}</p>
            <Button className="mt-4" onClick={locate}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              {t('hospitals.retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card>
          <CardContent className="p-8 text-center text-destructive">
            {error}
            <div className="mt-4">
              <Button variant="outline" onClick={locate}>
                <RefreshCw className="mr-1.5 h-4 w-4" />
                {t('hospitals.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'done' && hospitals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {t('hospitals.empty')}
          </CardContent>
        </Card>
      )}

      {status === 'done' && hospitals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h, i) => (
            <Card
              key={`${h.name}-${i}`}
              className="group transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              style={{ animation: `fade-in-up 0.4s ease-out ${i * 50}ms both` }}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-3 flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Hospital className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{h.name}</h3>
                    <p className="truncate text-sm text-muted-foreground">{h.address}</p>
                  </div>
                </div>

                <div className="mb-4 mt-1 flex gap-4 text-sm text-muted-foreground">
                  {h.distance && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {h.distance}
                    </span>
                  )}
                  {h.travelTime && (
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3.5 w-3.5" />
                      {h.travelTime}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <a href={h.mapsUrl} target="_blank" rel="noreferrer">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      {t('hospitals.openMaps')}
                    </a>
                  </Button>
                  {h.phone && (
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${h.phone}`}>
                        <Phone className="h-3.5 w-3.5" />
                        {t('hospitals.call')}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
