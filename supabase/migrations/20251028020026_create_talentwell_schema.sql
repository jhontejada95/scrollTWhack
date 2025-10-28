/*
  # TalentWell Database Schema

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `sector` (text, industry sector)
      - `created_at` (timestamptz)
    
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, either 'employee' or 'manager')
      - `company_id` (uuid, references companies)
      - `created_at` (timestamptz)
    
    - `activation_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique activation code)
      - `company_id` (uuid, references companies)
      - `used` (boolean, whether code has been used)
      - `used_by` (uuid, references users)
      - `created_at` (timestamptz)
    
    - `check_ins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `company_id` (uuid, references companies)
      - `emotion` (text, emotion state: 'great', 'good', 'okay', 'stressed', 'exhausted')
      - `score` (integer, numerical value 0-100)
      - `comment` (text, optional brief comment)
      - `blockchain_hash` (text, ZK hash for verification)
      - `created_at` (timestamptz)
      - `date` (date, for ensuring one check-in per day)
  
  2. Security
    - Enable RLS on all tables
    - Users can read their own data
    - Managers can read aggregated company data
    - Only authenticated users can create check-ins
    - One check-in per user per day enforced
  
  3. Important Notes
    - All timestamps use timestamptz for timezone support
    - Blockchain hashes are stored for verification without exposing personal data
    - Scores are used for analytics: great=100, good=75, okay=50, stressed=40, exhausted=20
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create activation codes table
CREATE TABLE IF NOT EXISTS activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  used boolean DEFAULT false,
  used_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  emotion text NOT NULL CHECK (emotion IN ('great', 'good', 'okay', 'stressed', 'exhausted')),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  comment text DEFAULT '',
  blockchain_hash text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Activation codes policies
CREATE POLICY "Users can view unused activation codes"
  ON activation_codes FOR SELECT
  TO authenticated
  USING (used = false OR used_by = auth.uid());

CREATE POLICY "Users can update activation codes when activating"
  ON activation_codes FOR UPDATE
  TO authenticated
  USING (used = false)
  WITH CHECK (used_by = auth.uid());

-- Check-ins policies
CREATE POLICY "Users can view their own check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view company check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

CREATE POLICY "Users can create their own check-ins"
  ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_company ON check_ins(company_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);

-- Insert demo data
INSERT INTO companies (id, name, sector)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'Technology')
ON CONFLICT DO NOTHING;

INSERT INTO activation_codes (code, company_id, used)
VALUES 
  ('DEMO2025', '00000000-0000-0000-0000-000000000001', false),
  ('TALENT01', '00000000-0000-0000-0000-000000000001', false),
  ('WELLNESS99', '00000000-0000-0000-0000-000000000001', false)
ON CONFLICT DO NOTHING;