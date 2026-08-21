import React, { useState } from 'react';
import { AlertTriangle, X, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { triggerSOS } from '../services/api';
import './SOSButton.css';

const SOSButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);

  const emergencyContacts = [
    { id: 1, name: "Mom", phone: "555-0100" },
    { id: 2, name: "Dad", phone: "555-0101" },
    { id: 3, name: "Emergency Services", phone: "911" }
  ];

  const handleSOSClick = () => {
    setShowConfirm(true);
  };

  const confirmSOS = async () => {
    await triggerSOS('Alex Chen');
    setTriggered(true);
    setShowConfirm(false);
    setTimeout(() => {
      setTriggered(false);
    }, 8000);
  };

  return (
    <>
      <button className={`sos-floating-btn ${triggered ? 'pulsing-emergency' : ''}`} onClick={handleSOSClick} aria-label="Emergency SOS">
        <AlertTriangle size={28} />
      </button>

      {showConfirm && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-card">
            <button className="close-modal" onClick={() => setShowConfirm(false)}>
              <X size={24} />
            </button>
            <div className="sos-warning-icon">
              <AlertTriangle size={48} />
            </div>
            <h2>Emergency SOS</h2>
            <p className="sos-description">Are you in danger? Do you need immediate assistance?</p>
            
            <div className="sos-location-toggle">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={shareLocation} 
                  onChange={(e) => setShareLocation(e.target.checked)} 
                />
                <MapPin size={18} /> Share my live location with parents
              </label>
            </div>

            <div className="emergency-contacts">
              <h3>Emergency Contacts</h3>
              <ul>
                {emergencyContacts.map(contact => (
                  <li key={contact.id}>
                    <span><Phone size={16} /> {contact.name}</span>
                    <button className="call-btn">Call</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sos-actions">
              <button className="sos-confirm" onClick={confirmSOS}>
                SEND ALERT TO PARENTS
              </button>
              <button className="sos-cancel" onClick={() => setShowConfirm(false)}>
                I am safe, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {triggered && (
        <div className="sos-triggered-banner">
          <ShieldCheck size={24} />
          <div className="banner-text">
            <strong>Emergency Alert Sent!</strong>
            <span>Parents notified & SOS event logged in Learnlytics AI. Stay safe!</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
