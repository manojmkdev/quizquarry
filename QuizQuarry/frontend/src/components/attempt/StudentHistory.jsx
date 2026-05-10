import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import attemptService from '../../services/attemptService';
import EmptyState from '../common/EmptyState';

const StudentHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptService.getMyHistory()
      .then(data => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p className="text-muted" style={{ fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
          My Performance
        </p>
        <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Quiz History</h1>
        <p className="text-muted" style={{ fontWeight: 500 }}>
          All your past quiz attempts — review your answers and AI explanations anytime
        </p>
      </div>

      {loading ? (
        <div className="loader" style={{ padding: '60px', textAlign: 'center' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <EmptyState
          message="No quiz attempts yet. Complete a quiz to see your history here!"
          actionText="Explore Quizzes"
          onAction={() => navigate('/quizzes')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((r, idx) => (
            <div key={idx} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {/* Score ring */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                background: r.score >= 80 ? '#d1fae5' : r.score >= 50 ? '#fef3c7' : '#fef2f2',
                border: `3px solid ${r.score >= 80 ? 'var(--green)' : r.score >= 50 ? 'var(--orange)' : 'var(--red)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 900,
                color: r.score >= 80 ? 'var(--green)' : r.score >= 50 ? 'var(--orange)' : 'var(--red)'
              }}>
                {r.score}%
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{r.subject}</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Attempt <span style={{ color: 'var(--text)', fontWeight: 900 }}>#{r.attemptNumber}</span>
                  </span>
                  {r.durationSeconds != null && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Time: <span style={{ color: 'var(--text)' }}>{Math.floor(r.durationSeconds / 60)}m {r.durationSeconds % 60}s</span>
                    </span>
                  )}
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {new Date(r.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Accuracy bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '10px', background: 'var(--bg-section)', borderRadius: '100px', border: '2px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${r.accuracy || 0}%`, height: '100%', borderRadius: '100px', background: (r.accuracy || 0) >= 80 ? 'var(--green)' : (r.accuracy || 0) >= 50 ? 'var(--orange)' : 'var(--red)' }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{Math.round(r.accuracy || 0)}%</span>
              </div>

              {/* View Result button */}
              <button
                className="btn-accent"
                style={{ padding: '10px 24px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                onClick={() => navigate(`/attempts/results/${r.attemptId}`)}
              >
                View Result
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentHistory;
