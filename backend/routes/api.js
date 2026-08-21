import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

import { supabase, toDoc, toDocs } from '../lib/supabase.js';
import { analyzeStudentReport } from '../services/aiEngine.js';

const router = express.Router();
const JWT_SECRET = 'learnlytics-secret-key-12345';

// ── Multer storage setup ──────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf', 'image/jpeg', 'image/png',
      'image/webp', 'image/jpg', 'image/pjpeg', 'text/plain'
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});

// ── JWT Auth Middleware ───────────────────────────────────────
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ── Helper: count rows ────────────────────────────────────────
async function countRows(table, filters = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

// ─────────────────────────────────────────────────────────────
// AUTH: Register
// ─────────────────────────────────────────────────────────────
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'parent';

    if (userRole === 'parent') {
      // ── Parent Registration ──
      const { data: existingParent } = await supabase
        .from('parents')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingParent) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const { data: parent, error: parentErr } = await supabase
        .from('parents')
        .insert({ name, email: normalizedEmail, password: hashedPassword, role: 'parent' })
        .select()
        .single();

      if (parentErr) throw parentErr;

      return res.status(201).json({
        message: 'Parent registered successfully',
        parent: { id: parent.id, name: parent.name, email: parent.email, role: 'parent' }
      });

    } else if (userRole === 'child') {
      // ── Child Registration ──
      // Check duplicates in BOTH parents and children tables
      const { data: existingParent } = await supabase
        .from('parents')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingParent) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const { data: existingChild } = await supabase
        .from('children')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingChild) {
        return res.status(400).json({ error: 'A child account with this email already exists' });
      }

      // Create a system parent record (required by FK constraint)
      // This parent record acts as the owner/holder for standalone child signups
      const { data: parentRecord, error: parentErr } = await supabase
        .from('parents')
        .insert({
          name: `${name}'s Parent`,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'parent'
        })
        .select()
        .single();

      if (parentErr) throw parentErr;

      // Insert the child profile — check for errors
      const childUsername = normalizedEmail.split('@')[0];
      const { data: child, error: childErr } = await supabase
        .from('children')
        .insert({
          parent_id: parentRecord.id,
          name: name,
          photo: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150',
          age: 10,
          gender: 'Other',
          class: '5th Grade',
          school: 'Learnlytics Academy',
          parent_name: parentRecord.name,
          email: normalizedEmail,
          username: childUsername,
          password: hashedPassword,
          role: 'child'
        })
        .select()
        .single();

      if (childErr) {
        // Clean up the parent record if child insert failed
        await supabase.from('parents').delete().eq('id', parentRecord.id);
        throw childErr;
      }

      return res.status(201).json({
        message: 'Child registered successfully',
        parent: { id: child.id, name: child.name, email: child.email, role: 'child' }
      });

    } else {
      return res.status(400).json({ error: 'Invalid role. Must be "parent" or "child".' });
    }
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// ─────────────────────────────────────────────────────────────
// Helper: seed demo child data for a parent
// ─────────────────────────────────────────────────────────────
async function seedChildData(parentId, parentName) {
  try {
    // Find or create demo child
    let { data: child } = await supabase
      .from('children')
      .select()
      .eq('parent_id', parentId)
      .maybeSingle();

    if (!child) {
      const { data: newChild, error } = await supabase
        .from('children')
        .insert({
          parent_id: parentId,
          name: 'Alex Chen',
          photo: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150',
          age: 10,
          gender: 'Male',
          class: '5th Grade',
          school: 'Oakridge Academy',
          parent_name: parentName || 'Parent'
        })
        .select()
        .single();
      if (error) throw error;
      child = newChild;
    }

    const childId = child.id;

    // Seed Report if none exist
    const reportCount = await countRows('reports', { child_id: childId });
    if (reportCount === 0) {
      const { data: report, error: reportErr } = await supabase
        .from('reports')
        .insert({
          child_id: childId,
          student_id: childId,
          title: 'Midterm Report Card',
          file_url: '/uploads/midterm-report.pdf',
          file_name: 'midterm-report.pdf',
          file_type: 'pdf',
          upload_date: new Date().toISOString(),
          overall_percentage: 78.5,
          overall_performance: 'Very Good',
          grade: 'B',
          performance_level: 'Intermediate Level',
          strongest_subject: 'Science',
          weakest_subject: 'Mathematics',
          highest_scoring_subjects: ['Science', 'English'],
          lowest_scoring_subjects: ['Mathematics'],
          subject_performance: [
            { subject: 'Mathematics', score: 55, maxScore: 100, percentage: 55, level: 'Needs Focus', status: 'Weak' },
            { subject: 'Science', score: 92, maxScore: 100, percentage: 92, level: 'Advanced', status: 'Strong' },
            { subject: 'English', score: 88, maxScore: 100, percentage: 88, level: 'Advanced', status: 'Strong' }
          ],
          subject_improvement_suggestions: [
            { subject: 'Mathematics', suggestion: 'Mathematics needs additional attention. Practice for 30 minutes daily, revise important concepts, and solve practice questions regularly.' }
          ],
          tips_to_maintain_strong: [
            { subject: 'Science', tip: 'Excellent performance. Continue regular revision to maintain your performance.' },
            { subject: 'English', tip: 'Excellent performance. Continue regular revision to maintain your performance.' }
          ],
          weekly_study_plan: [
            { day: 'Monday', subject: 'Mathematics', duration: '30 Mins', activity: 'Targeted exercises & core concept review' },
            { day: 'Tuesday', subject: 'Science', duration: '20 Mins', activity: 'Advanced practice & speed drills' },
            { day: 'Wednesday', subject: 'English', duration: '20 Mins', activity: 'Advanced practice & speed drills' },
            { day: 'Thursday', subject: 'Mathematics', duration: '30 Mins', activity: 'Targeted exercises & core concept review' },
            { day: 'Friday', subject: 'Mathematics', duration: '30 Mins', activity: 'Targeted exercises & core concept review' }
          ],
          weekly_learning_goals: [
            'Achieve 85% or higher on the next Mathematics progress evaluation.',
            'Complete 3 dedicated concept reviews for Mathematics.',
            'Maintain top performance streak in Science.'
          ],
          parent_guidance: [
            'Encourage the student to spend more time practicing Mathematics because they need improvement.',
            "Praise the student's excellent proficiency and hard work in Science and English.",
            'Set learning checkpoints at the end of each weekly study plan phase.'
          ],
          final_ai_summary: 'The student performed strongly in Science and English but requires additional practice and focus in Mathematics. Consistent practice and weekly revision are highly recommended to improve Mathematics performance.'
        })
        .select()
        .single();

      if (reportErr) throw reportErr;

      await supabase.from('report_analyses').insert({
        report_id: report.id,
        child_id: childId,
        extracted_subjects: ['Mathematics', 'Science', 'English'],
        extracted_marks: { Mathematics: '55/100', Science: '92/100', English: '88/100' },
        overall_percentage: 78.5,
        strong_subjects: ['Science', 'English'],
        weak_subjects: ['Mathematics'],
        recommendations: [
          {
            subject: 'Mathematics',
            suggestion: 'Mathematics needs additional attention. Practice for 30 minutes daily, revise important concepts, and solve practice questions regularly.',
            studyTime: '30 Minutes Daily',
            practiceActivities: [
              'Complete targeted practice problems in Mathematics daily.',
              'Spend 15 minutes reviewing fundamental Mathematics definitions.'
            ],
            revisionMethods: [
              'Build a summary concept sheet for Mathematics.',
              'Attempt short self-tests twice a week.'
            ]
          }
        ],
        overall_performance: 'Very Good',
        grade: 'B',
        performance_level: 'Intermediate Level',
        subject_performance: [
          { subject: 'Mathematics', score: 55, maxScore: 100, percentage: 55, level: 'Needs Focus', status: 'Weak' },
          { subject: 'Science', score: 92, maxScore: 100, percentage: 92, level: 'Advanced', status: 'Strong' },
          { subject: 'English', score: 88, maxScore: 100, percentage: 88, level: 'Advanced', status: 'Strong' }
        ],
        final_ai_summary: 'The student performed strongly in Science and English but requires additional practice and focus in Mathematics. Consistent practice and weekly revision are highly recommended to improve Mathematics performance.'
      });
    }

    // Seed QuizAttempts if none exist
    const attemptCount = await countRows('quiz_attempts', { child_id: childId });
    if (attemptCount === 0) {
      const now = Date.now();
      await supabase.from('quiz_attempts').insert([
        { child_id: childId, subject: 'Mathematics', score: 2, total_questions: 5, percentage: 40, attempt_number: 1, date: new Date(now - 4 * 86400000).toISOString() },
        { child_id: childId, subject: 'Mathematics', score: 3, total_questions: 5, percentage: 60, attempt_number: 2, date: new Date(now - 2 * 86400000).toISOString() },
        { child_id: childId, subject: 'Mathematics', score: 4, total_questions: 5, percentage: 80, attempt_number: 3, date: new Date(now - 1 * 86400000).toISOString() }
      ]);
    }

    // Seed LearningProgress if none exist
    const progressCount = await countRows('learning_progress', { child_id: childId });
    if (progressCount === 0) {
      await supabase.from('learning_progress').insert({
        child_id: childId,
        subject: 'Mathematics',
        quizzes_completed: 3,
        attempts_count: 3,
        average_score: 60,
        practice_history: [40, 60, 80],
        improvement_status: 'Practice performance is improving.',
        streak: 3,
        last_updated: new Date().toISOString()
      });
    }

    // Seed ScreenTime if none exist for today
    const today = new Date().toISOString().split('T')[0];
    const screenCount = await countRows('screen_time', { child_id: childId, date: today });
    if (screenCount === 0) {
      await supabase.from('screen_time').insert({
        child_id: childId,
        date: today,
        today_minutes: 35,
        continuous_minutes: 15,
        exceeded_limit: false
      });
    }

    // Seed Notification if none exist
    const notifCount = await countRows('notifications', { parent_id: parentId });
    if (notifCount === 0) {
      await supabase.from('notifications').insert({
        parent_id: parentId,
        child_id: childId,
        category: 'System Seed',
        title: 'Welcome to Learnlytics AI',
        message: 'Your system dashboard is fully set up and seeded with mock student data for Alex Chen.'
      });
    }
  } catch (err) {
    console.error('Failed to seed child data:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// AUTH: Login
// ─────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email/username, password, and role are required' });
    }
    const normalizedInput = email.trim().toLowerCase();

    if (role === 'parent') {
      const { data: parent } = await supabase
        .from('parents')
        .select()
        .eq('email', normalizedInput)
        .maybeSingle();

      if (!parent) return res.status(401).json({ error: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, parent.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      await seedChildData(parent.id, parent.name);

      const token = jwt.sign({ id: parent.id, email: parent.email, role: 'parent' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        token,
        user: { id: parent.id, name: parent.name, email: parent.email, role: 'parent' }
      });

    } else if (role === 'child') {
      // Try by ID first, then email, then username (separate queries to avoid .or() filter issues)
      let child = null;
      const rawInput = email.trim();

      // Try as UUID (ID lookup)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawInput)) {
        const { data } = await supabase.from('children').select().eq('id', rawInput).maybeSingle();
        child = data;
      }

      // Try by email
      if (!child) {
        const { data } = await supabase
          .from('children')
          .select()
          .eq('email', normalizedInput)
          .maybeSingle();
        child = data;
      }

      // Try by username
      if (!child) {
        const { data } = await supabase
          .from('children')
          .select()
          .eq('username', normalizedInput)
          .maybeSingle();
        child = data;
      }

      if (!child || !child.password) {
        return res.status(401).json({ error: 'Invalid Child ID/Email or password' });
      }

      const isMatch = await bcrypt.compare(password, child.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid Child ID/Email or password' });

      const token = jwt.sign(
        { id: child.id, email: child.email || child.username, role: 'child' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: { id: child.id, name: child.name, email: child.email || child.username, role: 'child' }
      });

    } else {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// STUDENTS / CHILDREN: Get children belonging to parent
// ─────────────────────────────────────────────────────────────
router.get('/students', authenticateToken, async (req, res) => {
  try {
    let parentId;
    if (req.user.role === 'child') {
      const { data: child } = await supabase.from('children').select('parent_id').eq('id', req.user.id).maybeSingle();
      if (!child) return res.status(404).json({ error: 'Child profile not found' });
      parentId = child.parent_id;
    } else {
      parentId = req.user.id;
    }

    const { data: children, error } = await supabase.from('children').select().eq('parent_id', parentId);
    if (error) throw error;

    // Map to MongoDB-compatible format (parentId, _id)
    res.json(toDocs(children));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// STUDENTS / CHILDREN: Create child
// ─────────────────────────────────────────────────────────────
router.post('/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can add students' });
    }

    let parentName = req.body.parentName;
    if (!parentName) {
      const { data: parent } = await supabase.from('parents').select('name').eq('id', req.user.id).maybeSingle();
      parentName = parent ? parent.name : 'Parent';
    }

    const { name, email, username, password, ...rest } = req.body;
    const rawPassword = password || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Combine timestamp + random hex to make the suffix collision-proof
    // even if many children share the same name.
    const namePart = name.toLowerCase().replace(/\s+/g, '');
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const normalizedEmail = email
      ? email.trim().toLowerCase()
      : `${namePart}.${uniqueSuffix}@learnlytics.app`;
    const normalizedUsername = username
      ? username.trim().toLowerCase()
      : `${namePart}${uniqueSuffix}`;

    const insertData = {
      parent_id: req.user.id,
      name,
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      role: 'child',
      parent_name: parentName,
      photo: rest.photo || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150',
      age: rest.age || 10,
      gender: rest.gender || 'Other',
      class: rest.class || '5th Grade',
      school: rest.school || 'Learnlytics Academy',
      learning_level: rest.learningLevel || 'Intermediate'
    };

    const { data: child, error } = await supabase.from('children').insert(insertData).select().single();
    if (error) {
      // Postgres unique-constraint violation code is 23505
      if (error.code === '23505') {
        // Determine which field caused the conflict for a clearer message
        const field = error.message.includes('email') ? 'email address'
          : error.message.includes('username') ? 'username'
          : 'email or username';
        return res.status(400).json({
          error: `A student profile with this ${field} already exists. Please use a different ${field}.`
        });
      }
      throw error;
    }

    res.status(201).json(toDoc(child));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// REPORT UPLOAD & AI ANALYSIS
// ─────────────────────────────────────────────────────────────
router.post('/reports/upload', authenticateToken, upload.single('reportFile'), async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can upload reports' });
    }
    const { childId, title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF or image of the student report.' });
    }

    // Verify child ownership
    const { data: child } = await supabase
      .from('children')
      .select()
      .eq('id', childId)
      .eq('parent_id', req.user.id)
      .maybeSingle();

    if (!child) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: 'Unauthorized student profile access.' });
    }

    const fileType = file.mimetype === 'application/pdf' ? 'pdf' : (file.mimetype === 'text/plain' ? 'text' : 'image');
    const fileUrl = `/uploads/${file.filename}`;
    const filePath = file.path;
    let textContent = '';

    if (fileType === 'pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        textContent = pdfData.text;
      } catch (pdfErr) {
        try { fs.unlinkSync(filePath); } catch (e) {}
        return res.status(400).json({ error: 'Unable to read this PDF file. Please upload a clearer PDF.' });
      }
    } else if (fileType === 'text') {
      try {
        textContent = fs.readFileSync(filePath, 'utf8');
      } catch (txtErr) {
        try { fs.unlinkSync(filePath); } catch (e) {}
        return res.status(400).json({ error: 'Unable to read this text file.' });
      }
    } else {
      try {
        const ocrResult = await Tesseract.recognize(filePath, 'eng');
        textContent = ocrResult.data.text;
      } catch (ocrErr) {
        try { fs.unlinkSync(filePath); } catch (e) {}
        return res.status(400).json({ error: 'Unable to read this image file. Please upload a clearer image.' });
      }
    }

    const aiAnalysis = analyzeStudentReport({ filename: file.filename, textContent, studentName: child.name });

    if (aiAnalysis.error) {
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(400).json({ error: aiAnalysis.error });
    }

    // Insert report
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .insert({
        child_id: childId,
        student_id: childId,
        title: title || file.originalname || 'Academic Report',
        file_name: file.filename,
        file_url: fileUrl,
        file_type: fileType === 'text' ? 'pdf' : fileType,
        upload_date: new Date().toISOString(),
        overall_percentage: aiAnalysis.overallPercentage,
        overall_performance: aiAnalysis.overallPerformance,
        grade: aiAnalysis.grade,
        performance_level: aiAnalysis.performanceLevel,
        strongest_subject: aiAnalysis.strongSubjects[0] || '',
        weakest_subject: aiAnalysis.weakSubjects[0] || '',
        highest_scoring_subjects: aiAnalysis.strongSubjects,
        lowest_scoring_subjects: aiAnalysis.weakSubjects,
        subject_performance: aiAnalysis.subjectPerformance,
        subject_improvement_suggestions: aiAnalysis.subjectImprovementSuggestions,
        tips_to_maintain_strong: aiAnalysis.tipsToMaintainStrong,
        weekly_study_plan: aiAnalysis.weeklyStudyPlan,
        weekly_learning_goals: aiAnalysis.weeklyLearningGoals,
        parent_guidance: aiAnalysis.parentGuidance,
        final_ai_summary: aiAnalysis.finalAISummary
      })
      .select()
      .single();

    if (reportErr) throw reportErr;

    // Insert report analysis
    const { data: reportAnalysis, error: analysisErr } = await supabase
      .from('report_analyses')
      .insert({
        report_id: report.id,
        child_id: childId,
        extracted_subjects: aiAnalysis.extractedSubjects,
        extracted_marks: aiAnalysis.extractedMarks,
        overall_percentage: aiAnalysis.overallPercentage,
        strong_subjects: aiAnalysis.strongSubjects,
        weak_subjects: aiAnalysis.weakSubjects,
        recommendations: aiAnalysis.personalizedStudyRecommendations.map(rec => {
          const studyTimeRec = (aiAnalysis.studyTimeRecommendations || []).find(t => t.subject === rec.subject);
          const sugg = (aiAnalysis.subjectImprovementSuggestions || []).find(s => s.subject === rec.subject);
          return {
            subject: rec.subject,
            suggestion: sugg ? sugg.suggestion : '',
            studyTime: studyTimeRec ? studyTimeRec.time : '30 Minutes Daily',
            practiceActivities: rec.practiceActivities,
            revisionMethods: rec.revisionMethods
          };
        }),
        study_time_recommendations: aiAnalysis.studyTimeRecommendations,
        subject_improvement_suggestions: aiAnalysis.subjectImprovementSuggestions,
        tips_to_maintain_strong: aiAnalysis.tipsToMaintainStrong,
        personalized_study_recommendations: aiAnalysis.personalizedStudyRecommendations,
        overall_performance: aiAnalysis.overallPerformance,
        grade: aiAnalysis.grade,
        performance_level: aiAnalysis.performanceLevel,
        subject_performance: aiAnalysis.subjectPerformance,
        final_ai_summary: aiAnalysis.finalAISummary,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisErr) throw analysisErr;

    // Notify parent
    await supabase.from('notifications').insert({
      parent_id: req.user.id,
      child_id: childId,
      category: 'Report Uploaded',
      title: 'New Student Report Uploaded',
      message: `Report "${report.title}" uploaded & analyzed by Learnlytics AI. Score: ${reportAnalysis.overall_percentage}%`
    });

    res.status(201).json({
      ...toDoc(report),
      analysis: toDoc(reportAnalysis)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// REPORTS: Get reports list with analyses
// ─────────────────────────────────────────────────────────────
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select()
      .eq('child_id', childId)
      .order('upload_date', { ascending: false });

    if (error) throw error;

    const reportsWithAnalysis = [];
    for (const r of reports) {
      const { data: analysis } = await supabase
        .from('report_analyses')
        .select()
        .eq('report_id', r.id)
        .maybeSingle();

      reportsWithAnalysis.push({
        ...toDoc(r),
        analysis: analysis ? toDoc(analysis) : null
      });
    }

    res.json(reportsWithAnalysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// QUIZ: Get questions for a subject
// ─────────────────────────────────────────────────────────────
router.get('/quiz/questions', authenticateToken, async (req, res) => {
  try {
    const { childId, subject } = req.query;
    if (!childId || !subject) {
      return res.status(400).json({ error: 'childId and subject are required' });
    }

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    // Try exact match (case-insensitive)
    let { data: questions } = await supabase
      .from('quiz_questions')
      .select()
      .ilike('subject', subject);

    // Fuzzy fallback
    if (!questions || questions.length === 0) {
      const norm = subject.toLowerCase();
      let pattern = null;
      if (norm.includes('math')) pattern = 'Mathematics';
      else if (norm.includes('science')) pattern = 'Science';
      else if (norm.includes('english') || norm.includes('grammar')) pattern = 'English';
      else if (norm.includes('physic')) pattern = 'Physics';
      else if (norm.includes('chemist')) pattern = 'Chemistry';
      else if (norm.includes('biolog')) pattern = 'Biology';
      else if (norm.includes('history')) pattern = 'History';
      else if (norm.includes('geograph')) pattern = 'Geography';
      else if (norm.includes('social') || norm === 'sst') pattern = 'Social Studies';
      else if (norm.includes('computer')) pattern = 'Computer Science';
      else if (norm.includes('art')) pattern = 'Art';
      else if (norm === 'pe' || norm.includes('physical ed')) pattern = 'PE';

      if (pattern) {
        const { data: fallbackQ } = await supabase.from('quiz_questions').select().ilike('subject', pattern);
        questions = fallbackQ;
      }
    }

    // Hard fallback
    if (!questions || questions.length === 0) {
      return res.json([
        { subject, question: `What is the primary study focus of ${subject}?`, options: ['Basic principles and concepts', 'Random facts', 'Nothing in particular', 'Games'], correctAnswer: 'Basic principles and concepts' },
        { subject, question: `Which of the following is most important for mastering ${subject}?`, options: ['Consistent practice', 'Memorizing without understanding', 'Skipping lessons', 'Guessing'], correctAnswer: 'Consistent practice' },
        { subject, question: `Which tool is most commonly used in ${subject} practice?`, options: ['Reference books & exercises', 'Video games', 'Television', 'A hammer'], correctAnswer: 'Reference books & exercises' },
        { subject, question: `How can you improve your skills in ${subject}?`, options: ['Solve worksheets & ask questions', 'Sleep longer', 'Avoid studying', 'Forget instructions'], correctAnswer: 'Solve worksheets & ask questions' },
        { subject, question: `True or False: Every topic in ${subject} becomes easier with regular review.`, options: ['True', 'False', 'Cannot be determined', 'Sometimes False'], correctAnswer: 'True' }
      ]);
    }

    // Map correct_answer → correctAnswer for frontend compatibility
    res.json(questions.map(q => ({
      ...toDoc(q),
      correctAnswer: q.correct_answer
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// QUIZ: Save attempt & update LearningProgress
// ─────────────────────────────────────────────────────────────
router.post('/quiz/attempts', authenticateToken, async (req, res) => {
  try {
    const { childId, subject, score, totalQuestions } = req.body;
    if (!childId || !subject || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Missing quiz fields' });
    }

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const count = await countRows('quiz_attempts', { child_id: childId, subject });
    const attemptNumber = count + 1;

    const { data: attempt, error: attemptErr } = await supabase
      .from('quiz_attempts')
      .insert({ child_id: childId, subject, score, total_questions: totalQuestions, percentage, date: new Date().toISOString(), attempt_number: attemptNumber })
      .select()
      .single();
    if (attemptErr) throw attemptErr;

    // Get all attempts for this child+subject (sorted by date)
    const { data: allAttempts } = await supabase
      .from('quiz_attempts')
      .select()
      .eq('child_id', childId)
      .eq('subject', subject)
      .order('date', { ascending: true });

    const firstAttempt = allAttempts[0];
    const latestAttempt = allAttempts[allAttempts.length - 1];

    let status = 'Started practicing';
    if (allAttempts.length > 1) {
      status = latestAttempt.percentage > firstAttempt.percentage
        ? 'Practice performance is improving.'
        : 'Practice performance is steady.';
    }

    // Upsert LearningProgress
    const { data: existingProgress } = await supabase
      .from('learning_progress')
      .select()
      .eq('child_id', childId)
      .eq('subject', subject)
      .maybeSingle();

    let progress;
    if (!existingProgress) {
      const { data: newProgress } = await supabase
        .from('learning_progress')
        .insert({
          child_id: childId,
          subject,
          quizzes_completed: 1,
          attempts_count: 1,
          average_score: percentage,
          practice_history: [percentage],
          improvement_status: status,
          streak: 1,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      progress = newProgress;
    } else {
      const newHistory = [...(existingProgress.practice_history || []), percentage];
      const newAvg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
      const { data: updatedProgress } = await supabase
        .from('learning_progress')
        .update({
          quizzes_completed: existingProgress.quizzes_completed + 1,
          attempts_count: existingProgress.attempts_count + 1,
          practice_history: newHistory,
          average_score: newAvg,
          improvement_status: status,
          streak: existingProgress.streak + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single();
      progress = updatedProgress;
    }

    // Notify parent
    await supabase.from('notifications').insert({
      parent_id: child.parent_id,
      child_id: childId,
      category: 'Quiz Completed',
      title: `${subject} Practice Quiz Completed`,
      message: `Your child completed the ${subject} improvement quiz and scored ${score}/${totalQuestions} (${percentage}%). ${status}`
    });

    res.status(201).json({ attempt: toDoc(attempt), progress: toDoc(progress) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// QUIZ: Get attempts history
// ─────────────────────────────────────────────────────────────
router.get('/quiz/attempts', authenticateToken, async (req, res) => {
  try {
    const { childId, subject } = req.query;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    let query = supabase.from('quiz_attempts').select().eq('child_id', childId).order('date', { ascending: false });
    if (subject) query = query.eq('subject', subject);

    const { data: attempts, error } = await query;
    if (error) throw error;
    res.json(toDocs(attempts));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PROGRESS: Get learning progress
// ─────────────────────────────────────────────────────────────
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const { data: progressList, error } = await supabase
      .from('learning_progress')
      .select()
      .eq('child_id', childId)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    res.json(toDocs(progressList));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SAFETY: Screen time tracking
// ─────────────────────────────────────────────────────────────
router.post('/safety/screen-time', authenticateToken, async (req, res) => {
  try {
    const { childId, minutesToAdd } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const { data: existing } = await supabase
      .from('screen_time')
      .select()
      .eq('child_id', childId)
      .eq('date', today)
      .maybeSingle();

    let record;
    const addMins = minutesToAdd || 5;

    if (!existing) {
      const { data: newRecord, error } = await supabase
        .from('screen_time')
        .insert({ child_id: childId, date: today, today_minutes: addMins, continuous_minutes: addMins, exceeded_limit: false })
        .select()
        .single();
      if (error) throw error;
      record = newRecord;
    } else {
      const newToday = existing.today_minutes + addMins;
      const newContinuous = existing.continuous_minutes + addMins;
      const exceeded = newContinuous > 45;

      if (exceeded && !existing.exceeded_limit) {
        await supabase.from('notifications').insert({
          parent_id: child.parent_id,
          child_id: childId,
          category: 'High Screen Time',
          title: 'Continuous Screen Time Alert',
          message: `Child active for ${newContinuous} continuous minutes. Show break banner!`
        });
      }

      const { data: updated, error } = await supabase
        .from('screen_time')
        .update({ today_minutes: newToday, continuous_minutes: newContinuous, exceeded_limit: exceeded })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      record = updated;
    }

    res.json(toDoc(record));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SAFETY: Log emotion
// ─────────────────────────────────────────────────────────────
router.post('/safety/emotion', authenticateToken, async (req, res) => {
  try {
    const { childId, phase, emotion } = req.body;

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const { data: log, error } = await supabase
      .from('emotion_logs')
      .insert({ child_id: childId, phase, emotion })
      .select()
      .single();
    if (error) throw error;

    if (['Sad', 'Angry', 'Tired'].includes(emotion)) {
      await supabase.from('notifications').insert({
        parent_id: child.parent_id,
        child_id: childId,
        category: 'Emotion Alerts',
        title: 'Emotional Well-being Check',
        message: `Student selected emotion: ${emotion} (${phase.replace('_', ' ')})`
      });
    }

    res.status(201).json(toDoc(log));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SAFETY: Report unsafe word
// ─────────────────────────────────────────────────────────────
router.post('/safety/unsafe-word', authenticateToken, async (req, res) => {
  try {
    const { childId, detectedWord, context } = req.body;

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const alertMessage = `Unsafe language detected: "${detectedWord}" in ${context || 'Chat/Search'}`;

    const { data: alert, error } = await supabase
      .from('safety_alerts')
      .insert({ child_id: childId, type: 'unsafe_word', message: alertMessage, severity: 'high' })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      parent_id: child.parent_id,
      child_id: childId,
      category: 'Unsafe Word Alerts',
      title: 'Language Moderation Warning',
      message: alertMessage
    });

    res.status(201).json({ warning: 'Please use respectful language.', alert: toDoc(alert) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SAFETY: SOS Emergency
// ─────────────────────────────────────────────────────────────
router.post('/safety/sos', authenticateToken, async (req, res) => {
  try {
    const { childId, childName, location } = req.body;

    const { data: child } = await supabase.from('children').select().eq('id', childId).maybeSingle();
    if (!child) return res.status(404).json({ error: 'Child not found' });

    if (req.user.role === 'parent' && child.parent_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }
    if (req.user.role === 'child' && child.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden student profile access' });
    }

    const { data: sos, error } = await supabase
      .from('sos_history')
      .insert({
        child_id: childId,
        child_name: childName || child.name,
        location: location || 'Home Device Dashboard'
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      parent_id: child.parent_id,
      child_id: childId,
      category: 'SOS Alerts',
      title: '🚨 EMERGENCY SOS TRIGGERED',
      message: `Emergency SOS button pressed by ${sos.child_name} at ${new Date().toLocaleTimeString()}`
    });

    res.status(201).json({ message: 'Emergency SOS alert dispatched to parent!', sos: toDoc(sos) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select()
      .eq('parent_id', req.user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json(toDocs(notifications));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/mark-read', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('parent_id', req.user.id)
      .eq('read', false);

    if (error) throw error;
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SEED: Quiz questions (called on server start)
// ─────────────────────────────────────────────────────────────
export async function seedQuizQuestions() {
  try {
    const count = await countRows('quiz_questions');
    if (count > 0) return; // Already seeded

    console.log('🌱 Seeding QuizQuestions table...');
    const questions = [
      { subject: 'Mathematics', question: 'What is 48 + 32?', options: ['70','80','90','100'], correct_answer: '80' },
      { subject: 'Mathematics', question: 'Solve: 7 x 8', options: ['48','54','56','64'], correct_answer: '56' },
      { subject: 'Mathematics', question: 'What is the value of 150 - 65?', options: ['75','85','95','105'], correct_answer: '85' },
      { subject: 'Mathematics', question: 'Calculate: 120 / 4', options: ['20','25','30','40'], correct_answer: '30' },
      { subject: 'Mathematics', question: 'What is 9 squared?', options: ['18','72','81','99'], correct_answer: '81' },
      { subject: 'Science', question: 'Which planet is known as the Red Planet?', options: ['Venus','Mars','Jupiter','Saturn'], correct_answer: 'Mars' },
      { subject: 'Science', question: 'What is the chemical formula for water?', options: ['CO2','H2O','NaCl','O2'], correct_answer: 'H2O' },
      { subject: 'Science', question: 'What gas do humans need to breathe in to survive?', options: ['Nitrogen','Carbon Dioxide','Oxygen','Hydrogen'], correct_answer: 'Oxygen' },
      { subject: 'Science', question: 'Which part of the plant conducts photosynthesis?', options: ['Roots','Stem','Leaves','Flowers'], correct_answer: 'Leaves' },
      { subject: 'Science', question: 'What state of matter has a definite shape and volume?', options: ['Solid','Liquid','Gas','Plasma'], correct_answer: 'Solid' },
      { subject: 'English', question: 'Identify the noun in this sentence: "The dog barked loudly."', options: ['dog','barked','loudly','The'], correct_answer: 'dog' },
      { subject: 'English', question: 'What is the past tense of the verb "go"?', options: ['goes','going','went','gone'], correct_answer: 'went' },
      { subject: 'English', question: 'Choose the correct spelling:', options: ['Recieve','Receive','Receve','Recive'], correct_answer: 'Receive' },
      { subject: 'English', question: 'What is a word that means the opposite of "generous"?', options: ['Kind','Selfish','Happy','Polite'], correct_answer: 'Selfish' },
      { subject: 'English', question: 'Which of the following is a pronoun?', options: ['Run','She','Beautiful','Quickly'], correct_answer: 'She' },
      { subject: 'Physics', question: 'What force pulls objects toward Earth?', options: ['Gravity','Friction','Magnetism','Tension'], correct_answer: 'Gravity' },
      { subject: 'Physics', question: 'What is the unit of electric current?', options: ['Volt','Ohm','Ampere','Watt'], correct_answer: 'Ampere' },
      { subject: 'Physics', question: "Newton's third law says for every action there is:", options: ['An equal and opposite reaction','No reaction','A smaller reaction','A random reaction'], correct_answer: 'An equal and opposite reaction' },
      { subject: 'Physics', question: 'What form of energy is stored in a battery?', options: ['Thermal','Chemical','Nuclear','Kinetic'], correct_answer: 'Chemical' },
      { subject: 'Physics', question: 'Which state of matter has no definite shape or volume?', options: ['Solid','Liquid','Gas','Crystal'], correct_answer: 'Gas' },
      { subject: 'Chemistry', question: 'What is the pH of pure water?', options: ['1','5','7','14'], correct_answer: '7' },
      { subject: 'Chemistry', question: 'What is the chemical formula for carbon dioxide?', options: ['CO','CO2','H2O','O2'], correct_answer: 'CO2' },
      { subject: 'Chemistry', question: 'What is the lightest chemical element?', options: ['Helium','Hydrogen','Oxygen','Carbon'], correct_answer: 'Hydrogen' },
      { subject: 'Chemistry', question: 'What is the process of a solid turning directly into gas?', options: ['Evaporation','Melting','Sublimation','Condensation'], correct_answer: 'Sublimation' },
      { subject: 'Chemistry', question: "Which gas is most abundant in Earth's atmosphere?", options: ['Oxygen','Nitrogen','Carbon Dioxide','Argon'], correct_answer: 'Nitrogen' },
      { subject: 'Biology', question: 'What is known as the powerhouse of the cell?', options: ['Nucleus','Ribosome','Mitochondria','Vacuole'], correct_answer: 'Mitochondria' },
      { subject: 'Biology', question: 'Which pigment gives plants their green color?', options: ['Carotenoid','Chlorophyll','Hemoglobin','Melanin'], correct_answer: 'Chlorophyll' },
      { subject: 'Biology', question: 'How many bones are in an adult human body?', options: ['106','206','306','406'], correct_answer: '206' },
      { subject: 'Biology', question: 'What is the primary function of white blood cells?', options: ['Carry oxygen','Fight infections','Clot blood','Produce energy'], correct_answer: 'Fight infections' },
      { subject: 'Biology', question: 'Which organ is responsible for pumping blood?', options: ['Lungs','Brain','Kidney','Heart'], correct_answer: 'Heart' },
      { subject: 'History', question: 'Who was the first President of the United States?', options: ['Thomas Jefferson','George Washington','Abraham Lincoln','John Adams'], correct_answer: 'George Washington' },
      { subject: 'History', question: 'Which ancient civilization built the Pyramids of Giza?', options: ['Romans','Greeks','Egyptians','Mayans'], correct_answer: 'Egyptians' },
      { subject: 'History', question: 'In which year did World War II end?', options: ['1918','1939','1945','1950'], correct_answer: '1945' },
      { subject: 'History', question: 'Who wrote the plays Romeo and Juliet and Hamlet?', options: ['Charles Dickens','William Shakespeare','Mark Twain','Leo Tolstoy'], correct_answer: 'William Shakespeare' },
      { subject: 'History', question: 'Which famous ship sank on its maiden voyage in 1912?', options: ['Santa Maria','Mayflower','Titanic','Lusitania'], correct_answer: 'Titanic' },
      { subject: 'Geography', question: 'What is the largest ocean on Earth?', options: ['Atlantic','Indian','Arctic','Pacific Ocean'], correct_answer: 'Pacific Ocean' },
      { subject: 'Geography', question: 'What is the capital city of France?', options: ['London','Rome','Paris','Madrid'], correct_answer: 'Paris' },
      { subject: 'Geography', question: 'Which is the longest river in the world?', options: ['Amazon','Nile','Mississippi','Yangtze'], correct_answer: 'Nile' },
      { subject: 'Geography', question: 'Which continent is also a country?', options: ['Asia','Africa','Antarctica','Australia'], correct_answer: 'Australia' },
      { subject: 'Geography', question: 'What is the highest mountain peak in the world?', options: ['K2','Mount Everest','Kilimanjaro','Mount Fuji'], correct_answer: 'Mount Everest' },
      { subject: 'Social Studies', question: 'What type of government is ruled by citizens who vote?', options: ['Monarchy','Dictatorship','Democracy','Oligarchy'], correct_answer: 'Democracy' },
      { subject: 'Social Studies', question: 'Which document is the supreme law of the land in the US?', options: ['Declaration of Independence','Constitution','Bill of Rights','Magna Carta'], correct_answer: 'Constitution' },
      { subject: 'Social Studies', question: 'What is the term for a person who makes maps?', options: ['Geographer','Cartographer','Astronomer','Historian'], correct_answer: 'Cartographer' },
      { subject: 'Social Studies', question: 'Which branch of government makes the laws?', options: ['Executive','Judicial','Legislative','Administrative'], correct_answer: 'Legislative' },
      { subject: 'Social Studies', question: 'What do we call the study of money, trade, and industry?', options: ['Civics','History','Economics','Sociology'], correct_answer: 'Economics' },
      { subject: 'SST', question: 'What type of government is ruled by citizens who vote?', options: ['Monarchy','Dictatorship','Democracy','Oligarchy'], correct_answer: 'Democracy' },
      { subject: 'SST', question: 'Which document is the supreme law of the land in the US?', options: ['Declaration of Independence','Constitution','Bill of Rights','Magna Carta'], correct_answer: 'Constitution' },
      { subject: 'SST', question: 'What is the term for a person who makes maps?', options: ['Geographer','Cartographer','Astronomer','Historian'], correct_answer: 'Cartographer' },
      { subject: 'SST', question: 'Which branch of government makes the laws?', options: ['Executive','Judicial','Legislative','Administrative'], correct_answer: 'Legislative' },
      { subject: 'SST', question: 'What do we call the study of money, trade, and industry?', options: ['Civics','History','Economics','Sociology'], correct_answer: 'Economics' },
      { subject: 'Computer Science', question: 'What is the main brain of a computer?', options: ['RAM','CPU','Hard Drive','GPU'], correct_answer: 'CPU' },
      { subject: 'Computer Science', question: 'What does WWW stand for?', options: ['World Wide Web','Wide World Web','World Whole Web','Web World Wide'], correct_answer: 'World Wide Web' },
      { subject: 'Computer Science', question: 'Which of the following is an input device?', options: ['Monitor','Printer','Speaker','Keyboard'], correct_answer: 'Keyboard' },
      { subject: 'Computer Science', question: 'What is the binary number system base?', options: ['2','8','10','16'], correct_answer: '2' },
      { subject: 'Computer Science', question: 'What is the standard file format for images?', options: ['TXT','MP3','JPEG','PDF'], correct_answer: 'JPEG' },
      { subject: 'Art', question: 'What are the three primary colors?', options: ['Red, Green, Blue','Red, Yellow, Blue','Orange, Green, Purple','Black, White, Grey'], correct_answer: 'Red, Yellow, Blue' },
      { subject: 'Art', question: 'Who painted the famous Mona Lisa?', options: ['Vincent van Gogh','Leonardo da Vinci','Pablo Picasso','Michelangelo'], correct_answer: 'Leonardo da Vinci' },
      { subject: 'Art', question: 'What is a painting of elements like fruit or flowers called?', options: ['Portrait','Landscape','Still Life','Abstract'], correct_answer: 'Still Life' },
      { subject: 'Art', question: 'Which art medium is made from clay and fired in a kiln?', options: ['Sculpture','Ceramics','Origami','Mosaic'], correct_answer: 'Ceramics' },
      { subject: 'Art', question: 'What do you call the thickness or quality of a line in art?', options: ['Shading','Texture','Line Weight','Pattern'], correct_answer: 'Line Weight' },
      { subject: 'PE', question: 'How many players are on the field for one soccer team?', options: ['9','11','15','22'], correct_answer: '11' },
      { subject: 'PE', question: 'Which term refers to a full 360-degree flip in gymnastics?', options: ['Handspring','Salto','Cartwheel','Somersault'], correct_answer: 'Salto' },
      { subject: 'PE', question: 'In basketball, how many points is a regular field goal?', options: ['1','2','3','4'], correct_answer: '2' },
      { subject: 'PE', question: 'What is the standard distance of a marathon race?', options: ['10 miles','13.1 miles','26.2 miles','50 miles'], correct_answer: '26.2 miles' },
      { subject: 'PE', question: 'What is the primary muscle used during breathing?', options: ['Diaphragm','Bicep','Quadricep','Heart'], correct_answer: 'Diaphragm' }
    ];

    const { error } = await supabase.from('quiz_questions').insert(questions);
    if (error) throw error;
    console.log('🌱 Successfully seeded QuizQuestions!');
  } catch (err) {
    console.error('⚠️ Error seeding QuizQuestions:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// SEED: Test accounts (called on server start)
// ─────────────────────────────────────────────────────────────
export async function seedTestAccounts() {
  try {
    const testParentEmail = 'parent@test.com';

    let { data: parent } = await supabase.from('parents').select().eq('email', testParentEmail).maybeSingle();

    if (!parent) {
      console.log('🌱 Seeding test Parent account...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const { data: newParent, error } = await supabase
        .from('parents')
        .insert({ name: 'Test Parent', email: testParentEmail, password: hashedPassword, role: 'parent', phone: '123-456-7890' })
        .select()
        .single();
      if (error) throw error;
      parent = newParent;
      console.log('🌱 Successfully seeded test Parent account!');
    }

    const testChildEmail = 'child@test.com';
    let { data: child } = await supabase.from('children').select().eq('email', testChildEmail).maybeSingle();

    if (!child) {
      console.log('🌱 Seeding test Child account...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const { data: newChild, error } = await supabase
        .from('children')
        .insert({
          parent_id: parent.id,
          name: 'Alex Chen',
          photo: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150',
          age: 10,
          gender: 'Male',
          class: '5th Grade',
          school: 'Oakridge Academy',
          parent_name: parent.name,
          learning_level: 'Intermediate',
          email: testChildEmail,
          username: 'alex123',
          password: hashedPassword,
          role: 'child'
        })
        .select()
        .single();
      if (error) throw error;
      child = newChild;
      console.log('🌱 Successfully seeded test Child account!');
    }

    await seedChildData(parent.id, parent.name);
  } catch (err) {
    console.error('⚠️ Error seeding test accounts:', err.message);
  }
}

export default router;
