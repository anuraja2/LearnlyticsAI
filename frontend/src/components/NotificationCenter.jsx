import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, FileText, Award, Heart, Bell } from 'lucide-react';
import { fetchNotifications, markNotificationsRead } from '../services/api';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  const handleMarkAllRead = async () => {
    const updated = await markNotificationsRead();
    setNotifications(updated);
  };

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'safety') return ['High Screen Time', 'Emotion Alerts', 'Unsafe Word Alerts', 'SOS Alerts'].includes(n.category);
    if (filter === 'learning') return ['Report Uploaded', 'AI Analysis Completed', 'Quiz Completed'].includes(n.category);
    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Report Uploaded':
      case 'AI Analysis Completed':
        return <FileText size={18} color="#2563eb" />;
      case 'Quiz Completed':
        return <Award size={18} color="#7c3aed" />;
      case 'High Screen Time':
        return <AlertTriangle size={18} color="#d97706" />;
      case 'Emotion Alerts':
        return <Heart size={18} color="#ec4899" />;
      case 'Unsafe Word Alerts':
        return <ShieldAlert size={18} color="#dc2626" />;
      case 'SOS Alerts':
        return <ShieldAlert size={18} color="#ef4444" />;
      default:
        return <Bell size={18} color="#64748b" />;
    }
  };

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="notif-header">
          <div className="title-row">
            <div className="icon-badge">
              <Bell size={20} color="#ffffff" />
            </div>
            <h2>Notification Center</h2>
          </div>
          <div className="header-actions">
            <button className="mark-read-btn" onClick={handleMarkAllRead}>
              <CheckCircle size={14} /> Mark All Read
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="notif-filters">
          <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({notifications.length})
          </button>
          <button className={`filter-pill ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button className={`filter-pill ${filter === 'safety' ? 'active' : ''}`} onClick={() => setFilter('safety')}>
            Safety
          </button>
          <button className={`filter-pill ${filter === 'learning' ? 'active' : ''}`} onClick={() => setFilter('learning')}>
            Learning
          </button>
        </div>

        {/* List */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="empty-notif">
              <Bell size={40} color="#cbd5e1" />
              <p>No notifications in this view.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id || item._id} className={`notif-card ${item.read ? 'read' : 'unread'} ${item.category === 'SOS Alerts' ? 'critical' : ''}`}>
                <div className="card-icon">{getCategoryIcon(item.category)}</div>
                <div className="card-content">
                  <div className="card-header-row">
                    <span className="cat-tag">{item.category}</span>
                    <span className="timestamp">{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                  </div>
                  <h4 className="card-title">{item.title}</h4>
                  <p className="card-msg">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
