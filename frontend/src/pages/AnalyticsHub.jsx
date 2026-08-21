import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { 
  ShieldAlert, Activity, LayoutDashboard, Bell, Settings, LogOut, 
  Sparkles, BookOpen, Brain, TrendingUp, AlertOctagon, HeartPulse, FileSpreadsheet
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import './AnalyticsHub.css';

const AnalyticsHub = () => {
  const [notifOpen, setNotifOpen] = useState(false);

  const learningProgress = [
    { week: 'W1', Math: 60, Science: 65, English: 70 },
    { week: 'W2', Math: 65, Science: 70, English: 75 },
    { week: 'W3', Math: 75, Science: 75, English: 80 },
    { week: 'W4', Math: 85, Science: 80, English: 85 },
    { week: 'W5', Math: 90, Science: 85, English: 90 },
  ];

  const quizPerformance = [
    { subject: 'Math', correct: 45, incorrect: 15 },
    { subject: 'Science', correct: 50, incorrect: 10 },
    { subject: 'English', correct: 55, incorrect: 5 },
    { subject: 'History', correct: 40, incorrect: 20 },
  ];

  const safetyReports = [
    { name: 'Safe Browsing', value: 80, color: '#22c55e' },
    { name: 'Blocked Words', value: 12, color: '#ef4444' },
    { name: 'Time Limits', value: 8, color: '#f59e0b' },
  ];

  const emotionTracking = [
    { day: 'Mon', Happy: 60, Focused: 30, Frustrated: 10 },
    { day: 'Tue', Happy: 50, Focused: 40, Frustrated: 10 },
    { day: 'Wed', Happy: 40, Focused: 30, Frustrated: 30 },
    { day: 'Thu', Happy: 70, Focused: 20, Frustrated: 10 },
    { day: 'Fri', Happy: 80, Focused: 15, Frustrated: 5 },
  ];

  const weeklyActivity = [
    { day: 'Mon', Learning: 40, Play: 20, Quizzes: 15 },
    { day: 'Tue', Learning: 45, Play: 25, Quizzes: 20 },
    { day: 'Wed', Learning: 30, Play: 30, Quizzes: 10 },
    { day: 'Thu', Learning: 50, Play: 15, Quizzes: 25 },
    { day: 'Fri', Learning: 60, Play: 20, Quizzes: 30 },
  ];

  return (
    <div className="learnlytics-app-container">
      <Navbar onOpenNotifications={() => setNotifOpen(true)} />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Comprehensive Analytics Hub</h1>
              <p className="page-subtitle">Multi-dimensional tracking of academic progress, quiz accuracy, emotion trends, and screen safety.</p>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon bg-blue"><Brain size={24} color="#2563eb"/></div>
              <div className="kpi-info">
                <p>Average Quiz Score</p>
                <h3>84%</h3>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon bg-green"><Activity size={24} color="#16a34a"/></div>
              <div className="kpi-info">
                <p>Active Learning Time</p>
                <h3>12h 45m</h3>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon bg-red"><AlertOctagon size={24} color="#dc2626"/></div>
              <div className="kpi-info">
                <p>Safety Interventions</p>
                <h3>4 <small>this week</small></h3>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon bg-purple"><HeartPulse size={24} color="#a855f7"/></div>
              <div className="kpi-info">
                <p>Primary Emotion</p>
                <h3>Happy <small>(60%)</small></h3>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h2><TrendingUp size={20} className="text-blue" /> Learning Progress Over Time</h2>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={learningProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Math" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMath)" />
                    <Area type="monotone" dataKey="English" stroke="#a855f7" fillOpacity={0.1} fill="#a855f7" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h2><Brain size={20} className="text-purple" /> Quiz Performance by Subject</h2>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Legend />
                    <Bar dataKey="correct" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} name="Correct Answers" />
                    <Bar dataKey="incorrect" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incorrect Answers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h2><HeartPulse size={20} className="text-orange" /> Emotion Tracking</h2>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionTracking} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Happy" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="Focused" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="Frustrated" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h2><ShieldAlert size={20} className="text-red" /> Safety Reports Breakdown</h2>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safetyReports}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {safetyReports.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card span-2">
              <div className="chart-header">
                <h2><Activity size={20} className="text-green" /> Weekly Activity Distribution (Minutes)</h2>
              </div>
              <div className="chart-body" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Learning" barSize={20} fill="#3b82f6" />
                    <Bar dataKey="Quizzes" barSize={20} fill="#a855f7" />
                    <Line type="monotone" dataKey="Play" stroke="#f59e0b" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default AnalyticsHub;
