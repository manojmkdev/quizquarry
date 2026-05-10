import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInstructorReports } from '../../store/slices/attemptSlice';
import EmptyState from '../common/EmptyState';
import attemptService from '../../services/attemptService';

/* Inline result modal for instructor — no AI explanation toggling,
   shows exact same layout as AttemptResult */
const InstructorResultModal = ({ attemptId, onClose }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    attemptService.getInstructorResult(attemptId).then(setResult).catch(console.error);
  }, [attemptId]);

  if (!result) return (
    <div className="modal-overlay">
      <div className="card modal-content" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="loader">Loading result...</div>
      </div>
    </div>
  );

  const correct = Math.round((result.score / 100) * result.totalQuestions);
  const wrong = result.totalQuestions - correct;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card modal-content"
        style={{ maxWidth: '760px', width: '95%', maxHeight: '88vh', overflowY: 'auto', padding: '36px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{result.quizTitle}</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Attempt #{result.attemptNumber} &nbsp;|&nbsp; {result.totalQuestions} questions
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '3px solid var(--border)', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}>×</button>
        </div>

        {/* Score summary */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div style={{ background: result.score >= 80 ? '#d1fae5' : result.score >= 50 ? '#fef3c7' : '#fef2f2', border: '3px solid var(--border)', borderRadius: '14px', padding: '20px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: result.score >= 80 ? 'var(--green)' : result.score >= 50 ? 'var(--orange)' : 'var(--red)' }}>{result.score}%</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>SCORE</div>
          </div>
          <div style={{ background: '#d1fae5', border: '2px solid var(--border)', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{correct}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CORRECT</div>
          </div>
          <div style={{ background: '#fef2f2', border: '2px solid var(--border)', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{wrong}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>WRONG</div>
          </div>
        </div>

        {/* Question review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result.questions?.map((q, idx) => {
            const isCorrect = q.selectedOption === q.correctAnswer;
            return (
              <div key={idx} className="card" style={{ padding: '20px', borderLeft: `6px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}` }}>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <span style={{ background: isCorrect ? '#d1fae5' : '#fef2f2', border: `2px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`, borderRadius: '8px', padding: '3px 12px', fontWeight: 800, fontSize: '0.72rem' }}>
                    {isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.98rem', lineHeight: '1.5', marginBottom: '14px', fontFamily: "'Zilla Slab', serif" }}>{q.questionText}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', background: '#fef2f2', fontSize: '0.88rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem' }}>STUDENT ANSWER</div>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{q.selectedOption || '(Timed out)'}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--green)', background: '#d1fae5', fontSize: '0.88rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.72rem' }}>CORRECT ANSWER</div>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{q.correctAnswer}</div>
                  </div>
                </div>
                {q.explanation && (
                  <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '10px', border: '2px solid var(--orange)', fontSize: '0.88rem', lineHeight: '1.5', color: '#78350f' }}>
                    <strong style={{ color: 'var(--orange)' }}>AI Explanation: </strong>{q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AttemptList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.attempt);
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => { dispatch(fetchInstructorReports()); }, [dispatch]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Student Reports</h1>
        <p className="text-muted" style={{ fontWeight: 500 }}>Track student performance, accuracy, and time taken per quiz</p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div className="loader" style={{ padding: '60px' }}>Loading reports...</div>
        ) : items.length === 0 ? (
          <EmptyState message="No submissions yet. Once students take quizzes, their reports will appear here." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Attempt</th>
                  <th>Accuracy</th>
                  <th>Time Taken</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{r.studentName}</td>
                    <td>{r.subject}</td>
                    <td style={{ fontWeight: 700 }}>#{r.attemptNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '80px', height: '10px', background: 'var(--bg-section)', borderRadius: '100px', border: '2px solid var(--border)', overflow: 'hidden' }}>
                          <div style={{ width: `${r.accuracy || 0}%`, height: '100%', background: (r.accuracy || 0) >= 80 ? 'var(--green)' : (r.accuracy || 0) >= 50 ? 'var(--orange)' : 'var(--red)', borderRadius: '100px' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{Math.round(r.accuracy || 0)}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.durationSeconds ? `${Math.floor(r.durationSeconds / 60)}m ${r.durationSeconds % 60}s` : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ background: r.score >= 80 ? '#d1fae5' : r.score >= 50 ? '#fef3c7' : '#fef2f2', border: `2px solid ${r.score >= 80 ? 'var(--green)' : r.score >= 50 ? 'var(--orange)' : 'var(--red)'}`, borderRadius: '8px', padding: '4px 14px', fontWeight: 800, fontSize: '0.85rem' }}>
                        {r.score}%
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.submittedAt).toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setViewingId(r.attemptId)}
                        style={{ background: 'var(--primary)', color: '#fff', border: '2px solid var(--border)', borderRadius: '8px', padding: '6px 14px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.03em' }}
                      >
                        View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingId && <InstructorResultModal attemptId={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
};
export default AttemptList;
