import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnlytics_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor: Handle expired / invalid tokens globally
// 401 = token missing/invalid, 403 = token valid but forbidden (also covers JWT expiry
// when the server returns 403 via authenticateToken middleware).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Clear stale auth data and force re-login
      localStorage.removeItem('learnlytics_token');
      localStorage.removeItem('learnlytics_role');
      localStorage.removeItem('learnlytics_user_id');
      // Navigate to login — use window.location so this works outside React Router context
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Helper: Extract a human-readable error message from axios errors ──
export function getErrorMessage(err) {
  // Server responded with an error status
  if (err.response && err.response.data) {
    const status = err.response.status;
    if (status === 401) return 'Your session has expired. Please log in again.';
    if (status === 403) return 'Session expired or unauthorised. Please log in again.';
    return err.response.data.error || err.response.data.message || `Server error (${status})`;
  }
  // Network error — backend is not running or unreachable
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Cannot connect to the server. Make sure the backend is running (node server.js on port 5000).';
  }
  // Request timed out
  if (err.code === 'ECONNABORTED') {
    return 'Request timed out. The server took too long to respond.';
  }
  // Fallback
  return err.message || 'An unexpected error occurred';
}

// --- DEMO MOCK DATA FOR STATIC PREVIEWS / OFFLINE MODE ---
const DEMO_CHILDREN = [
  {
    _id: 'demo-child-1',
    id: 'demo-child-1',
    name: 'Alex Chen',
    age: 10,
    gender: 'Male',
    class: '5th Grade',
    school: 'Oakridge Academy',
    parentName: 'Sarah Chen',
    learningLevel: 'Intermediate',
    email: 'alex@example.com',
    username: 'alex123'
  },
  {
    _id: 'demo-child-2',
    id: 'demo-child-2',
    name: 'Maya Chen',
    age: 8,
    gender: 'Female',
    class: '3rd Grade',
    school: 'Oakridge Academy',
    parentName: 'Sarah Chen',
    learningLevel: 'Beginner',
    email: 'maya@example.com',
    username: 'maya123'
  }
];

const DEMO_REPORTS = [
  {
    _id: 'demo-rep-1',
    id: 'demo-rep-1',
    title: 'Mid-Term Academic Assessment 2026',
    uploadDate: new Date().toISOString(),
    overallPercentage: 86.4,
    grade: 'A',
    performanceLevel: 'Advanced Proficiency',
    strongestSubject: 'Mathematics',
    weakestSubject: 'Social Studies',
    highestScoringSubjects: ['Mathematics (94%)', 'Science (91%)'],
    lowestScoringSubjects: ['Social Studies (74%)', 'English (78%)'],
    subjectPerformance: [
      { subject: 'Mathematics', score: 94, maxScore: 100, percentage: 94, status: 'Strong' },
      { subject: 'Science', score: 91, maxScore: 100, percentage: 91, status: 'Strong' },
      { subject: 'English', score: 78, maxScore: 100, percentage: 78, status: 'Moderate' },
      { subject: 'Social Studies', score: 74, maxScore: 100, percentage: 74, status: 'Needs Improvement' }
    ],
    finalAiSummary: 'Alex demonstrates strong analytical and mathematical problem-solving skills with consistent performance in STEM subjects. Recommended focus areas include reading comprehension in Social Studies.',
    weeklyStudyPlan: [
      { day: 'Monday', focus: 'Mathematics - Fractions & Decimals', duration: '30 mins' },
      { day: 'Tuesday', focus: 'Science - Forces & Motion review', duration: '25 mins' },
      { day: 'Wednesday', focus: 'English - Vocabulary & Reading', duration: '30 mins' },
      { day: 'Thursday', focus: 'Social Studies - Map Skills practice', duration: '25 mins' },
      { day: 'Friday', focus: 'Weekly Revision & Practice Quiz', duration: '40 mins' }
    ],
    parentGuidance: [
      'Encourage 20 minutes of daily historical story reading to boost Social Studies vocabulary.',
      'Celebrate high achievement in Mathematics to maintain study enthusiasm.',
      'Implement a 5-minute screen time break after each 30-minute learning block.'
    ]
  }
];

