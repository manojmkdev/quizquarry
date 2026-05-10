import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import attemptService from '../../services/attemptService';

const AttemptResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    attemptService.getResults(id).then(data => setResult(data));
  }, [id]);

  if (!result) return <div className="loader" style={{ padding: '80px', textAlign: 'center' }}>Loading results...</div>;

  const correct = Math.round((result.score / 100) * result.totalQuestions);
  const wrong = result.totalQuestions - correct;

  return (
    <div style={{ maxWidth: '780px', margin: '20px auto' }}>

      {/* Score card */}
      <div className="card" style={{ textAlign: 'center', padding: '48px 36px', marginBottom: '24px' }}>
        {/* Quiz title + attempt badge */}
        {result.quizTitle && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{result.quizTitle}</h2>
            {result.attemptNumber && (
              <span style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '8px', padding: '4px 14px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Attempt #{result.attemptNumber}
              </span>
            )}
          </div>
        )}

        {/* Score circle */}
        <div style={{
          width: '110px', height: '110px', borderRadius: '50%',
          background: result.score >= 80 ? '#d1fae5' : result.score >= 50 ? '#fef3c7' : '#fef2f2',
          border: `4px solid ${result.score >= 80 ? 'var(--green)' : result.score >= 50 ? 'var(--orange)' : 'var(--red)'}`,
          boxShadow: 'var(--shadow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '2.2rem', fontWeight: 900,
          color: result.score >= 80 ? 'var(--green)' : result.score >= 50 ? 'var(--orange)' : 'var(--red)'
        }}>
          {result.score}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>{result.score}% Score</h1>
        <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '28px' }}>
          {result.score >= 80 ? 'Excellent work!' : result.score >= 50 ? 'Good effort! Keep practicing.' : 'Keep studying — you will get there!'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#d1fae5', border: '2px solid var(--border)', borderRadius: '10px', padding: '12px 24px', fontWeight: 800 }}>
            {correct} Correct
          </div>
          <div style={{ background: '#fef2f2', border: '2px solid var(--border)', borderRadius: '10px', padding: '12px 24px', fontWeight: 800 }}>
            {wrong} Wrong
          </div>
          <div style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '10px', padding: '12px 24px', fontWeight: 800 }}>
            {result.totalQuestions} Total
          </div>
        </div>
      </div>

      {/* Review header */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Question Review</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => navigate('/history')} style={{ padding: '10px 20px' }}>My History</button>
          <button className="btn-outline" onClick={() => navigate('/quizzes')} style={{ padding: '10px 20px' }}>Back to Quizzes</button>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {result.questions?.map((q, idx) => {
          const isCorrect = q.selectedOption === q.correctAnswer;
          return (
            <div key={idx} className="card" style={{ padding: '24px', borderLeft: `6px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}` }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <span style={{
                  background: isCorrect ? '#d1fae5' : '#fef2f2',
                  border: `2px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`,
                  borderRadius: '8px', padding: '4px 14px', fontWeight: 800, fontSize: '0.75rem'
                }}>
                  {isCorrect ? 'CORRECT' : 'INCORRECT'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Q{idx + 1}</span>
              </div>

              <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.5', marginBottom: '16px', fontFamily: "'Zilla Slab', serif" }}>
                {q.questionText}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', background: isCorrect ? '#d1fae5' : '#fef2f2', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Your Answer</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>{q.selectedOption || '(Timed out)'}</div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--green)', background: '#d1fae5', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.75rem' }}>Correct Answer</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>{q.correctAnswer}</div>
                </div>
              </div>

              {q.explanation && (
                <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '2px solid var(--orange)', fontSize: '0.9rem', lineHeight: '1.5', color: '#78350f' }}>
                  <strong style={{ color: 'var(--orange)' }}>AI Explanation: </strong>{q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => navigate('/history')} style={{ padding: '12px 28px' }}>View All My History</button>
        <button className="btn-accent" onClick={() => navigate('/quizzes')} style={{ padding: '12px 28px' }}>Back to Quizzes</button>
      </div>
    </div>
  );
};
export default AttemptResult;
