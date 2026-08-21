import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BrainCircuit, Star, Award, ChevronRight, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import SOSButton from '../components/SOSButton';
import { fetchQuizQuestions, saveQuizAttempt, fetchChildren, fetchReports } from '../services/api';
import './QuizZone.css';

const QuizZone = () => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [gameState, setGameState] = useState('setup'); // setup, playing, results
  const [subject, setSubject] = useState('Mathematics');
  const [score, setScore] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('learnlytics_role', 'child');
    
    // Check URL parameter for subject
    const queryParams = new URLSearchParams(window.location.search);
    const subParam = queryParams.get('subject');
    if (subParam) {
      if (subParam.toLowerCase().includes('math')) {
        setSubject('Mathematics');
      } else if (subParam.toLowerCase().includes('science')) {
        setSubject('Science');
      } else if (subParam.toLowerCase().includes('english')) {
        setSubject('English');
      } else {
        setSubject(subParam);
      }
    }

    loadActiveChild();
  }, []);

  const loadActiveChild = async () => {
    try {
      const kids = await fetchChildren();
      if (kids.length > 0) {
        let currentChild = kids[0];
        const storedChildId = localStorage.getItem('learnlytics_active_child_id');
        if (storedChildId) {
          const found = kids.find(k => k._id === storedChildId);
          if (found) currentChild = found;
        }
        setActiveChild(currentChild);

        // Fetch reports to find the weak subjects of the latest report card
        const reports = await fetchReports(currentChild._id);
        if (reports && reports.length > 0) {
          const latest = reports[0];
          const weak = latest.analysis?.weakSubjects || latest.lowestScoringSubjects || [];
          setWeakSubjects(weak);
          
          // If a subject is not specified in query params, default to first weak subject
          const queryParams = new URLSearchParams(window.location.search);
          const subParam = queryParams.get('subject');
          if (!subParam && weak.length > 0) {
            setSubject(weak[0]);
          }
        }
      }
    } catch (e) {
      console.error('QuizZone loadActiveChild error', e);
    }
  };

  const handleStart = async () => {
    setError('');
    try {
      const childId = activeChild?._id || localStorage.getItem('learnlytics_active_child_id');
      const data = await fetchQuizQuestions(childId, subject);
      if (!data || data.length === 0) {
        setError(`No seed questions loaded for ${subject} yet. Please check back later or try another subject.`);
        return;
      }
      
      // Map DB fields (question, correctAnswer) to frontend fields (questionText, answer)
      const mappedQuestions = data.map(q => ({
        ...q,
        questionText: q.questionText || q.question || '',
        answer: q.answer || q.correctAnswer || ''
      }));

      setQuestions(mappedQuestions);
      setScore(0);
      setCurrentQIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState('playing');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quiz questions. Please try again.');
    }
  };

  const handleAnswer = (option) => {
    if (selectedAnswer !== null || isSaving) return;
    
    setSelectedAnswer(option);
    const currentQ = questions[currentQIndex];
    const correct = option === currentQ.answer;
    setIsCorrect(correct);
    
    let finalScore = score;
    if (correct) {
      finalScore = score + 1;
      setScore(finalScore);
    }

    setTimeout(async () => {
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setIsSaving(true);
        try {
          if (activeChild) {
            await saveQuizAttempt({
              childId: activeChild._id,
              subject,
              score: finalScore,
              totalQuestions: questions.length
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSaving(false);
          setGameState('results');
        }
      }
    }, 1500);
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="learnlytics-app-container">
      <Navbar 
        onOpenNotifications={() => setNotifOpen(true)} 
        activeChild={activeChild}
        onSelectChild={(child) => {
          setActiveChild(child);
          localStorage.setItem('learnlytics_active_child_id', child._id);
        }}
      />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Daily AI Quiz Zone</h1>
              <p className="page-subtitle">Interactive subject challenges with real-time scoring and star rewards.</p>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '12px', color: '#b91c1c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {gameState === 'setup' && (
            <div className="setup-view">
              <div className="setup-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2>Choose a Subject!</h2>
                <div className="subject-options" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {weakSubjects.length > 0 ? (
                    weakSubjects.map(sub => (
                      <button 
                        key={sub}
                        className={`sub-btn ${subject === sub ? 'selected' : ''}`}
                        onClick={() => setSubject(sub)}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          border: subject === sub ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: subject === sub ? '#eff6ff' : 'white',
                          color: subject === sub ? '#2563eb' : '#475569',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {sub}
                      </button>
                    ))
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                      No weak subjects detected on your report card. No practice quizzes needed!
                    </p>
                  )}
                </div>
                
                <div className="difficulty-section" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>Difficulty Level:</label>
                  <select className="level-select" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                    <option>Level 1 (Ages 6-8)</option>
                    <option>Level 2 (Ages 9-10)</option>
                    <option>Level 3 (Ages 11-12)</option>
                  </select>
                </div>

                <button className="start-btn" onClick={handleStart} style={{ marginTop: '24px', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}>
                  Start Quiz! <ChevronRight size={24}/>
                </button>
              </div>
            </div>
          )}

          {gameState === 'playing' && currentQ && (
            <div className="playing-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="quiz-progress" style={{ marginBottom: '20px' }}>
                <div className="progress-bar-quiz" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div 
                    className="progress-fill-quiz" 
                    style={{width: `${((currentQIndex) / questions.length) * 100}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s'}}
                  ></div>
                </div>
                <span className="q-counter" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Question {currentQIndex + 1} of {questions.length}</span>
              </div>

              <div className="question-card" style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                <h2 className="question-text" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>{currentQ.questionText}</h2>
                <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQ.options.map(opt => {
                    let btnStyle = {
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      textAlign: 'left',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    };

                    if (selectedAnswer === opt) {
                      btnStyle.background = isCorrect ? '#dcfce7' : '#fee2e2';
                      btnStyle.borderColor = isCorrect ? '#86efac' : '#fca5a5';
                      btnStyle.color = isCorrect ? '#15803d' : '#b91c1c';
                    }

                    return (
                      <button 
                        key={opt} 
                        style={btnStyle}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedAnswer !== null}
                      >
                        <span>{opt}</span>
                        {selectedAnswer === opt && isCorrect && <CheckCircle2 size={18} color="#15803d"/>}
                        {selectedAnswer === opt && !isCorrect && <XCircle size={18} color="#b91c1c"/>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {gameState === 'results' && (
            <div className="results-view celebration-bg" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="results-card" style={{ background: 'white', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' }}>
                <div className="trophy-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Quiz Complete!</h2>
                <p className="score-text" style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb', margin: '0 0 16px 0' }}>
                  You scored {score} out of {questions.length}!
                </p>
                
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px', textAlign: 'left' }}>
                  <strong>⚠️ Note for Parents & Students:</strong> Your practice score has been saved separately and does not change your formal report card grades.
                </div>

                <div className="rewards" style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Rewards Earned:</h3>
                  <div className="reward-badges" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {score > 0 && (
                      <span className="reward-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
                        <Star size={14} fill="#fbbf24" color="#d97706"/> +{score * 10} Points
                      </span>
                    )}
                    {score === questions.length && (
                      <span className="reward-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
                        <Award size={14} fill="#60a5fa" color="#2563eb"/> Perfect Badge!
                      </span>
                    )}
                  </div>
                </div>

                <div className="results-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button className="play-again-btn" onClick={() => { setGameState('setup'); setQuestions([]); setSelectedAnswer(null); setIsCorrect(null); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                    Play Again
                  </button>
                  <button className="play-again-btn" onClick={() => navigate('/child-dashboard')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}>
                    Student Home
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <SOSButton />
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default QuizZone;
