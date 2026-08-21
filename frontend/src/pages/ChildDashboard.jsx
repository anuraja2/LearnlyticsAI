import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, BrainCircuit, Mic, Star, 
  Clock, CheckCircle2, Award, Heart, Sparkles, Flame, Droplet, Eye, Activity, ShieldAlert, AlertCircle, BookMarked
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import SOSButton from '../components/SOSButton';
import { fetchChildren, fetchReports, fetchLearningProgress, fetchQuizAttempts } from '../services/api';
import './ChildDashboard.css';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [screenTimeLeft, setScreenTimeLeft] = useState(42);
  const [notifOpen, setNotifOpen] = useState(false);
  const [rewardsPoints, setRewardsPoints] = useState(340);
  const [streakDays, setStreakDays] = useState(5);
  const [breakTaken, setBreakTaken] = useState(false);
  const [activeChild, setActiveChild] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [progressList, setProgressList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('learnlytics_token');
    const role = localStorage.getItem('learnlytics_role');
    if (!token) {
      navigate('/login');
      return;
    }
    if (role !== 'child') {
      navigate('/parent-dashboard');
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async (child = null) => {
    try {
      const kids = await fetchChildren();
      if (kids.length === 0) return;

      let currentChild = child;
      const storedChildId = localStorage.getItem('learnlytics_active_child_id');
      if (!currentChild && storedChildId) {
        currentChild = kids.find(k => k._id === storedChildId);
      }
      if (!currentChild) {
        currentChild = kids[0];
        localStorage.setItem('learnlytics_active_child_id', currentChild._id);
      }

      setActiveChild(currentChild);

      if (currentChild) {
        const reps = await fetchReports(currentChild._id);
        if (reps.length > 0) {
          setLatestReport(reps[0]);
        } else {
          setLatestReport(null);
        }

        const attempts = await fetchQuizAttempts(currentChild._id);
        setQuizAttempts(attempts);
        setRewardsPoints(340 + attempts.length * 10);
        setStreakDays(5 + Math.min(attempts.length, 5));

        const prog = await fetchLearningProgress(currentChild._id);
        setProgressList(prog);
      }
    } catch (e) {
      console.error('ChildDashboard loadDashboardData error', e);
    }
  };

  const handleTakeBreak = () => {
    setBreakTaken(true);
    addNotification({
      category: 'High Screen Time',
      title: 'Healthy Break Completed',
      message: 'Student took a 5-minute eye rest break.'
    });
  };

  return (
    <div className="learnlytics-app-container">
      <Navbar 
        onOpenNotifications={() => setNotifOpen(true)} 
        activeChild={activeChild}
        onSelectChild={(child) => {
          setActiveChild(child);
          localStorage.setItem('learnlytics_active_child_id', child._id);
          loadDashboardData(child);
        }}
      />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          {/* Header Banner */}
          <div className="kid-welcome-card" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '20px', padding: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)' }}>
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                Learnlytics AI Guided Learning 🚀
              </span>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 4px 0' }}>Hi, {activeChild?.name || 'Alex'}! Welcome to Today's Learning!</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Complete your daily story missions and quizzes to earn rewards and stars!</p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <div style={{ textAlign: 'center' }}>
                <Flame size={22} color="#f97316" style={{ margin: '0 auto' }} />
                <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px' }}>{streakDays} Days</strong>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Learning Streak</span>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <Star size={22} color="#facc15" style={{ margin: '0 auto' }} />
                <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px' }}>{rewardsPoints} pts</strong>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>Stars & Badges</span>
              </div>
            </div>
          </div>

          {!latestReport ? (
            /* NO REPORT analyzed yet */
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <BookMarked size={36} color="#7c3aed" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', margin: '0 0 10px 0' }}>Learning Hub Waiting</h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', color: '#6b7280', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 }}>
                "Your personalized learning activities will appear after your parent uploads and analyzes your academic report."
              </p>
            </div>
          ) : (
            /* REPORT exists, show activities & weak quizzes */
            <>
              {/* PLAY TIME, BREAK REMINDER & EMOTION CHECK */}
              <div className="safety-grid" style={{ marginBottom: '28px' }}>
                
                {/* Screen Time & Break Reminder */}
                <div className="safety-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={20} color="#2563eb" />
                      <h3 style={{ margin: 0, fontSize: '15px' }}>Play Time & Break Reminder</h3>
                    </div>
                    <strong style={{ fontSize: '15px', color: '#2563eb' }}>{screenTimeLeft} mins left</strong>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ width: `${(screenTimeLeft / 60) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}></div>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={handleTakeBreak}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '12px' }}
                  >
                    <Eye size={16} color="#059669" />
                    {breakTaken ? '✓ Rested Eyes & Hydrated!' : 'Take 5-Min Eye Rest & Water Break'}
                  </button>
                </div>

                {/* Daily Emotion Check */}
                <div className="safety-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Heart size={20} color="#ec4899" />
                        <h3 style={{ margin: 0, fontSize: '15px' }}>Emotion Check</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>"How are you feeling today?"</p>
                    </div>
                    <Link to="/safety-monitoring" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      Check In &rarr;
                    </Link>
                  </div>
                </div>

                {/* Learning Progress Summary */}
                <div className="safety-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity size={24} color="#10b981" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px' }}>Learning Progress</h3>
                      <strong style={{ fontSize: '18px', color: '#0f172a' }}>
                        {latestReport?.analysis?.overallPercentage || 88}% Average
                      </strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#10b981' }}>{quizAttempts.length} quizzes completed</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RECOMMENDED WEAK-SUBJECT PRACTICE QUIZZES */}
              <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, #fffbeb, #faf5ff)', border: '1.5px solid #fde68a' }}>
                <div className="card-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                    <BrainCircuit size={22} color="#d97706" />
                    Recommended Practice Quizzes for Weak Subjects
                  </h2>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                  {latestReport?.analysis?.weakSubjects?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
                      {latestReport.analysis.weakSubjects.map((sub, i) => (
                        <div key={i} style={{ background: 'white', border: '1px solid #fef3c7', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Needs Focus</span>
                            <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{sub} Improvement Quiz</h4>
                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>Original Report Score: {latestReport.analysis.extractedMarks[sub] || 'N/A'}</p>
                          </div>
                          <button 
                            className="btn-primary" 
                            style={{ background: 'linear-gradient(135deg, #d97706, #7c3aed)', border: 'none', width: '100%', fontSize: '13px' }}
                            onClick={() => navigate(`/quiz-zone?subject=${sub}`)}
                          >
                            Start Practice Quiz &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: '12px 0 0 0', color: '#15803d', fontWeight: 700, fontSize: '14px' }}>
                      🎉 Congratulations! You have mastered all subjects on your report card. Keep up the amazing work! (No weak-subject quizzes needed)
                    </p>
                  )}
                </div>
              </div>

              {/* GUIDED LEARNING MODULES GRID */}
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Guided Learning Modules</h2>
              
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                
                {/* Module 1: Daily Learning */}
                <Link to="/story-learning" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #eff6ff)', border: '1px solid #bfdbfe', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <BookOpen size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>Daily Learning</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Engage in structured daily lessons, concepts, and guided tasks.</p>
                </Link>

                {/* Module 2: AI Quiz */}
                <Link to="/quiz-zone" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #f3e8ff)', border: '1px solid #ddd6fe', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <BrainCircuit size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>AI Quiz Zone</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Fun interactive quizzes in Math, Science, and English!</p>
                </Link>

                {/* Module 3: Story Learning */}
                <Link to="/story-learning" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #ecfdf5)', border: '1px solid #a7f3d0', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <BookOpen size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>Story Learning</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Read & listen to interactive educational adventure stories.</p>
                </Link>

                {/* Module 4: Voice Learning */}
                <Link to="/story-learning" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #fef3c7)', border: '1px solid #fde68a', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Mic size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>Voice Learning</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Listen to audio pronunciation, phonics, and voice exercises.</p>
                </Link>

                {/* Module 5: Rewards & Badges */}
                <Link to="/results" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #fdf2f8)', border: '1px solid #fbcfe8', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Award size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>Rewards & Badges</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>View your unlocked trophies, star points, and certificates.</p>
                </Link>

                {/* Module 6: Learning Progress */}
                <Link to="/results" className="card" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ffffff, #f0fdf4)', border: '1px solid #bbf7d0', transition: 'transform 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Activity size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 6px 0' }}>Learning Progress</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Check your weekly learning performance score.</p>
                </Link>

              </div>
            </>
          )}

        </main>
      </div>

      <SOSButton />
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default ChildDashboard;
