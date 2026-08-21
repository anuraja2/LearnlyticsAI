import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ChevronRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password reset logic
    setSubmitted(true);
  };

  return (
    <div className="page-container">
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>
      
      <div className="auth-card">
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
          <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Back to Login
        </Link>
        
        <div className="header-icon">
          <KeyRound size={32} />
        </div>
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {submitted 
              ? "Check your email for reset instructions."
              : "Enter your email to receive a reset link."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#94a3b8" style={{ position: 'absolute', top: '15px', left: '16px' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email" 
                  style={{ paddingLeft: '48px' }}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
              Send Reset Link <ChevronRight size={20} style={{ marginLeft: '8px' }} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Mail size={32} />
            </div>
            <p style={{ color: 'var(--color-text-main)', marginBottom: '24px' }}>
              We have sent a password reset link to your email address. Please check your inbox.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn btn-primary">
              Try another email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
