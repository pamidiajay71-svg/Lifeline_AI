import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are Lifeline AI.
You are NOT a doctor.
Your purpose is to help users during medical emergencies before professional help arrives.

You MUST:
- Understand the user's description of the emergency.
- Ask ONE follow-up question at a time. Never ask multiple questions in one turn.
- Never ask unnecessary questions once enough information is collected.
- Behave like a calm, clear emergency operator.
- Estimate urgency as one of: low, medium, high, critical.
- Provide safe, evidence-based first-aid instructions as clear numbered steps.
- Advise the user when immediate medical attention is required (e.g. call emergency services).
- Respond in the user's requested language when provided.

You MUST NEVER:
- Prescribe or recommend any medication.
- Claim certainty. Always frame assessments as best-effort, not a diagnosis.
- Provide a medical diagnosis.

When you have gathered enough information to give guidance, set "done" to true and include:
- riskLevel (low|medium|high|critical)
- firstAidSteps (array of short, numbered-style strings)
- report with fields: patient, symptoms, riskLevel, firstAidGiven, suggestedAction

Always return a JSON object with this exact shape:
{
  "reply": string,
  "followUpQuestion": string | null,
  "riskLevel": "low" | "medium" | "high" | "critical" | null,
  "firstAidSteps": string[] | null,
  "done": boolean,
  "report": {
    "patient": string | null,
    "symptoms": string | null,
    "riskLevel": "low" | "medium" | "high" | "critical" | null,
    "firstAidGiven": string | null,
    "suggestedAction": string | null
  } | null
}

