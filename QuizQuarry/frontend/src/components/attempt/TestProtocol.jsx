import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const TestProtocol = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');
  const quizTitle = queryParams.get('title') || 'Quiz';

  const rules = [
    {
      icon: '⏱',
      title: 'Time Limits Apply',
      desc: 'The quiz has a total time limit and a per-question time limit. When the question timer runs out, that question is auto-skipped.'
    },
    {
      icon: '🚫',
      title: 'No Going Back',
      desc: 'Once you move to the next question, you cannot return to previous questions. Review your answer before proceeding.'
    },
    {
      icon: '📋',
      title: 'Tab Switching',
      desc: 'Switching browser tabs or windows is monitored and recorded. Exceeding the allowed limit will auto-submit your test.'
    },
    {
      icon: '⚡',
      title: 'Auto-Submit',
      desc: 'The test will be automatically submitted when: (a) total time expires, (b) you answer all questions, or (c) tab switch limit is exceeded.'
    },
    {
      icon: '🔒',
      title: 'Stay on This Page',
      desc: 'Navigating away from the test page before completion will trigger an auto-submit warning. Your progress will be saved.'
    },
    {
      icon: '📊',
      title: 'Results & Review',
      desc: 'After submission, you can immediately review your answers along with AI-generated explanations for each question.'
    }
  ];

  const handleStart = () => {
    if (!agreed) return;
    const url = code
      ? `/attempts/new/${id}?code=${encodeURIComponent(code)}`
      : `/attempts/new/${id}`;
    navigate(url);
  };

  return (
    <div style={{ maxWidth: '760px', margin: '20px auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '40px 36px', marginBottom: '28px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)', borderTop: '6px solid var(--accent)' }}>
        <div style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', borderRadius: '12px', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px', border: '2px solid var(--border)' }}>
          Test Protocol
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{quizTitle}</h1>
        <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>
          Read the rules carefully before starting. Once you begin, the timer cannot be paused.
        </p>
      </div>

      {/* Rules grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {rules.map((rule, i) => (
          <div key={i} className="card" style={{ padding: '20px 22px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: 'var(--accent-light)', border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
            }}>
              {rule.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{rule.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: 500 }}>{rule.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Important notice */}
      <div style={{ padding: '18px 22px', background: '#fffbeb', borderRadius: '12px', border: '2px solid var(--orange)', borderLeft: '6px solid var(--orange)', marginBottom: '28px' }}>
        <div style={{ fontWeight: 800, color: 'var(--orange)', fontSize: '0.85rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Important
        </div>
        <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: '1.6', margin: 0 }}>
          Ensure you are in a distraction-free environment with a stable internet connection before starting.
          The test cannot be paused once started. Make sure you have sufficient time to complete it.
        </p>
      </div>

      {/* Acknowledgement + Actions */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', marginBottom: '24px' }}>
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
              border: `3px solid ${agreed ? 'var(--accent)' : 'var(--border)'}`,
              background: agreed ? 'var(--accent)' : 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s', cursor: 'pointer'
            }}
          >
            {agreed && <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.5' }}>
            I have read and understood all the rules. I am ready to begin the test and agree to the test protocol.
          </span>
        </label>

        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            className="btn-secondary"
            style={{ flex: 1, padding: '14px' }}
            onClick={() => navigate('/quizzes')}
          >
            Back to Quizzes
          </button>
          <button
            className="btn-accent"
            style={{ flex: 2, padding: '14px', fontSize: '1rem', opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
            onClick={handleStart}
            disabled={!agreed}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestProtocol;
