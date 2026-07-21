import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Siren,
  Mic,
  MicOff,
  Send,
  RotateCcw,
  AlertTriangle,
  ShieldPlus,
  FileText,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useSpeechRecognition, speechLang } from '@/hooks/use-speech-recognition';
import { useTypingEffect } from '@/hooks/use-typing-effect';
import { sendToLifelineAI, type AiResponse, type ChatMessage } from '@/lib/ai';
import { createReport } from '@/lib/api';
import { Disclaimer } from '@/components/Disclaimer';
import { RiskGauge, RiskBadge } from '@/components/RiskGauge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Turn = {
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean;
};

export function AssistantPage() {
  const { t, settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AiResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { supported: micSupported, listening, transcript, start, stop, setTranscript } =
    useSpeechRecognition(speechLang(settings.language));

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, thinking]);

  const callAI = async (history: ChatMessage[]) => {
    setThinking(true);
    setError(null);
    try {
      const res = await sendToLifelineAI(history, settings.language);
      setTurns((prev) => [...prev, { role: 'assistant', content: res.reply, typing: true }]);
      if (res.done) {
        setAssessment(res);
        if (user && res.report) {
          createReport(user.id, {
            patient: res.report.patient,
            symptoms: res.report.symptoms,
            risk_level: res.riskLevel ?? 'medium',
            first_aid_given: res.report.firstAidGiven,
            suggested_action: res.report.suggestedAction,
            location: null,
          }).catch(() => {
            /* non-fatal: report still shown in-session */
          });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('common.error');
      setError(msg);
    } finally {
      setThinking(false);
    }
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setTurns((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setTranscript('');
    const history: ChatMessage[] = [
      ...turns.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: trimmed },
    ];
    await callAI(history);
  };

  const startEmergency = () => {
    setStarted(true);
    setTurns([
      {
        role: 'assistant',
        content:
          settings.language === 'te'
            ? 'నమస్కారం, ఇది లైఫ్‌లైన్ AI. ఎమర్జెన్సీని వివరించండి — ఏమి జరుగుతోంది మరియు ఎవరికి సహాయం కావాలి?'
            : settings.language === 'hi'
            ? 'नमस्ते, यह लाइफलाइन AI है। इमरजेंसी का वर्णन करें — क्या हो रहा है और किसे मदद चाहिए?'
            : "Hello, this is Lifeline AI. Describe the emergency — what is happening and who needs help?",
        typing: true,
      },
    ]);
  };

  const reset = () => {
    setStarted(false);
    setTurns([]);
    setAssessment(null);
    setInput('');
    setError(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Siren className="h-6 w-6 text-primary" />
            {t('assistant.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('app.tagline')}</p>
        </div>
        {started && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            {t('assistant.reset')}
          </Button>
        )}
      </div>

      {!started ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="relative mb-8">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
            <button
              onClick={startEmergency}
              className="relative grid h-32 w-32 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
              aria-label={t('assistant.start')}
            >
              <Siren className="h-12 w-12" />
            </button>
          </div>
          <h2 className="text-xl font-semibold">{t('assistant.start')}</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">{t('home.cta.subtitle')}</p>
          <div className="mt-6 w-full max-w-md">
            <Disclaimer />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="flex h-[55vh] min-h-[420px] flex-col">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {turns.map((turn, i) => (
                <ChatBubble key={i} turn={turn} onDone={() => markTyped(i)} />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">{t('assistant.thinking')}</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 animate-thinking rounded-full bg-primary"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="border-t border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2"
              >
                {micSupported && settings.voiceEnabled && (
                  <Button
                    type="button"
                    size="icon"
                    variant={listening ? 'default' : 'outline'}
                    onClick={listening ? stop : start}
                    className={cn('shrink-0', listening && 'animate-pulse')}
                    aria-label={listening ? t('assistant.mic.on') : t('assistant.mic.off')}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? t('assistant.listening') : t('assistant.placeholder')}
                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-base outline-none ring-ring focus:ring-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || thinking}
                  className="h-11 w-11 shrink-0"
                  aria-label={t('assistant.send')}
                >
                  {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              {listening && (
                <p className="mt-2 px-2 text-xs text-primary">{t('assistant.listening')}</p>
              )}
            </div>
          </Card>

          {assessment && assessment.done && (
            <AssessmentPanel assessment={assessment} onReport={() => navigate('/report')} onHospitals={() => navigate('/hospitals')} />
          )}
        </div>
      )}
    </div>
  );

  function markTyped(index: number) {
    setTurns((prev) => prev.map((m, i) => (i === index ? { ...m, typing: false } : m)));
  }
}

function DoneHook({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    onDone();
  }, [onDone]);
  return null;
}

function ChatBubble({ turn, onDone }: { turn: Turn; onDone: () => void }) {
  const { displayed, done } = useTypingEffect(turn.typing ? turn.content : '');
  const isUser = turn.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-base shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground border border-border'
        )}
      >
        {turn.typing ? (
          <span>
            {displayed}
            {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-typing-cursor bg-current align-middle" />}
          </span>
        ) : (
          turn.content
        )}
        {turn.typing && done && onDone && <DoneHook onDone={onDone} />}
      </div>
    </div>
  );
}

function AssessmentPanel({
  assessment,
  onReport,
  onHospitals,
}: {
  assessment: AiResponse;
  onReport: () => void;
  onHospitals: () => void;
}) {
  const { t } = useSettings();
  const level = assessment.riskLevel ?? 'medium';

  return (
    <Card className="animate-fade-in-up border-primary/30">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <RiskGauge level={level} size={150} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{t('report.risk')}</span>
              <RiskBadge level={level} />
            </div>
            {assessment.firstAidSteps && assessment.firstAidSteps.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
                  <ShieldPlus className="h-4 w-4 text-primary" />
                  {t('home.feature.firstaid.title')}
                </h3>
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm">
                  {assessment.firstAidSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={onReport}>
                <FileText className="mr-1.5 h-4 w-4" />
                {t('assistant.viewReport')}
              </Button>
              <Button variant="outline" onClick={onHospitals}>
                <MapPin className="mr-1.5 h-4 w-4" />
                {t('assistant.findHospitals')}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Disclaimer />
        </div>
      </CardContent>
    </Card>
  );
}
