import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HeartPulse, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function AuthPage() {
  const { t } = useSettings();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      toast({ title: t('common.error'), description: result.error, variant: 'destructive' });
      return;
    }
    if (mode === 'signup') {
      // Supabase with email confirmation off auto-signs in; still confirm.
      toast({ title: t('auth.signup'), description: email });
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <HeartPulse className="h-7 w-7 animate-heartbeat" />
        </span>
        <h1 className="text-2xl font-bold">
          {mode === 'signin' ? t('auth.signin') : t('auth.signup')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'signin' ? t('auth.signinDesc') : t('auth.signupDesc')}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' ? t('auth.signin') : t('auth.signup')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === 'signin' ? (
              <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                {t('auth.noAccount')}
              </button>
            ) : (
              <button onClick={() => setMode('signin')} className="text-primary hover:underline">
                {t('auth.haveAccount')}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">{t('nav.home')}</Link>
      </p>
    </div>
  );
}
