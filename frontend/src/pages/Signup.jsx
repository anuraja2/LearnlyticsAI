import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Baby, Lock, Mail, UserPlus, ChevronRight, UserCircle, Sparkles, AlertTriangle, Loader } from 'lucide-react';
import './Login.css';
import { registerUser, loginUser, getErrorMessage } from '../services/api';

const Signup = () => {
  const [role, setRole] = useState('parent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Step 1: Register
      await registerUser(name, email, password, role);

      // Step 2: Auto-login after registration
      try {
        const loginData = await loginUser(email, password, role);
        if (loginData && loginData.token) {
          if (role === 'child') {
            navigate('/child-dashboard');
          } else {
            navigate('/parent-dashboard');
          }
        } else {
          // Registration succeeded but login didn't return token — redirect to login page
          navigate('/login');
        }
      } catch (loginErr) {
        // Registration succeeded but auto-login failed — send user to login page
        console.error('Auto-login after registration failed:', loginErr);
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', padding: '20px' }}>
      <div className="auth-card" style={{ width: '420px', background: 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Join Learnlytics AI</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>AI-Powered Smart Learning & Digital Safety for Children</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '12px', color: '#b91c1c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <label className="role-option">
              <input 
                type="radio" 
                name="role" 
                value="parent" 
                checked={role === 'parent'} 
                onChange={(e) => setRole(e.target.value)} 
                style={{ display: 'none' }}
              />
              <div className={`role-card ${role === 'parent' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', borderRadius: '14px', border: role === 'parent' ? '2px solid #2563eb' : '1px solid #cbd5e1', background: role === 'parent' ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                <User size={22} color={role === 'parent' ? '#2563eb' : '#64748b'} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: role === 'parent' ? '#2563eb' : '#1e293b' }}>Parent Account</span>
              </div>
            </label>

            <label className="role-option">
              <input 
                type="radio" 
                name="role" 
                value="child" 
                checked={role === 'child'} 
                onChange={(e) => setRole(e.target.value)} 
                style={{ display: 'none' }}
              />
              <div className={`role-card ${role === 'child' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', borderRadius: '14px', border: role === 'child' ? '2px solid #7c3aed' : '1px solid #cbd5e1', background: role === 'child' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>
                <Baby size={22} color={role === 'child' ? '#7c3aed' : '#64748b'} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: role === 'child' ? '#7c3aed' : '#1e293b' }}>Child Profile</span>
              </div>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserCircle size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '14px' }} />
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name" 
                style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '14px' }} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address" 
                style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Create Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '14px' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose a password" 
                style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader size={18} className="spin" /> Creating Account...</> : <>Create Account <ChevronRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
