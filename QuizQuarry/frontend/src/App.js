import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ErrorHandler from './components/ErrorHandler';
import LandingPage from './components/LandingPage';

import QuizList from './components/quiz/QuizList';
import QuizEditor from './components/quiz/QuizEditor';
import AttemptList from './components/attempt/AttemptList';
import AttemptForm from './components/attempt/AttemptForm';
import AttemptResult from './components/attempt/AttemptResult';
import TestProtocol from './components/attempt/TestProtocol';
import StudentHistory from './components/attempt/StudentHistory';
import StatCards from './components/dashboard/StatCards';
import OAuth2Callback from './components/OAuth2Callback';

import attemptService from './services/attemptService';
import DomainChart from './components/dashboard/DomainChart';
import { useDispatch } from 'react-redux';
import { fetchQuizzes } from './store/slices/quizSlice';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user } = useSelector(state => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/dashboard" />;
  return children;
};

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { items: quizzes } = useSelector(state => state.quiz);

  const dispatch = useDispatch();
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [quizStats, setQuizStats] = React.useState([]);

  React.useEffect(() => {
    attemptService.getLeaderboard().then(data => setLeaderboard(data));
    if (user?.role === 'INSTRUCTOR') {
      attemptService.getQuizStats().then(data => setQuizStats(data));
    }
    dispatch(fetchQuizzes());
  }, [user, dispatch]);

  const instructorStats = [
    { label: 'Active Quizzes', value: quizzes.length },
    { label: 'Total Students', value: leaderboard.length },
    { label: 'Avg Score', value: leaderboard.length > 0 ? Math.round(leaderboard.reduce((a, b) => a + b.averageScore, 0) / leaderboard.length) + '%' : '—' }
  ];

  const myEntry = leaderboard.find(l => l.studentName === user?.fullName) || { quizzesAttended: 0, averageScore: 0 };
  const studentStats = [
    { label: 'Available Quizzes', value: quizzes.length },
    { label: 'Completed', value: myEntry.quizzesAttended },
    { label: 'My Average', value: Math.round(myEntry.averageScore) + '%' }
  ];

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: '36px' }}>
        <p className="text-muted" style={{ fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
          {user?.role === 'INSTRUCTOR' ? 'Instructor Dashboard' : 'Student Dashboard'}
        </p>
        <h1 style={{ fontSize: '2.2rem' }}>
          Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.fullName}</span>
        </h1>
      </div>

      <StatCards items={user?.role === 'INSTRUCTOR' ? instructorStats : studentStats} />

      {user?.role === 'INSTRUCTOR' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginTop: '32px' }}>
          {/* Chart */}
          <div className="card">
            <DomainChart
              title="Submissions per Quiz"
              data={quizStats.map(q => ({ label: q.quizTitle, value: q.submissionCount }))}
            />
          </div>

          {/* Top performers */}
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Top Performers</h3>
            {leaderboard.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboard.slice(0, 5).map((l, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderRadius: '10px',
                    background: i === 0 ? 'var(--accent-light)' : 'var(--bg-section)',
                    border: '2px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', width: '28px' }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.quizzesAttended} quizzes</div>
                      </div>
                    </div>
                    <span style={{
                      background: l.averageScore >= 80 ? '#d1fae5' : '#fef3c7',
                      border: '2px solid var(--border)',
                      borderRadius: '8px', padding: '4px 12px', fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      {Math.round(l.averageScore)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Global Leaderboard</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>See how you rank against other students</p>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-muted">No data yet. Complete a quiz to get on the board!</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Quizzes</th>
                    <th style={{ textAlign: 'right' }}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((l, i) => (
                    <tr key={i} style={{ background: l.studentName === user.fullName ? 'var(--accent-light)' : 'transparent' }}>
                      <td style={{ fontWeight: 900, fontSize: '1rem' }}>#{i + 1}</td>
                      <td>
                        <span style={{ fontWeight: l.studentName === user.fullName ? 800 : 500 }}>
                          {l.studentName} {l.studentName === user.fullName && <span className="badge badge-accent" style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '0.6rem' }}>YOU</span>}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.quizzesAttended}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          background: l.averageScore >= 80 ? '#d1fae5' : '#fef3c7',
                          border: '2px solid var(--border)',
                          borderRadius: '8px', padding: '4px 12px', fontWeight: 800, fontSize: '0.85rem'
                        }}>
                          {Math.round(l.averageScore)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const { user } = useSelector(state => state.auth);
  return (
    <ErrorHandler>
      {user && <Navbar />}
      <div className={user ? 'main-content' : ''}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />

          {/* Authenticated routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/quizzes" element={<PrivateRoute><QuizList /></PrivateRoute>} />
          <Route path="/quizzes/manage/:id" element={<PrivateRoute roleRequired="INSTRUCTOR"><QuizEditor /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roleRequired="INSTRUCTOR"><AttemptList /></PrivateRoute>} />

          {/* Test Protocol — shown before quiz starts */}
          <Route path="/quiz-protocol/:id" element={<PrivateRoute roleRequired="STUDENT"><TestProtocol /></PrivateRoute>} />

          {/* Actual quiz attempt */}
          <Route path="/attempts/new/:id" element={<PrivateRoute roleRequired="STUDENT"><AttemptForm /></PrivateRoute>} />
          <Route path="/attempts/results/:id" element={<PrivateRoute roleRequired="STUDENT"><AttemptResult /></PrivateRoute>} />

          {/* Student history */}
          <Route path="/history" element={<PrivateRoute roleRequired="STUDENT"><StudentHistory /></PrivateRoute>} />
        </Routes>
      </div>
    </ErrorHandler>
  );
};

export default App;
