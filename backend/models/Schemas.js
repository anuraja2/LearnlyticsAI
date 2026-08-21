/**
 * models/Schemas.js
 * 
 * Previously contained Mongoose schema definitions.
 * Now migrated to Supabase (PostgreSQL).
 * 
 * All database operations are done directly via the Supabase client
 * in routes/api.js using the lib/supabase.js client.
 * 
 * Table definitions are in: backend/supabase/schema.sql
 */

export const TABLES = {
  PARENTS: 'parents',
  CHILDREN: 'children',
  REPORTS: 'reports',
  REPORT_ANALYSES: 'report_analyses',
  LEARNING_PROGRESS: 'learning_progress',
  QUIZ_RESULTS: 'quiz_results',
  STUDY_PLANS: 'study_plans',
  SCREEN_TIME: 'screen_time',
  EMOTION_LOGS: 'emotion_logs',
  SAFETY_ALERTS: 'safety_alerts',
  NOTIFICATIONS: 'notifications',
  SOS_HISTORY: 'sos_history',
  REWARDS: 'rewards',
  BADGES: 'badges',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_ATTEMPTS: 'quiz_attempts',
};
