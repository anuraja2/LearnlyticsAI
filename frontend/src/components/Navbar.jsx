import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Sparkles, AlertOctagon, User, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import { fetchNotifications, fetchChildren } from '../services/api';
import './Navbar.css';

const Navbar = ({ onOpenNotifications, activeChild, onSelectChild }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [children, setChildren] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userRole = localStorage.getItem('learnlytics_role') || 'parent';

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [activeChild]);

  const loadData = async () => {
    try {
      const kids = await fetchChildren();
      setChildren(kids);
      
      const storedChildId = localStorage.getItem('learnlytics_active_child_id');
      let currentActive = null;
      if (storedChildId && kids.length > 0) {
        currentActive = kids.find(k => k._id === storedChildId);
      }
      if (!currentActive && kids.length > 0) {
        currentActive = kids[0];
        localStorage.setItem('learnlytics_active_child_id', currentActive._id);
      }
      
      if (currentActive && (!activeChild || activeChild._id !== currentActive._id)) {
        onSelectChild && onSelectChild(currentActive);
      }

      const notifs = await fetchNotifications();
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error('Navbar loadData error', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('learnlytics_role');
    localStorage.removeItem('learnlytics_token');
    localStorage.removeItem('learnlytics_user_id');
    localStorage.removeItem('learnlytics_active_child_id');
    navigate('/login');
  };

  return (
    <header className="learnlytics-navbar">
      <div className="nav-left">
        <Link to={userRole === 'child' ? "/child-dashboard" : "/parent-dashboard"} className="brand-logo">
          <div className="logo-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Learnlytics <small className="ai-badge">AI</small></span>
            <span className="brand-tagline">Smart Learning & Digital Safety</span>
          </div>
        </Link>
      </div>

      <div className="nav-right">
        {/* Student Profile Switcher */}
        {children.length > 0 && (
          <div className="child-selector-wrapper">
            <button className="child-selector-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src={activeChild?.photo || children[0]?.photo} alt="Student" className="child-avatar" />
              <div className="child-info">
                <span className="child-name">{activeChild?.name || children[0]?.name}</span>
                <span className="child-class">{activeChild?.class || children[0]?.class}</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {dropdownOpen && (
              <div className="child-dropdown-menu">
                <div className="dropdown-header">Select Student Profile</div>
                {children.map(k => (
                  <div 
                    key={k._id} 
                    className={`dropdown-item ${activeChild?._id === k._id ? 'active' : ''}`}
                    onClick={() => {
                      localStorage.setItem('learnlytics_active_child_id', k._id);
                      onSelectChild && onSelectChild(k);
                      setDropdownOpen(false);
                    }}
                  >
                    <img src={k.photo} alt={k.name} className="dropdown-avatar" />
                    <div>
                      <div className="item-name">{k.name}</div>
                      <div className="item-sub">{k.class} • {k.school}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Quick Launcher */}
        <button 
          className="nav-sos-btn" 
          onClick={() => navigate('/safety-monitoring')}
          title="Digital Safety & Emergency SOS"
        >
          <AlertOctagon size={18} />
          <span>Safety & SOS</span>
        </button>

        {/* Notification Bell */}
        <button className="nav-icon-btn" onClick={onOpenNotifications} title="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>

        {/* User Role Badge */}
        <div className="user-profile-badge">
          <div className="avatar-circle bg-gradient">
            <User size={18} color="#ffffff" />
          </div>
          <div className="user-details">
            <span className="user-name">{userRole === 'child' ? 'Child Access' : 'Parent Account'}</span>
            <span className="user-role-label">
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
              {userRole === 'child' ? 'Student View' : 'Primary User'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
