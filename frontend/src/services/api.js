import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

// --- AUTHENTICATION SERVICES ---
export const loginUser = async (email, password, role) => {
  const res = await api.post('/auth/login', { email, password, role });
  if (res.data.token) {
    localStorage.setItem('learnlytics_token', res.data.token);
    localStorage.setItem('learnlytics_role', res.data.user.role);
    localStorage.setItem('learnlytics_user_id', res.data.user.id);
  }
  return res.data;
};

export const registerUser = async (name, email, password, role) => {
  const res = await api.post('/auth/register', { name, email, password, role });
  return res.data;
};

// --- CHILDREN/STUDENTS SERVICES ---
export const fetchChildren = async () => {
  try {
    const res = await api.get('/students');
    return res.data;
  } catch (e) {
    console.error('fetchChildren API error, using localStorage fallback', e);
    // Return empty list so page does not crash
    return [];
  }
};

export const addChild = async (childData) => {
  const res = await api.post('/students', childData);
  return res.data;
};

// --- REPORTS & ANALYSIS SERVICES ---
export const fetchReports = async (childId) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  if (!activeChildId) return [];
  const res = await api.get('/reports', { params: { childId: activeChildId } });
  return res.data;
};

export const uploadReportFile = async (formData) => {
  const res = await api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// --- QUIZ & PRACTICE SERVICES ---
export const fetchQuizQuestions = async (childId, subject) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.get('/quiz/questions', { params: { childId: activeChildId, subject } });
  return res.data;
};

export const saveQuizAttempt = async (attemptData) => {
  const res = await api.post('/quiz/attempts', attemptData);
  return res.data;
};

export const fetchQuizAttempts = async (childId, subject) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.get('/quiz/attempts', { params: { childId: activeChildId, subject } });
  return res.data;
};

export const fetchLearningProgress = async (childId) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.get('/progress', { params: { childId: activeChildId } });
  return res.data;
};

// --- NOTIFICATIONS SERVICES ---
export const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (e) {
    return [];
  }
};

export const addNotification = async (notifData) => {
  try {
    const res = await api.post('/notifications', notifData);
    return res.data;
  } catch (e) {
    console.error('Failed to add notification', e);
  }
};

export const markNotificationsRead = async () => {
  try {
    const res = await api.put('/notifications/mark-read');
    return res.data;
  } catch (e) {
    return [];
  }
};

// --- SAFETY & SOS SERVICES ---
export const triggerSOS = async (childId, childName = 'Alex Chen') => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.post('/safety/sos', { childId: activeChildId, childName });
  return res.data;
};

export const recordScreenTime = async (childId, minutesToAdd) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.post('/safety/screen-time', { childId: activeChildId, minutesToAdd });
  return res.data;
};

export const recordEmotion = async (childId, phase, emotion) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.post('/safety/emotion', { childId: activeChildId, phase, emotion });
  return res.data;
};

export const recordUnsafeWord = async (childId, detectedWord, context) => {
  const activeChildId = childId || localStorage.getItem('learnlytics_active_child_id');
  const res = await api.post('/safety/unsafe-word', { childId: activeChildId, detectedWord, context });
  return res.data;
};

export default api;
