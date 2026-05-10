import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then((res) => {
      if (!res.error) navigate('/');
    });
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--accent)' }}>QuizQuarry</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginTop: '8px' }}>AI-powered quiz generation for modern educators</p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.9rem' }}>Sign in to your account to continue</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '2px solid var(--red)', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: 'var(--red)', fontWeight: 600, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-accent" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '28px 0 24px', position: 'relative' }}>
            <div style={{ borderTop: '2px solid #e2e8f0', position: 'absolute', top: '50%', width: '100%' }} />
            <span style={{ background: 'var(--bg-card)', padding: '0 16px', position: 'relative', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
          </div>

          <button
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', fontWeight: 700 }}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
            Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', borderBottom: '2px solid var(--accent)' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
