import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Clock, AlertTriangle, Heart, Eye, Droplet, 
  Smile, Frown, Meh, Moon, Flame, CheckCircle, Search, MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import { addNotification, triggerSOS } from '../services/api';
import './SafetyMonitoring.css';

const SafetyMonitoring = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('screentime');

  // Screen Time state
  const [screenTimeData, setScreenTimeData] = useState({
    todayMinutes: 48,
    weeklyMinutes: 310,
    monthlyMinutes: 1240,
    continuousMinutes: 48,
    exceededLimit: true
  });

  // Break Reminder History
  const [breakHistory, setBreakHistory] = useState([
    { id: 1, type: 'Drink Water', timestamp: '10:15 AM', status: 'Completed' },
    { id: 2, type: 'Rest Eyes (20-20-20 Rule)', timestamp: '11:00 AM', status: 'Completed' },
    { id: 3, type: 'Stretch & Walk', timestamp: '11:45 AM', status: 'Pending' }
  ]);

  // Emotion Check state
  const [emotionBefore, setEmotionBefore] = useState('Happy');
  const [emotionAfter, setEmotionAfter] = useState('');
  const [emotionLogs, setEmotionLogs] = useState([
    { day: 'Mon', happy: 80, normal: 15, sad: 5 },
    { day: 'Tue', happy: 85, normal: 10, sad: 5 },
    { day: 'Wed', happy: 70, normal: 20, sad: 10 },
    { day: 'Thu', happy: 90, normal: 10, sad: 0 },
    { day: 'Fri', happy: 75, normal: 15, sad: 10 },
    { day: 'Sat', happy: 95, normal: 5, sad: 0 },
    { day: 'Sun', happy: 88, normal: 10, sad: 2 }
  ]);

  // Unsafe Word Simulator
  const [testSearch, setTestSearch] = useState('');
  const [wordWarning, setWordWarning] = useState('');
  const [unsafeViolations, setUnsafeViolations] = useState([
    { id: 1, text: 'hate homework', context: 'Search Bar', time: 'Yesterday, 4:20 PM' }
  ]);

  // Screen time weekly chart
  const weeklyScreenData = [
    { day: 'Mon', mins: 40 },
    { day: 'Tue', mins: 42 },
    { day: 'Wed', mins: 55 },
    { day: 'Thu', mins: 38 },
    { day: 'Fri', mins: 50 },
    { day: 'Sat', mins: 65 },
    { day: 'Sun', mins: 48 }
  ];

  const handleTriggerBreak = (breakType) => {
    const newEntry = {
      id: Date.now(),
      type: breakType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setBreakHistory([newEntry, ...breakHistory]);
    addNotification({
      category: 'High Screen Time',
      title: 'Break Reminder Completed',
      message: `Student performed break: ${breakType}`
    });
  };

  const handleEmotionSubmit = (type, val) => {
    if (type === 'before') setEmotionBefore(val);
    if (type === 'after') setEmotionAfter(val);

    addNotification({
      category: 'Emotion Alerts',
      title: 'Emotion Check Recorded',
      message: `Student logged emotion (${type} learning): ${val}`
    });
  };

  const handleSearchCheck = (val) => {
    setTestSearch(val);
    const badWords = ['hate', 'kill', 'ugly', 'stupid', 'curse', 'badword'];
    const found = badWords.find(w => val.toLowerCase().includes(w));
    if (found) {
      setWordWarning('Please use respectful language.');
      const newV = { id: Date.now(), text: val, context: 'Interactive Test Bar', time: 'Just now' };
      setUnsafeViolations([newV, ...unsafeViolations]);
      addNotification({
        category: 'Unsafe Word Alerts',
        title: 'Language Moderation Alert',
        message: `Inappropriate word detected: "${found}"`
      });
    } else {
      setWordWarning('');
    }
  };

  return (
    <div className="learnlytics-app-container">
      <Navbar onOpenNotifications={() => setNotifOpen(true)} />
      
      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Digital Safety Monitoring</h1>
              <p className="page-subtitle">Real-time screen health, break schedules, emotion trends, and language moderation.</p>
            </div>
            <button className="sos-action-btn" onClick={() => triggerSOS('Alex Chen')}>
              <ShieldAlert size={18} />
              <span>Trigger SOS Test</span>
            </button>
          </div>

          {/* Continuous Limit Alert Banner */}
          {screenTimeData.continuousMinutes >= 45 && (
            <div className="break-warning-banner">
              <AlertTriangle size={24} className="banner-icon" />
              <div className="banner-content">
                <h3>Time for a healthy break.</h3>
                <p>Screen usage has exceeded 45 minutes continuously. Rest eyes or stretch!</p>
              </div>
              <button className="take-break-btn" onClick={() => handleTriggerBreak('Rest Eyes (20-20-20 Rule)')}>
                Take 5-Min Break Now
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="safety-tabs">
            <button className={`tab-btn ${activeTab === 'screentime' ? 'active' : ''}`} onClick={() => setActiveTab('screentime')}>
              <Clock size={18} /> Screen Time Monitoring
            </button>
            <button className={`tab-btn ${activeTab === 'breaks' ? 'active' : ''}`} onClick={() => setActiveTab('breaks')}>
              <Droplet size={18} /> Break Reminders
            </button>
            <button className={`tab-btn ${activeTab === 'emotions' ? 'active' : ''}`} onClick={() => setActiveTab('emotions')}>
              <Heart size={18} /> Emotion Check
            </button>
            <button className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
              <MessageSquare size={18} /> Unsafe Word Detector
            </button>
          </div>

          {/* TAB 1: SCREEN TIME */}
          {activeTab === 'screentime' && (
            <div className="safety-grid">
              <div className="safety-card">
                <h3>Today's Screen Time</h3>
                <div className="time-display-circle">
                  <div className="circle-inner">
                    <span className="big-time">{screenTimeData.todayMinutes}</span>
                    <span className="unit">Minutes</span>
                  </div>
                </div>
                <div className="time-kpi-row">
                  <div>
                    <span className="kpi-label">Weekly Total</span>
                    <strong className="kpi-val">{screenTimeData.weeklyMinutes} mins</strong>
                  </div>
                  <div>
                    <span className="kpi-label">Monthly Total</span>
                    <strong className="kpi-val">{(screenTimeData.monthlyMinutes / 60).toFixed(1)} hrs</strong>
                  </div>
                </div>
              </div>

              <div className="safety-card col-span-2">
                <h3>Weekly Usage Pattern</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyScreenData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="mins" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: BREAK REMINDERS */}
          {activeTab === 'breaks' && (
            <div className="safety-grid">
              <div className="safety-card">
                <h3>Interactive Break Quick Triggers</h3>
                <p className="card-sub">Click to trigger and record active break for child:</p>
                <div className="break-triggers">
                  <button className="trigger-btn" onClick={() => handleTriggerBreak('Drink Water')}>
                    <Droplet size={20} color="#0284c7" />
                    <span>Drink Water</span>
                  </button>
                  <button className="trigger-btn" onClick={() => handleTriggerBreak('Stretch & Move')}>
                    <Flame size={20} color="#7c3aed" />
                    <span>Stretch & Move</span>
                  </button>
                  <button className="trigger-btn" onClick={() => handleTriggerBreak('Rest Eyes (20-20-20 Rule)')}>
                    <Eye size={20} color="#059669" />
                    <span>Rest Eyes (20-20-20)</span>
                  </button>
                  <button className="trigger-btn" onClick={() => handleTriggerBreak('Walk for 5 Minutes')}>
                    <Clock size={20} color="#d97706" />
                    <span>Walk for 5 Minutes</span>
                  </button>
                </div>
              </div>

              <div className="safety-card col-span-2">
                <h3>Saved Break History</h3>
                <div className="break-list">
                  {breakHistory.map(b => (
                    <div key={b.id} className="break-item">
                      <CheckCircle size={18} color="#10b981" />
                      <div className="break-details">
                        <strong>{b.type}</strong>
                        <span>Recorded at {b.timestamp}</span>
                      </div>
                      <span className="status-badge">{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMOTION CHECK */}
          {activeTab === 'emotions' && (
            <div className="safety-grid">
              <div className="safety-card">
                <h3>Before Learning Emotion Check</h3>
                <p className="card-sub">"How are you feeling today?"</p>
                <div className="emotion-btn-grid">
                  {[
                    { label: 'Happy', emoji: '😊', icon: Smile },
                    { label: 'Normal', emoji: '😐', icon: Meh },
                    { label: 'Sad', emoji: '😢', icon: Frown },
                    { label: 'Tired', emoji: '😴', icon: Moon },
                    { label: 'Angry', emoji: '😡', icon: AlertTriangle }
                  ].map(e => (
                    <button 
                      key={e.label} 
                      className={`emotion-select-btn ${emotionBefore === e.label ? 'selected' : ''}`}
                      onClick={() => handleEmotionSubmit('before', e.label)}
                    >
                      <span className="emoji">{e.emoji}</span>
                      <span className="label">{e.label}</span>
                    </button>
                  ))}
                </div>

                <h3 style={{ marginTop: '24px' }}>After Learning Emotion Check</h3>
                <div className="emotion-btn-grid">
                  {[
                    { label: 'Happy', emoji: '😊' },
                    { label: 'Normal', emoji: '😐' },
                    { label: 'Sad', emoji: '😢' },
                    { label: 'Tired', emoji: '😴' },
                    { label: 'Angry', emoji: '😡' }
                  ].map(e => (
                    <button 
                      key={e.label} 
                      className={`emotion-select-btn ${emotionAfter === e.label ? 'selected' : ''}`}
                      onClick={() => handleEmotionSubmit('after', e.label)}
                    >
                      <span className="emoji">{e.emoji}</span>
                      <span className="label">{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="safety-card col-span-2">
                <h3>Weekly Emotion Trends</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={emotionLogs}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="happy" stackId="1" stroke="#10b981" fill="#a7f3d0" name="Happy %" />
                    <Area type="monotone" dataKey="normal" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Normal %" />
                    <Area type="monotone" dataKey="sad" stackId="1" stroke="#ef4444" fill="#fecaca" name="Sad %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: UNSAFE WORD DETECTOR */}
          {activeTab === 'moderation' && (
            <div className="safety-grid">
              <div className="safety-card col-span-2">
                <h3>Real-Time Unsafe Word Moderation Simulator</h3>
                <p className="card-sub">Monitors student input across Search, Chat, Notes, & Quiz fields.</p>

                <div className="search-moderation-box">
                  <div className="input-field-wrapper">
                    <Search size={20} color="#94a3b8" />
                    <input 
                      type="text" 
                      className="mod-input" 
                      placeholder="Type test text here (e.g. try typing 'hate', 'kill', etc.)..."
                      value={testSearch}
                      onChange={(e) => handleSearchCheck(e.target.value)}
                    />
                  </div>
                  {wordWarning && (
                    <div className="word-warning-box">
                      <AlertTriangle size={18} color="#ef4444" />
                      <span>{wordWarning}</span>
                    </div>
                  )}
                </div>

                <h4 style={{ marginTop: '20px', fontSize: '15px' }}>Stored Moderation Violations</h4>
                <div className="violation-list">
                  {unsafeViolations.map(v => (
                    <div key={v.id} className="violation-item">
                      <AlertTriangle size={18} color="#dc2626" />
                      <div>
                        <strong>Flagged Input: "{v.text}"</strong>
                        <p>Context: {v.context} • {v.time}</p>
                      </div>
                      <span className="flag-tag">Logged</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default SafetyMonitoring;
