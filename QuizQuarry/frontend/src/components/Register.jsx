import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(formData);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(formData.email, otp);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--accent)' }}>QuizQuarry</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginTop: '8px' }}>
            {step === 1 ? 'Create your free account in seconds' : 'Almost there — verify your email'}
          </p>
        </div>

        <div className="card" style={{ padding: '36px' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '40px', height: '5px', borderRadius: '100px', background: 'var(--accent)', border: '2px solid var(--border)' }} />
            <div style={{ width: '40px', height: '5px', borderRadius: '100px', background: step === 2 ? 'var(--accent)' : '#e2e8f0', border: '2px solid var(--border)' }} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '2px solid var(--red)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: 'var(--red)', fontWeight: 600, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleDetailsSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>I am a...</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => setFormData({...formData, role: 'STUDENT'})}
                    style={{
                      border: `3px solid ${formData.role === 'STUDENT' ? 'var(--accent)' : 'var(--border)'}`,
                      background: formData.role === 'STUDENT' ? 'var(--accent-light)' : 'var(--bg-card)',
                      borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                      fontWeight: 700, boxShadow: formData.role === 'STUDENT' ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    Student
                  </div>
                  <div
                    onClick={() => setFormData({...formData, role: 'INSTRUCTOR'})}
                    style={{
                      border: `3px solid ${formData.role === 'INSTRUCTOR' ? 'var(--accent)' : 'var(--border)'}`,
                      background: formData.role === 'INSTRUCTOR' ? 'var(--accent-light)' : 'var(--bg-card)',
                      borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                      fontWeight: 700, boxShadow: formData.role === 'INSTRUCTOR' ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    Instructor
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-accent" style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '1rem' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Free Account →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', borderBottom: '2px solid var(--accent)' }}>Sign In</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--accent-light)', border: '3px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.2rem', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}>@</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{formData.email}</strong>
                </p>
              </div>
              <div className="form-group">
                <label style={{ textAlign: 'center' }}>Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength="6"
                  style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '12px', fontWeight: 800, padding: '18px' }}
                  required
                />
              </div>
              <button type="submit" className="btn-accent" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>
              <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '12px', padding: '12px' }} onClick={() => setStep(1)}>
                ← Back to Details
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