If you are still gathering information, set done=false, riskLevel=null, firstAidSteps=null, report=null, and put your single follow-up question in both "reply" and "followUpQuestion".`;

type Message = { role: string; content: string };
type TriageResponse = {
  reply: string;
  followUpQuestion: string | null;
  riskLevel: "low" | "medium" | "high" | "critical" | null;
  firstAidSteps: string[] | null;
  done: boolean;
  report: {
    patient: string | null;
    symptoms: string | null;
    riskLevel: "low" | "medium" | "high" | "critical" | null;
    firstAidGiven: string | null;
    suggestedAction: string | null;
  } | null;
};

// ---- Rule-based fallback triage engine (used when OpenAI is unavailable) ----

const CRITICAL_KEYWORDS = ["not breathing", "no breathing", "stopped breathing", "unconscious", "not responding", "no pulse", "cardiac", "heart attack", "stroke", "choking", "drowning", "severe bleeding", "won't stop bleeding", "seizure", "convulsion", "not waking", "blue lips", "pale and cold"];
const HIGH_KEYWORDS = ["collapsed", "fainted", "fainting", "severe pain", "chest pain", "difficulty breathing", "shortness of breath", "broken bone", "fracture", "deep cut", "high fever", "vomiting blood", "blood", "burn", "pregnant", "fall", "head injury"];
const MEDIUM_KEYWORDS = ["fever", "pain", "nausea", "vomiting", "diarrhea", "dizzy", "dizziness", "rash", "swelling", "sore throat", "cough", "injury", "cut", "sprain", "wound"];
const LOW_KEYWORDS = ["minor", "small cut", "bruise", "headache", "stomach ache", "runny nose", "sneeze", "mild"];

const QUESTIONS_BY_ROUND = [
  "Is the person breathing normally right now?",
  "Is the person responding when you call their name or gently shake them?",
  "Is there any severe bleeding or chest pain?",
  "How long ago did this start, and is it getting worse?",
];

function detectRisk(text: string): "low" | "medium" | "high" | "critical" {
  const t = text.toLowerCase();
  if (CRITICAL_KEYWORDS.some((k) => t.includes(k))) return "critical";
  if (HIGH_KEYWORDS.some((k) => t.includes(k))) return "high";
  if (MEDIUM_KEYWORDS.some((k) => t.includes(k))) return "medium";
  if (LOW_KEYWORDS.some((k) => t.includes(k))) return "low";
  return "medium";
}

function firstAidForRisk(risk: "low" | "medium" | "high" | "critical", symptoms: string): string[] {
  const s = symptoms.toLowerCase();
  // Specific symptom checks take priority over the generic critical/CPR path.
  if (s.includes("bleeding") || s.includes("blood") || s.includes("cut")) {
    return [
      "Call your local emergency number if bleeding is severe or won't stop.",
      "Apply firm, direct pressure to the wound with a clean cloth.",
      "Keep pressure steady; do not lift the cloth to check.",
      "If possible, raise the injured area above heart level.",
      "Do not remove any embedded object — press around it.",
    ];
  }
  if (s.includes("burn")) {
    return [
      "Cool the burn with running cool (not cold) water for at least 10 minutes.",
      "Do not apply ice, butter, or any creams.",
      "Remove jewellery or tight clothing near the burn before it swells.",
      "Cover loosely with a clean, non-stick dressing.",
      "Seek medical help for large or deep burns.",
    ];
  }
  if (s.includes("fracture") || s.includes("broken") || s.includes("fall")) {
    return [
      "Keep the person still and support the injured area.",
      "Do not try to move or straighten the broken bone.",
      "Immobilise with a makeshift splint if trained.",
      "Apply a cold pack wrapped in cloth to reduce swelling.",
      "Seek medical attention.",
    ];
  }
  if (s.includes("breathing") || s.includes("not breathing") || s.includes("cardiac") || s.includes("heart attack") || s.includes("stroke") || s.includes("choking") || s.includes("drowning") || risk === "critical") {
    return [
      "Call your local emergency number immediately.",
      "If the person is not breathing, begin CPR with chest compressions (100-120 per minute).",
      "Keep the person flat on their back on a firm surface.",
      "Do not put anything in their mouth.",
      "Continue CPR until help arrives or the person starts breathing.",
    ];
  }
  if (risk === "high") {
    return [
      "Stay calm and reassure the person.",
      "Call your local emergency number if symptoms are severe.",
      "Keep the person comfortable and monitor their breathing.",
      "Do not give them anything to eat or drink.",
      "Note any changes in their condition until help arrives.",
    ];
  }
  return [
    "Stay calm and reassure the person.",
    "Help them into a comfortable position.",
    "Monitor their condition for any changes.",
    "Keep them hydrated if appropriate.",
    "Seek medical advice if symptoms persist or worsen.",
  ];
}

function suggestedActionForRisk(risk: "low" | "medium" | "high" | "critical"): string {
  switch (risk) {
    case "critical":
      return "Call your local emergency number immediately. Begin CPR if the person is not breathing.";
    case "high":
      return "Seek urgent medical attention. Call your local emergency number or go to the nearest hospital.";
    case "medium":
      return "See a doctor promptly. Visit the nearest hospital or clinic for evaluation.";
    default:
      return "Monitor at home. Seek medical advice if symptoms persist or worsen.";
  }
}

function ruleBasedTriage(messages: Message[]): TriageResponse {
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUser = userMessages[userMessages.length - 1]?.content ?? "";
  const allSymptoms = userMessages.map((m) => m.content).join(" ");
  const risk = detectRisk(allSymptoms);
  const round = userMessages.length;

  // After 3-4 exchanges, produce the assessment.
  if (round >= 4 || (round >= 2 && risk === "critical")) {
    const steps = firstAidForRisk(risk, allSymptoms);
    return {
      reply: `Based on what you've described, this appears to be a ${risk} urgency situation. Here is your guidance. ${suggestedActionForRisk(risk)}`,
      followUpQuestion: null,
      riskLevel: risk,
      firstAidSteps: steps,
      done: true,
      report: {
        patient: null,
        symptoms: allSymptoms.slice(0, 500),
        riskLevel: risk,
        firstAidGiven: steps.join("; "),
        suggestedAction: suggestedActionForRisk(risk),
      },
    };
  }

  const question = QUESTIONS_BY_ROUND[Math.min(round - 1, QUESTIONS_BY_ROUND.length - 1)];
  return {
    reply: question,
    followUpQuestion: question,
    riskLevel: null,
    firstAidSteps: null,
    done: false,
    report: null,
  };
}

// ---- Main handler ----

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    // Try OpenAI if a key is present; otherwise use the rule-based fallback.
    if (apiKey) {
      try {
        const langInstruction = language
          ? `Respond to the user in this language code: ${language}. Keep the JSON keys in English.`
          : "";

        const chatResponse = await fetchWithTimeout(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.3,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: `${SYSTEM_PROMPT}\n${langInstruction}` },
                ...messages.map((m: Message) => ({ role: m.role, content: m.content })),
              ],
            }),
          },
          20000
        );

        if (chatResponse.ok) {
          const chatJson = await chatResponse.json();
          const content = chatJson?.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              return new Response(JSON.stringify(parsed), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            } catch {
              // fall through to rule-based
            }
          }
        }
        // OpenAI failed (invalid key, rate limit, etc.) — fall through to fallback.
      } catch {
        // network/timeout — fall through to fallback.
      }
    }

    // Rule-based fallback triage — always works, no external dependency.
    const result = ruleBasedTriage(messages as Message[]);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fetchWithTimeout(url: string, opts: RequestInit, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}
