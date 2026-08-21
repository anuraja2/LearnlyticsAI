import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Award, Star, CheckCircle, ArrowLeft, RotateCcw, 
  TrendingUp, Download, Sparkles, BookOpen, Brain, Clock, ShieldCheck
} from 'lucide-react';
import { fetchChildren, fetchReports, fetchQuizAttempts, fetchLearningProgress } from '../services/api';
import './ResultPage.css';
import SOSButton from '../components/SOSButton';

const ResultPage = () => {
  const [activeChild, setActiveChild] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [progressList, setProgressList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const kids = await fetchChildren();
      if (kids.length === 0) return;

      let currentChild = kids[0];
      const storedChildId = localStorage.getItem('learnlytics_active_child_id');
      if (storedChildId) {
        const found = kids.find(k => k._id === storedChildId);
        if (found) currentChild = found;
      }
      setActiveChild(currentChild);

      if (currentChild) {
        const reps = await fetchReports(currentChild._id);
        if (reps.length > 0) {
          setLatestReport(reps[0]);
        }

        const attempts = await fetchQuizAttempts(currentChild._id);
        setQuizAttempts(attempts);

        const prog = await fetchLearningProgress(currentChild._id);
        setProgressList(prog);
      }
    } catch (e) {
      console.error('ResultPage loadData error', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const averageAccuracy = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((acc, c) => acc + c.percentage, 0) / quizAttempts.length) 
    : 0;

  const totalStars = quizAttempts.length * 10;
  const totalCorrect = quizAttempts.reduce((acc, c) => acc + c.score, 0);
  const totalQuestions = quizAttempts.reduce((acc, c) => acc + c.totalQuestions, 0);

  const subjectBreakdown = progressList.map(prog => ({
    subject: prog.subject,
    score: prog.averageScore,
    icon: prog.subject.toLowerCase().includes('math') ? "🔢" : prog.subject.toLowerCase().includes('science') ? "🔬" : "📚",
    color: prog.subject.toLowerCase().includes('math') ? "#3b82f6" : prog.subject.toLowerCase().includes('science') ? "#10b981" : "#a855f7",
    status: prog.improvementStatus
  }));

  const recentQuizHistory = [...quizAttempts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map((attempt, index) => ({
      id: attempt._id || index,
      title: `${attempt.subject} Practice Quiz`,
      subject: attempt.subject,
      score: `${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)`,
      date: new Date(attempt.date).toLocaleString(),
      badge: attempt.percentage === 100 ? "Perfect Score 🎯" : "Completed 👍",
      status: attempt.percentage >= 60 ? "Pass" : "Practice"
    }));

  const achievements = [
    { title: "Quiz Starter", desc: "Completed 1+ Quiz", icon: "🏆", bg: quizAttempts.length >= 1 ? "#fef3c7" : "#f1f5f9" },
    { title: "Quiz Master", desc: "Completed 5+ Quizzes", icon: "⚡", bg: quizAttempts.length >= 5 ? "#e0e7ff" : "#f1f5f9" },
    { title: "Perfect 100", desc: "Got 100% on a quiz", icon: "🎯", bg: quizAttempts.some(q => q.percentage === 100) ? "#dcfce7" : "#f1f5f9" },
    { title: "Super Star", desc: "Earned 50+ Stars", icon: "⭐", bg: totalStars >= 50 ? "#fae8ff" : "#f1f5f9" }
  ];

  return (
    <div className="result-page-container">
      {/* Top Header */}
      <header className="result-header">
        <Link to="/child-dashboard" className="back-btn-result">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <h1>Performance Results & Report Card</h1>
        <button className="print-btn" onClick={handlePrint}>
          <Download size={18} /> Print Certificate
        </button>
      </header>

      <main className="result-content">
        
        {/* Banner Card */}
        <div className="celebration-card">
          <div className="trophy-badge">
            <Trophy size={64} color="#f59e0b" />
          </div>
          <div className="banner-info">
            <span className="congrats-tag"><Sparkles size={16}/> CONGRATULATIONS!</span>
            <h2>{activeChild?.name || "Student"}'s Learning Performance</h2>
            <p>You are performing exceptionally well! Keep up the brilliant effort.</p>
            <div className="grade-pill">{latestReport?.analysis ? `Academic Grade: ${latestReport.analysis.grade}` : 'Learning Active'}</div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="result-stats-grid">
          <div className="result-stat-card">
            <div className="stat-icon bg-blue"><CheckCircle size={28} color="#3b82f6"/></div>
            <div className="stat-data">
              <span className="stat-label">Practice Accuracy</span>
              <h3 className="stat-val">{averageAccuracy}%</h3>
            </div>
          </div>
          
          <div className="result-stat-card">
            <div className="stat-icon bg-amber"><Star size={28} color="#f59e0b" fill="#f59e0b"/></div>
            <div className="stat-data">
              <span className="stat-label">Total Stars Earned</span>
              <h3 className="stat-val">{totalStars} ⭐</h3>
            </div>
          </div>

          <div className="result-stat-card">
            <div className="stat-icon bg-emerald"><Brain size={28} color="#10b981"/></div>
            <div className="stat-data">
              <span className="stat-label">Correct Answers</span>
              <h3 className="stat-val">{totalCorrect} / {totalQuestions}</h3>
            </div>
          </div>

          <div className="result-stat-card">
            <div className="stat-icon bg-purple"><Clock size={28} color="#a855f7"/></div>
            <div className="stat-data">
              <span className="stat-label">Practice Quizzes</span>
              <h3 className="stat-val">{quizAttempts.length} Completed</h3>
            </div>
          </div>
        </div>

        {/* Grid: Subject Breakdown + Achievements */}
        <div className="result-grid-row">
          
          {/* Subject Performance Breakdown */}
          <div className="card-box flex-2">
            <div className="box-header">
              <TrendingUp size={20} className="text-blue" />
              <h3>Subject Score Breakdown</h3>
            </div>
            <div className="subject-list">
              {subjectBreakdown.length > 0 ? (
                subjectBreakdown.map((sub, index) => (
                  <div key={index} className="subject-row">
                    <div className="subject-left">
                      <span className="sub-emoji">{sub.icon}</span>
                      <div className="sub-title">
                        <strong>{sub.subject}</strong>
                        <small>{sub.status}</small>
                      </div>
                    </div>
                    <div className="subject-right">
                      <div className="bar-wrapper">
                        <div className="bar-fill" style={{ width: `${sub.score}%`, backgroundColor: sub.color }}></div>
                      </div>
                      <span className="score-num" style={{ color: sub.color }}>{sub.score}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  No practice quizzes taken yet.
                </p>
              )}
            </div>
          </div>

          {/* Badges Unlocked */}
          <div className="card-box flex-1">
            <div className="box-header">
              <Award size={20} className="text-amber" />
              <h3>Badges Unlocked</h3>
            </div>
            <div className="badges-grid">
              {achievements.map((ach, idx) => (
                <div key={idx} className="badge-card-item" style={{ backgroundColor: ach.bg }}>
                  <span className="badge-emoji">{ach.icon}</span>
                  <h4>{ach.title}</h4>
                  <p>{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Quiz Attempts Table */}
        <div className="card-box mt-24">
          <div className="box-header">
            <BookOpen size={20} className="text-purple" />
            <h3>Recent Quiz Performance History</h3>
          </div>
          <div className="table-container">
            {recentQuizHistory.length > 0 ? (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Quiz Topic</th>
                    <th>Subject</th>
                    <th>Date & Time</th>
                    <th>Score</th>
                    <th>Reward Badge</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuizHistory.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.title}</strong></td>
                      <td><span className="tag-pill">{item.subject}</span></td>
                      <td>{item.date}</td>
                      <td><strong className="text-emerald">{item.score}</strong></td>
                      <td><span className="badge-pill">{item.badge}</span></td>
                      <td><span className="status-pass"><ShieldCheck size={14}/> {item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                Take your first weak subject quiz in the Quiz Zone to record progress here.
              </p>
            )}
          </div>
        </div>

        {/* AI Encouragement Box */}
        <div className="ai-feedback-banner">
          <Sparkles size={28} className="sparkle-icon" />
          <div className="ai-feedback-text">
            <h4>AI Tutor Guidance</h4>
            <p>
              {latestReport?.analysis?.finalAISummary || 
               "Good job practicing! Complete recommended quizzes to improve weak subjects."}
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="result-actions-footer">
          <Link to="/quiz-zone" className="action-btn-primary">
            <RotateCcw size={20} /> Take Another Quiz
          </Link>
          <Link to="/child-dashboard" className="action-btn-secondary">
            Return to Dashboard
          </Link>
        </div>

      </main>

      <SOSButton />
    </div>
  );
};

export default ResultPage;
