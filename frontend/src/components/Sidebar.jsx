import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, ShieldAlert, Activity, Sparkles, 
  BookOpen, HelpCircle, Award, Heart, LogOut, Mic, Menu, X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('learnlytics_role') || 'parent';
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('learnlytics_role');
    localStorage.removeItem('learnlytics_token');
    localStorage.removeItem('learnlytics_user_id');
    localStorage.removeItem('learnlytics_active_child_id');
    navigate('/login');
  };

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`learnlytics-sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        {/* Close button inside sidebar on mobile */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>

        <div className="sidebar-nav-group">
          <div className="group-label">{userRole === 'child' ? 'Guided Learning' : 'Core SaaS Features'}</div>
          
          {userRole === 'parent' ? (
            <>
              <NavLink to="/parent-dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Parent Dashboard</span>
              </NavLink>

              <NavLink to="/report-analysis" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} />
                <span>Upload & Report AI</span>
              </NavLink>

              <NavLink to="/safety-monitoring" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={20} />
                <span>Safety Monitoring</span>
                <span className="badge-new">New</span>
              </NavLink>

              <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Activity size={20} />
                <span>Analytics Hub</span>
              </NavLink>

              <NavLink to="/ai-recommendations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Sparkles size={20} />
                <span>AI Recommendations</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/child-dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Student Home</span>
              </NavLink>

              <NavLink to="/story-learning" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>Daily Learning</span>
              </NavLink>

              <NavLink to="/quiz-zone" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HelpCircle size={20} />
                <span>AI Quiz</span>
              </NavLink>

              <NavLink to="/story-learning" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>Story Learning</span>
              </NavLink>

              <NavLink to="/story-learning" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Mic size={20} />
                <span>Voice Learning</span>
              </NavLink>

              <NavLink to="/results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Award size={20} />
                <span>Rewards & Badges</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="sidebar-nav-group">
          <div className="group-label">{userRole === 'child' ? 'Wellness & Progress' : 'Smart Modules'}</div>
          {userRole === 'parent' ? (
            <>
              <NavLink to="/story-learning" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>Learning Hub</span>
              </NavLink>
              <NavLink to="/quiz-zone" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HelpCircle size={20} />
                <span>Quiz Zone Preview</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/safety-monitoring" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Heart size={20} />
                <span>Emotion Check</span>
              </NavLink>
              <NavLink to="/results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Activity size={20} />
                <span>Learning Progress</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="sidebar-footer-box">
          <div className="upgrade-card">
            <Sparkles size={24} color="#3b82f6" />
            <h4>Learnlytics AI</h4>
            <p>{userRole === 'child' ? 'Guided Student Mode' : 'Executive Parent Mode'}</p>
          </div>
          <button className="sidebar-logout-btn" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
