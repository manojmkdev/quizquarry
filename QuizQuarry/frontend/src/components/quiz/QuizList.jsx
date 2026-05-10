import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import QuizForm from './QuizForm';
import EmptyState from '../common/EmptyState';

const QuizList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await quizService.getAll();
      setItems(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // Go to the TestProtocol page first (not directly to AttemptForm)
  const handleStartQuiz = (quiz) => {
    if (user?.role === 'INSTRUCTOR') return;

    // Check attempt limit
    if (quiz.maxAttempts != null && quiz.attemptsUsed >= quiz.maxAttempts) {
      alert(`Attempt limit reached. You have used all ${quiz.maxAttempts} attempt(s) for this quiz.`);
      return;
    }

    const titleParam = encodeURIComponent(quiz.title);
    if (quiz.accessType === 'PRIVATE') {
      const code = prompt('Enter the 6-digit Access Code:');
      if (code) navigate(`/quiz-protocol/${quiz.id}?code=${code}&title=${titleParam}`);
    } else {
      navigate(`/quiz-protocol/${quiz.id}?title=${titleParam}`);
    }
  };

  const handleDeleteQuiz = async (e, quizId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this quiz and all its student data? This cannot be undone.')) return;
    try {
      await quizService.deleteQuiz(quizId);
      setItems(items.filter(q => q.id !== quizId));
    } catch (err) {
      alert('Failed to delete quiz.');
    }
  };

  const gradients = [
    'linear-gradient(135deg, #e45e8a 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #e45e8a 100%)',
  ];

  const getAttemptStatus = (quiz) => {
    if (quiz.maxAttempts == null) return null;
    const used = quiz.attemptsUsed || 0;
    const max = quiz.maxAttempts;
    const remaining = max - used;
    if (remaining <= 0) return { label: 'Limit Reached', color: 'var(--red)', bg: '#fef2f2' };
    if (remaining === 1) return { label: `${remaining} attempt left`, color: 'var(--orange)', bg: '#fef3c7' };
    return { label: `${remaining} of ${max} attempts left`, color: 'var(--green)', bg: '#d1fae5' };
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="flex-between" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '6px' }}>
            {user?.role === 'INSTRUCTOR' ? 'Your Quizzes' : 'Explore Quizzes'}
          </h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>
            {user?.role === 'INSTRUCTOR'
              ? 'Manage, edit, publish, or delete your AI-generated quizzes'
              : 'Master your concepts with AI-generated challenges'}
          </p>
        </div>
        {user?.role === 'INSTRUCTOR' && (
          <button className="btn-accent" onClick={() => setShowModal(true)} style={{ padding: '14px 28px' }}>
            + Create Quiz
          </button>
        )}
      </div>

      {loading ? (
        <div className="loader">Loading quizzes...</div>
      ) : items.length === 0 ? (
        <EmptyState
          message="No quizzes yet. Create your first AI-powered quiz!"
          actionText={user?.role === 'INSTRUCTOR' ? '+ Create First Quiz' : null}
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {items.map((quiz, idx) => {
            const attemptStatus = user?.role === 'STUDENT' ? getAttemptStatus(quiz) : null;
            const isLimitReached = attemptStatus?.label === 'Limit Reached';

            return (
              <div key={quiz.id} className="card interactive-card" style={{ padding: 0, overflow: 'hidden', opacity: isLimitReached ? 0.75 : 1 }}
                onClick={() => user?.role === 'STUDENT' && handleStartQuiz(quiz)}>

                {/* Color header */}
                <div style={{ background: gradients[idx % gradients.length], height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '3px solid var(--border)' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {quiz.title.substring(0, 2)}
                  </span>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    <span className={`badge ${quiz.status === 'DRAFT' ? 'badge-draft' : 'badge-success'}`}>{quiz.status}</span>
                    {quiz.accessType === 'PRIVATE' && <span className="badge badge-warning">Private</span>}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{quiz.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '14px', height: '36px', overflow: 'hidden', lineHeight: '1.4' }}>
                    {quiz.concepts || 'General topics and core concepts.'}
                  </p>

                  {/* Meta pills */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {quiz.timeLimitMinutes} min
                    </span>
                    {quiz.questionTimeLimitSeconds && (
                      <span style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {quiz.questionTimeLimitSeconds}s/q
                      </span>
                    )}
                    {quiz.questionCount != null && (
                      <span style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {quiz.questionCount} Qs
                      </span>
                    )}
                    {user?.role === 'INSTRUCTOR' && quiz.maxAttempts != null && (
                      <span style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Student: attempt status badge */}
                  {attemptStatus && (
                    <div style={{ display: 'inline-block', background: attemptStatus.bg, border: `2px solid ${attemptStatus.color}`, borderRadius: '8px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 800, color: attemptStatus.color, marginBottom: '4px' }}>
                      {attemptStatus.label}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                  {user?.role === 'INSTRUCTOR' ? (
                    <>
                      <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                        onClick={e => { e.stopPropagation(); navigate(`/quizzes/manage/${quiz.id}`); }}>
                        Manage
                      </button>
                      <button
                        style={{ background: '#fef2f2', border: '2px solid var(--red)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', color: 'var(--red)', fontWeight: 800, fontSize: '0.82rem' }}
                        onClick={e => handleDeleteQuiz(e, quiz.id)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className={isLimitReached ? 'btn-secondary' : 'btn-accent'}
                      style={{ width: '100%', padding: '12px', fontSize: '0.95rem', cursor: isLimitReached ? 'not-allowed' : 'pointer', opacity: isLimitReached ? 0.6 : 1 }}
                      disabled={isLimitReached}
                      onClick={e => { e.stopPropagation(); handleStartQuiz(quiz); }}>
                      {isLimitReached ? 'Limit Exceeded' : quiz.attemptsUsed > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <QuizForm onClose={() => { setShowModal(false); fetchQuizzes(); }} />}
    </div>
  );
};

export default QuizList;
