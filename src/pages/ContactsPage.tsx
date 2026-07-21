import { useEffect, useState } from 'react';
import { Phone, Plus, Pencil, Trash2, MapPin, Share2, Users, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/layout/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listReports } from '@/lib/api';
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from '@/lib/api';
import type { EmergencyContact, EmergencyReport } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const RELATIONSHIPS = ['Family', 'Friend', 'Doctor'] as const;

export function ContactsPage() {
  return (
    <ProtectedRoute>
      <ContactsInner />
    </ProtectedRoute>
  );
}

function ContactsInner() {
  const { t } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState({ name: '', relationship: 'Family', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [c, r] = await Promise.all([
          listContacts(user.id),
          listReports(user.id).catch(() => [] as EmergencyReport[]),
        ]);
        setContacts(c);
        setReports(r);
      } catch (e) {
        toast({ title: t('common.error'), description: e instanceof Error ? e.message : '', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t, toast]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', relationship: 'Family', phone: '' });
    setDialogOpen(true);
  };

  const openEdit = (c: EmergencyContact) => {
    setEditing(c);
    setForm({ name: c.name, relationship: c.relationship, phone: c.phone });
    setDialogOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateContact(editing.id, form);
        setContacts((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      } else {
        const created = await createContact(user.id, form);
        setContacts((prev) => [...prev, created]);
      }
      setDialogOpen(false);
      toast({ title: t('contacts.save') });
    } catch (e) {
      toast({ title: t('common.error'), description: e instanceof Error ? e.message : '', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: EmergencyContact) => {
    try {
      await deleteContact(c.id);
      setContacts((prev) => prev.filter((x) => x.id !== c.id));
      toast({ title: t('contacts.delete') });
    } catch (e) {
      toast({ title: t('common.error'), description: e instanceof Error ? e.message : '', variant: 'destructive' });
    }
  };

  const shareLocation = async (c: EmergencyContact) => {
    if (!navigator.geolocation) {
      toast({ title: t('common.error'), description: 'Geolocation not supported', variant: 'destructive' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const text = `${t('app.name')}: I'm sharing my location. ${mapsLink}`;
        const url = `sms:${c.phone}?body=${encodeURIComponent(text)}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: t('app.name'), text, url: mapsLink });
          } else {
            window.open(url, '_blank');
          }
        } catch {
          window.open(url, '_blank');
        }
      },
      () => toast({ title: t('common.error'), description: t('hospitals.denied'), variant: 'destructive' }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const shareReport = async (c: EmergencyContact) => {
    const r = reports[0];
    if (!r) {
      toast({ title: t('report.empty') });
      return;
    }
    const text = `${t('app.name')} ${t('report.title')}\n${t('report.risk')}: ${t(`risk.${r.risk_level}`)}\n${t('report.symptoms')}: ${r.symptoms ?? '-'}\n${t('report.action')}: ${r.suggested_action ?? '-'}`;
    const url = `sms:${c.phone}?body=${encodeURIComponent(text)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t('app.name'), text });
      } else {
        window.open(url, '_blank');
      }
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={t('contacts.title')}
          icon={<Users className="h-7 w-7 text-primary" />}
          className="mb-0"
        />
        <Button onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          {t('contacts.add')}
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            {t('contacts.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c, i) => (
            <Card
              key={c.id}
              className="group transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              style={{ animation: `fade-in-up 0.4s ease-out ${i * 50}ms both` }}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`contacts.rel.${c.relationship.toLowerCase()}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)} aria-label={t('contacts.edit')}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c)} aria-label={t('contacts.delete')}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <a href={`tel:${c.phone}`} className="block text-sm font-medium text-primary hover:underline">
                  {c.phone}
                </a>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => shareLocation(c)}>
                    <MapPin className="mr-1.5 h-3.5 w-3.5" />
                    {t('contacts.shareLocation')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareReport(c)}>
                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                    {t('contacts.shareReport')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('contacts.edit') : t('contacts.add')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('contacts.name')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('contacts.relationship')}</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) => setForm((f) => ({ ...f, relationship: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`contacts.rel.${r.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('contacts.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('contacts.cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {t('contacts.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