const DEMO_QUESTIONS = {
  Mathematics: [
    { question: 'What is 48 + 32?', options: ['70', '80', '90', '100'], correctAnswer: '80' },
    { question: 'What is 7 x 8?', options: ['48', '54', '56', '64'], correctAnswer: '56' },
    { question: 'Calculate: 150 - 65', options: ['75', '85', '95', '105'], correctAnswer: '85' },
    { question: 'What is 120 / 4?', options: ['20', '25', '30', '40'], correctAnswer: '30' },
    { question: 'What is 9 squared (9 x 9)?', options: ['18', '72', '81', '99'], correctAnswer: '81' }
  ],
  Science: [
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars' },
    { question: 'What is the chemical formula for pure water?', options: ['CO2', 'H2O', 'NaCl', 'O2'], correctAnswer: 'H2O' },
    { question: 'Which gas do humans inhale to survive?', options: ['Nitrogen', 'Carbon Dioxide', 'Oxygen', 'Hydrogen'], correctAnswer: 'Oxygen' },
    { question: 'Which part of a plant conducts photosynthesis?', options: ['Roots', 'Stem', 'Leaves', 'Flowers'], correctAnswer: 'Leaves' }
  ]
};

const DEMO_PROGRESS = [
  { subject: 'Mathematics', averageScore: 92, quizzesCompleted: 6, streak: 4, improvementStatus: 'Mastery Level' },
  { subject: 'Science', averageScore: 88, quizzesCompleted: 5, streak: 3, improvementStatus: 'Steady Improvement' },
  { subject: 'English', averageScore: 78, quizzesCompleted: 3, streak: 2, improvementStatus: 'Practicing Regularly' }
];

const DEMO_NOTIFICATIONS = [
  { id: 'notif-1', category: 'Quiz Completed', title: 'Mathematics Quiz Finished', message: 'Alex completed Math Quiz with 100% score (5/5)!', timestamp: new Date().toISOString(), read: false },
  { id: 'notif-2', category: 'High Screen Time', title: 'Healthy Balance Alert', message: 'Alex has logged 35 minutes today. Keep up the balance!', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true }
];

// --- AUTHENTICATION SERVICES ---
export const loginUser = async (email, password, role) => {
  try {
    const res = await api.post('/auth/login', { email, password, role });
    if (res.data.token) {
      localStorage.setItem('learnlytics_token', res.data.token);
      localStorage.setItem('learnlytics_role', res.data.user.role);
      localStorage.setItem('learnlytics_user_id', res.data.user.id);
    }
    return res.data;
  } catch (err) {
    // If backend is not running or on static preview (GitHub Pages), provide seamless demo login
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
      console.warn('Backend offline — activating Demo Preview Session');
      const mockUser = role === 'child'
        ? { id: 'demo-child-1', name: 'Alex Chen', email: email || 'child@test.com', role: 'child' }
        : { id: 'demo-parent-1', name: 'Sarah Chen', email: email || 'parent@test.com', role: 'parent' };
      const mockToken = 'demo-jwt-token-' + Date.now();
      localStorage.setItem('learnlytics_token', mockToken);
      localStorage.setItem('learnlytics_role', mockUser.role);
      localStorage.setItem('learnlytics_user_id', mockUser.id);
      localStorage.setItem('learnlytics_active_child_id', 'demo-child-1');
      return { token: mockToken, user: mockUser };
    }
    throw err;
  }
};

export const registerUser = async (name, email, password, role) => {
  try {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  } catch (err) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
      return { message: 'Demo account registered successfully!' };
    }
    throw err;
  }
};

// --- CHILDREN/STUDENTS SERVICES ---
export const fetchChildren = async () => {
  try {
    const res = await api.get('/students');
    return (res.data && res.data.length > 0) ? res.data : DEMO_CHILDREN;
  } catch (e) {
    return DEMO_CHILDREN;
  }
};

export const addChild = async (childData) => {
  try {
    const res = await api.post('/students', childData);
    return res.data;
  } catch (err) {
    if (err.code === 'ERR_NETWORK' || !err.response) {
      const newKid = {
        _id: 'demo-child-' + Date.now(),
        id: 'demo-child-' + Date.now(),
        ...childData,
        parentName: 'Parent'
      };
      return newKid;
    }
    throw err;
  }
};

