import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  ShieldAlert, Activity, Clock, Bell, User, LayoutDashboard, 
  TrendingUp, AlertOctagon, BookOpen, Brain, FileSpreadsheet, Sparkles, Plus, Download, UserPlus, Heart, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import { fetchChildren, addChild, fetchReports, triggerSOS, fetchQuizAttempts, fetchLearningProgress } from '../services/api';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // Add child form state
  const [newChild, setNewChild] = useState({
    name: '',
    age: 10,
    gender: 'Male',
    class: '5th Grade',
    school: 'Oakridge Academy',
    parentName: '',
    learningLevel: 'Intermediate',
    email: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('learnlytics_token');
    const role = localStorage.getItem('learnlytics_role');
    if (!token) {
      navigate('/login');
      return;
    }
    if (role !== 'parent') {
      navigate('/child-dashboard');
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async (child = null) => {
    const kids = await fetchChildren();
    setChildrenList(kids);
    
    let currentChild = child;
    const storedChildId = localStorage.getItem('learnlytics_active_child_id');
    if (!currentChild && storedChildId) {
      currentChild = kids.find(k => k._id === storedChildId);
    }
    if (!currentChild && kids.length > 0) {
      currentChild = kids[0];
      localStorage.setItem('learnlytics_active_child_id', currentChild._id);
    }
    
    setActiveChild(currentChild);

    if (currentChild) {
      const reps = await fetchReports(currentChild._id);
      setReportsList(reps);
      if (reps.length > 0) {
        setLatestReport(reps[0]);
      } else {
        setLatestReport(null);
      }

      const attempts = await fetchQuizAttempts(currentChild._id);
      setQuizAttempts(attempts);

      const prog = await fetchLearningProgress(currentChild._id);
      setProgressList(prog);
    }
  };

  const handleAddChildSubmit = async (e) => {
    e.preventDefault();
    try {
      const addedChild = await addChild(newChild);
      setShowAddChildModal(false);
      setNewChild({
        name: '',
        age: 10,
        gender: 'Male',
        class: '5th Grade',
        school: 'Oakridge Academy',
        parentName: '',
        learningLevel: 'Intermediate',
        email: '',
        username: '',
        password: ''
      });
      localStorage.setItem('learnlytics_active_child_id', addedChild._id);
      await loadDashboardData(addedChild);
    } catch (err) {
      console.error('Failed to add child profile', err);
      const msg = err.response?.data?.error || err.message || 'Failed to add child profile. Please check that the server is running and try again.';
      // Clear the email/username fields so retrying doesn't re-submit conflicting values
      setNewChild(prev => ({ ...prev, email: '', username: '' }));
      alert(msg);
    }
  };

  // Format practice attempt data for Recharts line chart
  const getAttemptsChartData = () => {
    if (quizAttempts.length === 0) {
      return [
        { name: 'No attempts', Math: 0, English: 0, Science: 0 }
      ];
    }
    
    // Sort attempts chronologically
    const sorted = [...quizAttempts].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Build attempts history points
    const data = sorted.slice(-10).map((attempt, index) => {
      const point = { name: `Quiz ${index + 1}` };
      point[attempt.subject] = attempt.percentage;
      return point;
    });
    return data;
  };

  const weeklyScreenTimeData = [
    { name: 'Mon', ScreenTime: 45 },
    { name: 'Tue', ScreenTime: 50 },
    { name: 'Wed', ScreenTime: 40 },
    { name: 'Thu', ScreenTime: 60 },
    { name: 'Fri', ScreenTime: 35 },
    { name: 'Sat', ScreenTime: 120 },
    { name: 'Sun', ScreenTime: 90 },
  ];

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
          {/* Header Bar */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Parent Dashboard</h1>
              <p className="page-subtitle">Learnlytics AI SaaS Executive Overview for Student Performance & Well-being</p>
            </div>
            <div className="header-action-group">
              <button className="btn-secondary" onClick={() => setShowAddChildModal(true)}>
                <UserPlus size={16} /> Add Child Profile
              </button>
              <button className="btn-primary" onClick={() => navigate('/report-analysis')}>
                <FileSpreadsheet size={16} /> Upload Student Report
              </button>
            </div>
          </div>

          {/* Selected Child Alert if none */}
          {!activeChild && (
            <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
              <h3>No child profile found.</h3>
              <p style={{ color: '#4b5563', margin: '8px 0 16px 0' }}>Please create a child profile to get started.</p>
              <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setShowAddChildModal(true)}>
                <UserPlus size={16} /> Add Child Profile
              </button>
            </div>
          )}

          {activeChild && (
            <>
              {/* TOP 4 KPI CARDS */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon bg-blue"><User size={24} color="#2563eb"/></div>
                  <div className="kpi-info">
                    <p>Student Profile</p>
                    <h3>{activeChild.name}</h3>
                    <span className="trend positive"><TrendingUp size={14}/> {activeChild.class} • {activeChild.school}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-purple"><FileSpreadsheet size={24} color="#7c3aed"/></div>
                  <div className="kpi-info">
                    <p>Report Cards</p>
                    <h3>{reportsList.length} <small>Files</small></h3>
                    <span className="trend positive"><Sparkles size={14}/> History Preserved</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-green"><Brain size={24} color="#10b981"/></div>
                  <div className="kpi-info">
                    <p>Academic Level</p>
                    <h3>{latestReport ? `${latestReport.analysis?.overallPercentage}%` : 'N/A'}</h3>
                    <span className="trend positive"><Award size={14}/> {latestReport ? `Grade ${latestReport.analysis?.grade}` : 'No report card'}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-red"><ShieldAlert size={24} color="#dc2626"/></div>
                  <div className="kpi-info">
                    <p>Practice Quizzes</p>
                    <h3>{quizAttempts.length} <small>Completed</small></h3>
                    <span className="trend positive"><Activity size={14}/> Weak Subjects Targeted</span>
                  </div>
                </div>
              </div>

              {/* LEARNING SECTION */}
              <div className="section-title-row">
                <h2><Brain size={22} color="#2563eb" /> Learning & Academic Performance</h2>
                <Link to="/analytics" className="section-link">View Full Analytics &rarr;</Link>
              </div>

              <div className="dashboard-grid">
                {/* Performance Chart */}
                <div className="card col-span-2">
                  <div className="card-header">
                    <h2>Quiz Practice History ({activeChild.name})</h2>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={getAttemptsChartData()}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={[0, 100]} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                        <Line type="monotone" dataKey="Mathematics" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} connectNulls />
                        <Line type="monotone" dataKey="Science" stroke="#10b981" strokeWidth={3} dot={{r:4}} connectNulls />
                        <Line type="monotone" dataKey="English" stroke="#8b5cf6" strokeWidth={3} dot={{r:4}} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Subject Breakdown & AI Recommendations */}
                <div className="card">
                  <div className="card-header">
                    <h2>Subject Analysis & Insights</h2>
                  </div>
                  <div className="subject-pills">
                    <div className="subject-box strong">
                      <h4>Strong Subjects (&ge;80%)</h4>
                      <ul>
                        {latestReport?.analysis?.strongSubjects?.length > 0 ? (
                          latestReport.analysis.strongSubjects.map((sub, i) => (
                            <li key={i}>✓ {sub}</li>
                          ))
                        ) : (
                          <li style={{ color: '#64748b', fontSize: '13px' }}>None identified yet.</li>
                        )}
                      </ul>
                    </div>
                    <div className="subject-box weak">
                      <h4>Weak Subjects (&lt;60%)</h4>
                      <ul>
                        {latestReport?.analysis?.weakSubjects?.length > 0 ? (
                          latestReport.analysis.weakSubjects.map((sub, i) => (
                            <li key={i}>⚠️ {sub}</li>
                          ))
                        ) : (
                          <li style={{ color: '#64748b', fontSize: '13px' }}>None identified yet! 🎉</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="ai-rec-box">
                    <h4><Sparkles size={16} color="#7c3aed" /> AI Recommendation</h4>
                    <p style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      {latestReport?.analysis?.finalAISummary || 
                       "Please upload a student report card to begin automatic AI learning recommendations and focus schedules."}
                    </p>
                  </div>
                </div>
              </div>

              {/* PRACTICE COMPARISON SECTION */}
              <div className="card mt-24" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <h2>Original Report Card VS Practice Quiz Performance</h2>
                </div>
                <div className="table-container" style={{ padding: '0 20px 20px 20px' }}>
                  {latestReport && latestReport.analysis ? (
                    <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '12px' }}>Subject</th>
                          <th style={{ padding: '12px' }}>Original Report Mark (Academic)</th>
                          <th style={{ padding: '12px' }}>Practice Average (Interactive Quizzes)</th>
                          <th style={{ padding: '12px' }}>Improvement Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestReport.analysis.subjectPerformance.map((sub, idx) => {
                          const progressRec = progressList.find(p => p.subject.toLowerCase() === sub.subject.toLowerCase());
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontWeight: 700 }}>{sub.subject}</td>
                              <td style={{ padding: '12px', color: '#475569' }}>
                                <strong>{sub.score}/{sub.maxScore || 100}</strong> ({sub.percentage}%)
                              </td>
                              <td style={{ padding: '12px', color: '#2563eb', fontWeight: 700 }}>
                                {progressRec ? `${progressRec.averageScore}% (${progressRec.quizzesCompleted} quiz attempts)` : 'No practice yet'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ 
                                  background: progressRec?.improvementStatus?.includes('improving') ? '#dcfce7' : '#f1f5f9', 
                                  color: progressRec?.improvementStatus?.includes('improving') ? '#166534' : '#475569', 
                                  padding: '4px 8px', 
                                  borderRadius: '8px', 
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}>
                                  {progressRec ? progressRec.improvementStatus : 'Not started'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                      No report analyzed yet. Your child's personalized academic analysis and practice comparison will appear here once you upload their academic report card.
                    </p>
                  )}
                </div>
              </div>

              {/* SAFETY SECTION */}
              <div className="section-title-row" style={{ marginTop: '32px' }}>
                <h2><ShieldAlert size={22} color="#dc2626" /> Digital Safety Section</h2>
                <Link to="/safety-monitoring" className="section-link">Open Safety Console &rarr;</Link>
              </div>

              <div className="dashboard-grid">
                {/* Screen Time Usage */}
                <div className="card col-span-2">
                  <div className="card-header">
                    <h2>Daily Screen Time Usage (Minutes)</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyScreenTimeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Bar dataKey="ScreenTime" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Well-Being Score & Emotion Status */}
                <div className="card">
                  <div className="card-header">
                    <h2>Weekly Well-Being Score</h2>
                  </div>
                  <div className="wellbeing-score-box">
                    <div className="score-ring">
                      <span className="score-val">88/100</span>
                      <span className="score-tag">Healthy Balance</span>
                    </div>
                    <div className="wellbeing-meta">
                      <div>
                        <span>Latest Emotion</span>
                        <strong>😊 Happy</strong>
                      </div>
                      <div>
                        <span>SOS Status</span>
                        <strong style={{ color: '#10b981' }}>0 Pending</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add New Student Profile</h3>
            <form onSubmit={handleAddChildSubmit}>
              <div className="form-group">
                <label>Student Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newChild.name} 
                  onChange={e => setNewChild({...newChild, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newChild.age} 
                    onChange={e => setNewChild({...newChild, age: parseInt(e.target.value)})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select 
                    className="form-input" 
                    value={newChild.gender} 
                    onChange={e => setNewChild({...newChild, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Class / Grade</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newChild.class} 
                    onChange={e => setNewChild({...newChild, class: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>School</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newChild.school} 
                    onChange={e => setNewChild({...newChild, school: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Child Email Address (Optional)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={newChild.email || ''} 
                    onChange={e => setNewChild({...newChild, email: e.target.value})} 
                    placeholder="child@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Username / Child ID (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newChild.username || ''} 
                    onChange={e => setNewChild({...newChild, username: e.target.value})} 
                    placeholder="child123"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password (Optional - default: password123)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newChild.password || ''} 
                  onChange={e => setNewChild({...newChild, password: e.target.value})} 
                  placeholder="Enter login password"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddChildModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default ParentDashboard;
