/*
# Create lifeline_sessions table (single-tenant, no auth)

1. New Tables
- `lifeline_sessions`
  - `id` (uuid, primary key)
  - `language` (text, not null) — ISO code of the conversation language (en, te, hi, ...)
  - `risk_level` (text, nullable) — low | medium | high | critical
  - `messages` (jsonb, default '[]') — array of {role, content, created_at}
  - `report_user` (jsonb, nullable) — emergency report in the user's language
  - `report_english` (jsonb, nullable) — emergency report translated to English for hospitals
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `lifeline_sessions`.
- This is a single-tenant, no-auth emergency assistant. Anyone with the anon key
  may create and read sessions (the data is intentionally shared/public so the
  anon-key frontend can persist conversations without a login screen).
- CRUD policies are scoped to `anon, authenticated` with `USING (true)` because
  the data is intentionally public/shared in this no-auth app.

3. Notes
- No `user_id` column — the app has no sign-in screen.
- No destructive operations; table is created idempotently.
*/

CREATE TABLE IF NOT EXISTS lifeline_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL,
  risk_level text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_user jsonb,
  report_english jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lifeline_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lifeline_sessions" ON lifeline_sessions;
CREATE POLICY "anon_select_lifeline_sessions" ON lifeline_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lifeline_sessions" ON lifeline_sessions;
CREATE POLICY "anon_insert_lifeline_sessions" ON lifeline_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lifeline_sessions" ON lifeline_sessions;
CREATE POLICY "anon_update_lifeline_sessions" ON lifeline_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lifeline_sessions" ON lifeline_sessions;
CREATE POLICY "anon_delete_lifeline_sessions" ON lifeline_sessions FOR DELETE
  TO anon, authenticated USING (true);
