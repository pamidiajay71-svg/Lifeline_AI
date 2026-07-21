/*
# Lifeline AI – core tables

1. New Tables
- `emergency_contacts` – user's saved emergency contacts (family/friend/doctor).
  Columns: id (uuid pk), user_id (uuid, owner), name, relationship, phone, created_at.
- `emergency_reports` – structured AI-generated emergency reports.
  Columns: id (uuid pk), user_id (uuid, owner), patient, symptoms (text),
  risk_level (text: low|medium|high|critical), first_aid_given (text),
  suggested_action (text), location (text), created_at.
- `user_settings` – per-user app preferences (one row per user).
  Columns: id (uuid pk), user_id (uuid, owner, unique), language (text),
  voice_enabled (bool), high_contrast (bool), large_text (bool), updated_at.

2. Security
- RLS enabled on all three tables.
- Owner-scoped CRUD (TO authenticated, auth.uid() = user_id) for each table.
- user_id defaults to auth.uid() so inserts that omit user_id succeed.
- 4 separate policies per table (select/insert/update/delete).

3. Important notes
- This app uses Supabase email/password auth. The anon-key client cannot
  read/write these tables until the user signs in; the UI gates protected
  pages behind a sign-in screen.
- user_settings.user_id is UNIQUE so each user has exactly one settings row.
*/

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL DEFAULT 'Family',
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contacts" ON emergency_contacts;
CREATE POLICY "select_own_contacts" ON emergency_contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_contacts" ON emergency_contacts;
CREATE POLICY "insert_own_contacts" ON emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contacts" ON emergency_contacts;
CREATE POLICY "update_own_contacts" ON emergency_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contacts" ON emergency_contacts;
CREATE POLICY "delete_own_contacts" ON emergency_contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);

CREATE TABLE IF NOT EXISTS emergency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient text,
  symptoms text,
  risk_level text NOT NULL DEFAULT 'medium',
  first_aid_given text,
  suggested_action text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE emergency_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON emergency_reports;
CREATE POLICY "select_own_reports" ON emergency_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON emergency_reports;
CREATE POLICY "insert_own_reports" ON emergency_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reports" ON emergency_reports;
CREATE POLICY "update_own_reports" ON emergency_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON emergency_reports;
CREATE POLICY "delete_own_reports" ON emergency_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_reports_user_id ON emergency_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_created_at ON emergency_reports(created_at DESC);

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  voice_enabled boolean NOT NULL DEFAULT true,
  high_contrast boolean NOT NULL DEFAULT false,
  large_text boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
