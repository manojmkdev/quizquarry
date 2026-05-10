import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import attemptService from '../../services/attemptService';

const AttemptForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const accessCode = queryParams.get('code');

  const [attemptState, setAttemptState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null); // track why auto-submitted

  const isSubmittedRef = useRef(false);
  const attemptIdRef = useRef(null);
  const attemptStateRef = useRef(null);

  // Keep ref in sync with state so callbacks always have current data
  useEffect(() => { attemptStateRef.current = attemptState; }, [attemptState]);

  // ── Core submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback((reason = null) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    if (reason) setAutoSubmitReason(reason);
    const aid = attemptIdRef.current;
    if (!aid) { navigate('/quizzes'); return; }
    attemptService.submitAttempt(aid)
      .then(res => navigate(`/attempts/results/${res.id}`))
      .catch(() => { alert('Failed to submit'); navigate('/quizzes'); });
  }, [navigate]);

  // ── Tab-switch listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && attemptIdRef.current && !isSubmittedRef.current) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        attemptService.recordTabSwitch(attemptIdRef.current).catch(console.error);

        const maxSwitches = attemptStateRef.current?.maxTabSwitches;
        if (maxSwitches > 0 && newCount >= maxSwitches) {
          alert(`Tab switch limit reached (${maxSwitches}). Your test will be auto-submitted.`);
          handleSubmit('Tab switch limit exceeded');
        } else {
          alert(`Tab switch detected! (${newCount}${maxSwitches > 0 ? `/${maxSwitches}` : ''}) This has been recorded.`);
        }
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tabSwitches, handleSubmit]);

  // ── Before-unload: warn if test in progress ──────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmittedRef.current && attemptIdRef.current) {
        e.preventDefault();
        e.returnValue = 'Your test is in progress. Leaving will auto-submit your answers!';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── React Router navigate-away blocker ───────────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (!isSubmittedRef.current && attemptIdRef.current) {
        const leave = window.confirm('Leaving will auto-submit your test. Are you sure?');
        if (leave) {
          handleSubmit('Navigated away from test');
        } else {
          // Push the state back so user stays
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleSubmit]);

  // ── Start attempt ────────────────────────────────────────────────────────
  useEffect(() => {
    attemptService.startAttempt(id, accessCode)
      .then(data => {
        setAttemptState(data);
        attemptIdRef.current = data.attemptId;
        setTotalTimeLeft(data.timeLimitMinutes * 60);
        setQuestionTimeLeft(data.questionTimeLimitSeconds || 30);
        if (data.questions && data.questions.length > 0) setCurrentQuestion(data.questions[0]);
      })
      .catch(err => {
        alert(err.response?.data?.error || err.response?.data?.message || 'Failed to start attempt');
        navigate('/quizzes');
      });
  }, [id, navigate, accessCode]);

  // ── Total countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!attemptState) return;
    if (totalTimeLeft > 0) {
      const t = setTimeout(() => setTotalTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (totalTimeLeft === 0 && !isSubmittedRef.current) {
      handleSubmit('Time limit exceeded');
    }
  }, [totalTimeLeft, attemptState, handleSubmit]);

  // ── Per-question countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion) return;
    if (questionTimeLeft > 0) {
      const t = setTimeout(() => setQuestionTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (questionTimeLeft === 0 && !isSubmittedRef.current) {
      handleNext(true);
    }
  }, [questionTimeLeft, currentQuestion]);

  // ── Next question ────────────────────────────────────────────────────────
  const handleNext = async (isAuto = false) => {
    if (!selectedOption && !isAuto) { alert('Please select an answer.'); return; }
    setIsSubmitting(true);
    try {
      await attemptService.submitAnswer(attemptState.attemptId, selectedOption || 'TIMED_OUT');
      const nextIndex = currentIndex + 1;
      if (nextIndex >= attemptState.totalQuestions) {
        handleSubmit();
      } else {
        const nextQ = await attemptService.getCurrentQuestion(attemptState.attemptId);
        setCurrentQuestion(nextQ);
        setCurrentIndex(nextIndex);
        setSelectedOption('');
        setQuestionTimeLeft(attemptState.questionTimeLimitSeconds || 30);
      }
    } catch (err) { alert('Failed to save answer'); }
    finally { setIsSubmitting(false); }
  };

  if (!attemptState || !currentQuestion) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loader">Preparing your quiz...</div>
      </div>
    );
  }

  const totalMins = Math.floor(totalTimeLeft / 60);
  const totalSecs = totalTimeLeft % 60;
  const options = JSON.parse(currentQuestion.optionsJson || '[]');
  const qLimit = attemptState.questionTimeLimitSeconds || 30;
  const qProgress = (questionTimeLeft / qLimit) * 100;
  const overallProgress = ((currentIndex + 1) / attemptState.totalQuestions) * 100;
  const isLastQuestion = currentIndex + 1 === attemptState.totalQuestions;

  return (
    <div style={{ maxWidth: '780px', margin: '20px auto' }}>

      {/* Auto-submit banner */}
      {autoSubmitReason && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', border: '2px solid var(--red)', borderRadius: '10px', marginBottom: '16px', fontWeight: 700, color: 'var(--red)', textAlign: 'center' }}>
          Auto-submitting: {autoSubmitReason}...
        </div>
      )}

      {/* Top bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{attemptState.title}</h3>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{currentIndex + 1} / {attemptState.totalQuestions}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Tab-switch counter */}
          {attemptState.maxTabSwitches > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tabSwitches >= attemptState.maxTabSwitches ? 'var(--red)' : tabSwitches > 0 ? 'var(--orange)' : 'var(--green)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tabSwitches >= attemptState.maxTabSwitches ? 'var(--red)' : 'var(--text-muted)' }}>
                {tabSwitches}/{attemptState.maxTabSwitches} tab switches
              </span>
            </div>
          )}
          {/* Total timer */}
          <div style={{ background: totalTimeLeft < 60 ? '#fef2f2' : 'var(--bg-section)', border: `2px solid ${totalTimeLeft < 60 ? 'var(--red)' : 'var(--border)'}`, borderRadius: '10px', padding: '6px 16px', fontWeight: 800, fontSize: '1.1rem', color: totalTimeLeft < 60 ? 'var(--red)' : 'var(--text)', transition: 'all 0.3s' }}>
            {totalMins}:{totalSecs < 10 ? '0' : ''}{totalSecs}
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div style={{ background: 'var(--bg-section)', border: '2px solid var(--border)', borderRadius: '100px', height: '10px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--accent)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: '36px' }}>
        <div className="flex-between" style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentIndex + 1}
          </span>
          {/* Per-question timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', background: '#e2e8f0', borderRadius: '100px', height: '8px', border: '2px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ width: `${qProgress}%`, height: '100%', background: questionTimeLeft <= 5 ? 'var(--red)' : questionTimeLeft <= 10 ? 'var(--orange)' : 'var(--green)', borderRadius: '100px', transition: 'width 1s linear, background 0.3s' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: questionTimeLeft <= 5 ? 'var(--red)' : 'var(--text)', minWidth: '32px' }}>
              {questionTimeLeft}s
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.35rem', lineHeight: '1.5', marginBottom: '32px', fontFamily: "'Zilla Slab', serif", fontWeight: 600 }}>
          {currentQuestion.questionText}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            return (
              <div
                key={idx}
                onClick={() => setSelectedOption(opt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', borderRadius: '12px', cursor: 'pointer',
                  border: `3px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                  transition: 'all 0.12s ease', fontWeight: 600, fontSize: '1rem'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: isSelected ? 'var(--accent)' : 'var(--bg-section)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: isSelected ? '#fff' : 'var(--text)', flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>

        <div className="flex-between" style={{ marginTop: '36px' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            You cannot go back once submitted.
          </p>
          <button
            className="btn-accent"
            onClick={() => handleNext(false)}
            disabled={isSubmitting || !selectedOption}
            style={{ padding: '14px 36px', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Saving...' : isLastQuestion ? 'Finish Exam' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptForm;