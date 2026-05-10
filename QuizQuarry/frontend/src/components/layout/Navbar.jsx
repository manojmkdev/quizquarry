import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>QuizQuarry</h1>
      </Link>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/quizzes">Quizzes</Link>

        {user.role === 'INSTRUCTOR' && (
          <Link to="/reports">Reports</Link>
        )}

        {user.role === 'STUDENT' && (
          <Link to="/history">My History</Link>
        )}
      </div>
      <div className="flex-row" style={{ gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.fullName}</div>
          <span className={`badge ${user.role === 'INSTRUCTOR' ? 'badge-accent' : 'badge-info'}`} style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
            {user.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Logout</button>
      </div>
    </nav>
  );
};
export default Navbar;