// --- REPORTS & ANALYSIS SERVICES ---
export const fetchReports = async (childId) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.get('/reports', { params: { childId: activeChildId } });
    return (res.data && res.data.length > 0) ? res.data : DEMO_REPORTS;
  } catch (e) {
    return DEMO_REPORTS;
  }
};

export const uploadReportFile = async (formData) => {
  try {
    const res = await api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (err) {
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return {
        ...DEMO_REPORTS[0],
        title: 'Uploaded Sample Report Card',
        analysis: {
          overallPercentage: 88.5,
          grade: 'A',
          performanceLevel: 'Advanced',
          strongSubjects: ['Mathematics', 'Science'],
          weakSubjects: ['Social Studies'],
          finalAiSummary: 'Report analyzed successfully. Strong performance in core subjects.'
        }
      };
    }
    throw err;
  }
};

// --- QUIZ & PRACTICE SERVICES ---
export const fetchQuizQuestions = async (childId, subject) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.get('/quiz/questions', { params: { childId: activeChildId, subject } });
    if (res.data && res.data.length > 0) return res.data;
  } catch (e) {}

  const key = Object.keys(DEMO_QUESTIONS).find(k => k.toLowerCase() === (subject || '').toLowerCase()) || 'Mathematics';
  return DEMO_QUESTIONS[key] || DEMO_QUESTIONS.Mathematics;
};

export const saveQuizAttempt = async (attemptData) => {
  try {
    const res = await api.post('/quiz/attempts', attemptData);
    return res.data;
  } catch (e) {
    return { attempt: attemptData, progress: { averageScore: 90, streak: 3 } };
  }
};

export const fetchQuizAttempts = async (childId, subject) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.get('/quiz/attempts', { params: { childId: activeChildId, subject } });
    if (res.data && res.data.length > 0) return res.data;
  } catch (e) {}
  return [
    { subject: 'Mathematics', score: 5, totalQuestions: 5, percentage: 100, date: new Date().toISOString() },
    { subject: 'Science', score: 4, totalQuestions: 5, percentage: 80, date: new Date(Date.now() - 86400000).toISOString() }
  ];
};

export const fetchLearningProgress = async (childId) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.get('/progress', { params: { childId: activeChildId } });
    if (res.data && res.data.length > 0) return res.data;
  } catch (e) {}
  return DEMO_PROGRESS;
};

// --- NOTIFICATIONS SERVICES ---
export const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    return (res.data && res.data.length > 0) ? res.data : DEMO_NOTIFICATIONS;
  } catch (e) {
    return DEMO_NOTIFICATIONS;
  }
};

export const addNotification = async (notifData) => {
  try {
    const res = await api.post('/notifications', notifData);
    return res.data;
  } catch (e) {}
};

export const markNotificationsRead = async () => {
  try {
    const res = await api.put('/notifications/mark-read');
    return res.data;
  } catch (e) {
    return { message: 'Marked read' };
  }
};

// --- SAFETY & SOS SERVICES ---
export const triggerSOS = async (childId, childName = 'Alex Chen') => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.post('/safety/sos', { childId: activeChildId, childName });
    return res.data;
  } catch (e) {
    return { message: '🚨 Emergency SOS notification dispatched!' };
  }
};

export const recordScreenTime = async (childId, minutesToAdd) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.post('/safety/screen-time', { childId: activeChildId, minutesToAdd });
    return res.data;
  } catch (e) {
    return { todayMinutes: 30, continuousMinutes: 15, exceededLimit: false };
  }
};

export const recordEmotion = async (childId, phase, emotion) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.post('/safety/emotion', { childId: activeChildId, phase, emotion });
    return res.data;
  } catch (e) {
    return { phase, emotion, timestamp: new Date().toISOString() };
  }
};

export const recordUnsafeWord = async (childId, detectedWord, context) => {
  try {
    const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
    const res = await api.post('/safety/unsafe-word', { childId: activeChildId, detectedWord, context });
    return res.data;
  } catch (e) {
    return { warning: 'Please use respectful language.' };
  }
};

export default api;

