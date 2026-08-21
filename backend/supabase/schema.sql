-- ============================================================
-- SafetyAI / Learnlytics AI — Supabase PostgreSQL Schema
-- Run this entire file in your Supabase SQL Editor ONCE.
-- Project: ktvvxizjblmiqtrbgsyc
-- ============================================================

-- Enable UUID extension (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PARENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS parents (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,
  phone       TEXT        DEFAULT '',
  role        TEXT        DEFAULT 'parent',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CHILDREN (Student profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS children (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id       UUID    REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  name            TEXT    NOT NULL,
  photo           TEXT    DEFAULT 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150',
  age             INTEGER DEFAULT 10,
  gender          TEXT    DEFAULT 'Other' CHECK (gender IN ('Male','Female','Other')),
  class           TEXT    DEFAULT '5th Grade',
  school          TEXT    DEFAULT 'Learnlytics Academy',
  parent_name     TEXT    DEFAULT 'Parent',
  learning_level  TEXT    DEFAULT 'Intermediate' CHECK (learning_level IN ('Beginner','Intermediate','Advanced')),
  email           TEXT    UNIQUE,
  username        TEXT    UNIQUE,
  password        TEXT,
  role            TEXT    DEFAULT 'child',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. REPORTS (Academic reports + AI analysis)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id                           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id                     UUID    REFERENCES children(id) ON DELETE CASCADE,
  student_id                   TEXT,
  title                        TEXT    NOT NULL,
  file_url                     TEXT    NOT NULL,
  file_name                    TEXT,
  file_type                    TEXT    DEFAULT 'pdf' CHECK (file_type IN ('pdf','image')),
  upload_date                  TIMESTAMPTZ DEFAULT NOW(),

  extracted_student_details    JSONB,
  extracted_subjects           TEXT[],
  extracted_marks              JSONB,
  total_marks                  NUMERIC,
  obtained_marks               NUMERIC,
  percentage                   NUMERIC,
  weak_subjects                TEXT[],
  recommendations              TEXT[],
  study_plan                   JSONB,
  ai_summary                   TEXT,

  overall_percentage           NUMERIC,
  overall_performance          TEXT,
  grade                        TEXT,
  performance_level            TEXT,
  strongest_subject            TEXT,
  weakest_subject              TEXT,
  highest_scoring_subjects     TEXT[],
  lowest_scoring_subjects      TEXT[],
  strengths                    TEXT[],
  areas_for_improvement        TEXT[],

  subject_performance          JSONB,
  subject_improvement_suggestions JSONB,
  tips_to_maintain_strong      JSONB,
  subject_recommendations      JSONB,
  personalized_study_plan      JSONB,
  weekly_study_plan            JSONB,
  weekly_learning_goals        TEXT[],
  parent_guidance              TEXT[],
  final_ai_summary             TEXT DEFAULT ''
);

-- ============================================================
-- 4. REPORT_ANALYSES (Detailed AI breakdown)
-- ============================================================
CREATE TABLE IF NOT EXISTS report_analyses (
  id                              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id                       UUID    REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  child_id                        UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  extracted_subjects              TEXT[],
  extracted_marks                 JSONB,
  overall_percentage              NUMERIC,
  strong_subjects                 TEXT[],
  weak_subjects                   TEXT[],
  recommendations                 JSONB,
  study_time_recommendations      JSONB,
  subject_improvement_suggestions JSONB,
  tips_to_maintain_strong         JSONB,
  personalized_study_recommendations JSONB,
  overall_performance             TEXT,
  grade                           TEXT,
  performance_level               TEXT,
  subject_performance             JSONB,
  final_ai_summary                TEXT,
  created_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. LEARNING_PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_progress (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id            UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  weekly_progress     NUMERIC DEFAULT 75,
  monthly_progress    NUMERIC DEFAULT 82,
  subject_performance JSONB,
  learning_streak     INTEGER DEFAULT 5,
  subject             TEXT,
  quizzes_completed   INTEGER DEFAULT 0,
  attempts_count      INTEGER DEFAULT 0,
  average_score       NUMERIC DEFAULT 0,
  practice_history    JSONB   DEFAULT '[]',
  improvement_status  TEXT    DEFAULT 'Started practicing',
  streak              INTEGER DEFAULT 0,
  last_updated        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. QUIZ_RESULTS (Legacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id        UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  quiz_title      TEXT    NOT NULL,
  subject         TEXT    NOT NULL,
  score           NUMERIC NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. STUDY_PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS study_plans (
  id       UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date     TEXT    NOT NULL,
  tasks    JSONB   DEFAULT '[]'
);

-- ============================================================
-- 8. SCREEN_TIME
-- ============================================================
CREATE TABLE IF NOT EXISTS screen_time (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id            UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date                TEXT    NOT NULL,
  today_minutes       INTEGER DEFAULT 0,
  weekly_minutes      INTEGER DEFAULT 0,
  monthly_minutes     INTEGER DEFAULT 0,
  continuous_minutes  INTEGER DEFAULT 0,
  exceeded_limit      BOOLEAN DEFAULT FALSE,
  history             JSONB   DEFAULT '[]'
);

-- ============================================================
-- 9. EMOTION_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS emotion_logs (
  id        UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id  UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  phase     TEXT    NOT NULL CHECK (phase IN ('before_learning','after_learning')),
  emotion   TEXT    NOT NULL CHECK (emotion IN ('Happy','Normal','Sad','Tired','Angry')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SAFETY_ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS safety_alerts (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id   UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  type       TEXT    NOT NULL CHECK (type IN ('high_screen_time','low_quiz_score','negative_emotion','unsafe_word','missed_goal','sos')),
  message    TEXT    NOT NULL,
  severity   TEXT    DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id        UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID    REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  child_id  UUID    REFERENCES children(id) ON DELETE SET NULL,
  category  TEXT    NOT NULL,
  title     TEXT    NOT NULL,
  message   TEXT    NOT NULL,
  read      BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. SOS_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS sos_history (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id   UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT    NOT NULL,
  location   TEXT    DEFAULT 'Home Device',
  status     TEXT    DEFAULT 'Triggered',
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS rewards (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id        UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points          INTEGER DEFAULT 0,
  stars           INTEGER DEFAULT 0,
  unlocked_perks  TEXT[]  DEFAULT '{}'
);

-- ============================================================
-- 14. BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id     UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  badge_name   TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  icon         TEXT    DEFAULT '🏆',
  unlocked_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. QUIZ_QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  subject        TEXT    NOT NULL,
  question       TEXT    NOT NULL,
  options        TEXT[]  NOT NULL,
  correct_answer TEXT    NOT NULL
);

-- ============================================================
-- 16. QUIZ_ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id        UUID    REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  subject         TEXT    NOT NULL,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage      NUMERIC NOT NULL,
  date            TIMESTAMPTZ DEFAULT NOW(),
  attempt_number  INTEGER NOT NULL
);

-- ============================================================
-- Disable RLS — backend uses service role key (bypasses RLS)
-- ============================================================
ALTER TABLE parents           DISABLE ROW LEVEL SECURITY;
ALTER TABLE children          DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports           DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_analyses   DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results      DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans       DISABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time       DISABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs      DISABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts     DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     DISABLE ROW LEVEL SECURITY;
ALTER TABLE sos_history       DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards           DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges            DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts     DISABLE ROW LEVEL SECURITY;
