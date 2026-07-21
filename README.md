# Lifeline AI — Voice-First Emergency Triage Assistant

An AI-powered web app that helps ordinary people respond correctly during medical
emergencies **before professional help arrives**. It is **not** an AI doctor — it is
an AI emergency triage assistant that understands the situation, asks the right
follow-up questions, estimates urgency, gives evidence-based first-aid guidance,
generates a structured report, finds nearby hospitals, and shares your location
with emergency contacts.

> This is an AI-generated emergency assessment and is not a medical diagnosis.
> In a life-threatening emergency, call your local emergency number immediately.

## Features

- **Voice-first AI** — describe the emergency by voice (Web Speech API) or text.
- **Intelligent conversation** — one follow-up question at a time, emergency-operator persona.
- **Risk assessment** — Low / Medium / High / Critical with an animated urgency gauge.
- **First-aid guidance** — clear numbered steps. Never recommends medication.
- **Emergency report** — structured, printable report (patient, symptoms, risk, action, time, location).
- **Nearby hospitals** — distance, travel time, one-tap directions and call. Uses Google
  Places when a Maps key is configured, otherwise falls back to OpenStreetMap Overpass.
- **Emergency contacts** — save family / friend / doctor and one-click share location or report.
- **Multilingual** — English, Telugu, Hindi.
- **Accessible** — large tap targets, high-contrast and large-text modes, voice input, mobile-first.

## Tech stack

- React + TypeScript + Vite
- TailwindCSS + shadcn/ui + lucide-react
- React Router
- Supabase (auth, database, edge functions)
- OpenAI (via a Supabase edge function proxy — the key never reaches the browser)
- Web Speech API for voice input

## Getting started

```bash
npm install
npm run dev
```

The Supabase URL and anon key are pre-populated in `.env`. Copy `.env.example`
for reference if you fork the project.

### Edge function secrets

The AI assistant and hospital search run as Supabase Edge Functions so API keys
stay server-side. Set these as edge-function secrets (not in `.env`):

- `OPENAI_API_KEY` — required for the emergency triage assistant.
- `GOOGLE_MAPS_API_KEY` — optional. If set, hospital search uses Google Places
  Nearby Search. If unset, the app falls back to OpenStreetMap Overpass (no key
  required) so hospital search still works out of the box.

## Database

The app uses three Supabase tables, all with row-level security scoped to the
authenticated owner:

- `emergency_contacts` — saved contacts (family / friend / doctor).
- `emergency_reports` — AI-generated emergency reports.
- `user_settings` — per-user language and accessibility preferences.

Sign up via the **Sign In** page to save contacts, reports, and settings across
devices. The core Emergency Assistant works without signing in.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — type-check and build for production.
- `npm run typecheck` — type-check only.
- `npm run lint` — lint.

## Deployment

The project is ready for Vercel:

1. Push to a Git repository.
2. Import the repo in Vercel.
3. Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
4. Deploy. `vercel.json` rewrites all routes to `index.html` for SPA routing.

## Safety

Lifeline AI is **not a doctor** and never claims certainty. It never prescribes
medication. Always call your local emergency number first in a life-threatening
emergency.
