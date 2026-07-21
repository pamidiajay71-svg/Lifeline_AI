import type { RiskLevel } from '@/lib/supabase';
import type { Language } from '@/lib/i18n';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type AiResponse = {
  reply: string;
  followUpQuestion: string | null;
  riskLevel: RiskLevel | null;
  firstAidSteps: string[] | null;
  done: boolean;
  report: {
    patient: string | null;
    symptoms: string | null;
    riskLevel: RiskLevel | null;
    firstAidGiven: string | null;
    suggestedAction: string | null;
  } | null;
};

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lifeline-ai`;

export async function sendToLifelineAI(
  messages: ChatMessage[],
  language: Language
): Promise<AiResponse> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, language }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error ?? j?.detail ?? '';
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  if (!data || typeof data.reply !== 'string') {
    throw new Error('Unexpected response from AI service.');
  }
  return data as AiResponse;
}
