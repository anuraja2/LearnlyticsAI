import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ChildDashboard from './pages/ChildDashboard';
import ChatbotTutor from './pages/ChatbotTutor';
import QuizZone from './pages/QuizZone';
import ParentDashboard from './pages/ParentDashboard';
import ReportAnalysis from './pages/ReportAnalysis';
import AIRecommendations from './pages/AIRecommendations';
import AnalyticsHub from './pages/AnalyticsHub';
import StoryLearning from './pages/StoryLearning';
import ResultPage from './pages/ResultPage';
import SafetyMonitoring from './pages/SafetyMonitoring';

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('learnlytics_token');
  const role = localStorage.getItem('learnlytics_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'child' ? "/child-dashboard" : "/parent-dashboard"} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Child Routes */}
        <Route path="/child-dashboard" element={
          <ProtectedRoute allowedRole="child">
            <ChildDashboard />
          </ProtectedRoute>
        } />
        <Route path="/ai-tutor" element={
          <ProtectedRoute allowedRole="child">
            <ChatbotTutor />
          </ProtectedRoute>
        } />
        <Route path="/quiz-zone" element={
          <ProtectedRoute allowedRole="child">
            <QuizZone />
          </ProtectedRoute>
        } />
        <Route path="/story-learning" element={
          <ProtectedRoute allowedRole="child">
            <StoryLearning />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute allowedRole="child">
            <ResultPage />
          </ProtectedRoute>
        } />

        {/* Parent Routes */}
        <Route path="/parent-dashboard" element={
          <ProtectedRoute allowedRole="parent">
            <ParentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/report-analysis" element={
          <ProtectedRoute allowedRole="parent">
            <ReportAnalysis />
          </ProtectedRoute>
        } />
        <Route path="/ai-recommendations" element={
          <ProtectedRoute allowedRole="parent">
            <AIRecommendations />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute allowedRole="parent">
            <AnalyticsHub />
          </ProtectedRoute>
        } />
        <Route path="/safety-monitoring" element={
          <ProtectedRoute allowedRole="parent">
            <SafetyMonitoring />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
