import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  ShieldAlert, Activity, LayoutDashboard, Bell, Settings, LogOut, 
  Sparkles, Coffee, TrendingDown, TrendingUp, Calendar, BookOpen, Brain, Clock, FileSpreadsheet
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import './AIRecommendations.css';

const AIRecommendations = () => {
  const [notifOpen, setNotifOpen] = useState(false);

  const subjectPerformance = [
    { subject: 'Math', score: 65, fullMark: 100 },
    { subject: 'Science', score: 85, fullMark: 100 },
    { subject: 'English', score: 90, fullMark: 100 },
    { subject: 'History', score: 70, fullMark: 100 },
    { subject: 'Art', score: 95, fullMark: 100 },
  ];

  const scheduleData = [
    { time: '09:00 AM', activity: 'Math Basics (Focus)', type: 'learning' },
    { time: '09:45 AM', activity: 'Brain Break (Stretch)', type: 'break' },
    { time: '10:00 AM', activity: 'Science Storytime', type: 'learning' },
    { time: '10:30 AM', activity: 'History Quiz', type: 'assessment' },
    { time: '11:00 AM', activity: 'Long Break / Snack', type: 'break' },
  ];

  return (
    <div className="learnlytics-app-container">
      <Navbar onOpenNotifications={() => setNotifOpen(true)} />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">AI Recommendations Engine</h1>
              <p className="page-subtitle">Personalized learning insights, skill gap analysis, study schedules, and wellness breaks.</p>
            </div>
          </div>

          <div className="ai-grid">
            <div className="ai-card span-2">
              <div className="ai-card-header">
                <TrendingDown size={24} className="icon-red" />
                <h2>Skill Gap Analysis</h2>
              </div>
              <div className="ai-card-content flex-row">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformance}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Alex" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="analysis-text">
                  <h3>Weakness Detected: <strong className="text-red">Math</strong></h3>
                  <p>Alex's performance in Math has dropped by 15% over the last 3 days, specifically in <em>addition with carryover</em>.</p>
                  <div className="ai-alert-box">
                    <Brain size={16} /> Learnlytics AI suggests focusing on visual math puzzles to bridge this gap.
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-card-header">
                <Coffee size={24} className="icon-orange" />
                <h2>Break Time Suggester</h2>
              </div>
              <div className="ai-card-content centered">
                <div className="break-timer-ring">
                  <span>15m</span>
                </div>
                <p className="break-text">Cognitive load is high. Alex has been focused for 45 minutes.</p>
                <Link to="/safety-monitoring" className="ai-action-btn orange" style={{ textDecoration: 'none', display: 'inline-block' }}>Suggest Break Now</Link>
              </div>
            </div>

            <div className="ai-card">
              <div className="ai-card-header">
                <TrendingUp size={24} className="icon-green" />
                <h2>Personalized Improvement Plan</h2>
              </div>
              <div className="ai-card-content">
                <ul className="improvement-list">
                  <li>
                    <div className="imp-icon bg-blue"><BookOpen size={16}/></div>
                    <div className="imp-text">
                      <strong>Interactive Math Story</strong>
                      <span>Assign "The Number Knights" to make math engaging.</span>
                    </div>
                  </li>
                  <li>
                    <div className="imp-icon bg-purple"><Brain size={16}/></div>
                    <div className="imp-text">
                      <strong>Lower Quiz Difficulty</strong>
                      <span>Temporarily adjust Math Quizzes to Level 1 to rebuild confidence.</span>
                    </div>
                  </li>
                </ul>
                <button className="ai-action-btn outline mt-4">Apply Full Plan</button>
              </div>
            </div>

            <div className="ai-card span-2">
              <div className="ai-card-header">
                <Calendar size={24} className="icon-blue" />
                <h2>AI-Generated Study Schedule (Today)</h2>
              </div>
              <div className="ai-card-content">
                <div className="schedule-timeline">
                  {scheduleData.map((slot, index) => (
                    <div key={index} className={`schedule-item type-${slot.type}`}>
                      <div className="time-badge"><Clock size={14}/> {slot.time}</div>
                      <div className="activity-details">
                        <strong>{slot.activity}</strong>
                        <span>{slot.type === 'break' ? 'Rest & Recover' : 'Focus Session'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default AIRecommendations;
