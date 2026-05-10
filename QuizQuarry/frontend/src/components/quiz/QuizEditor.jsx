import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';

const QuizEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [accessCode, setAccessCode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(null);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [qs, s] = await Promise.all([quizService.getQuestions(id), quizService.getSettings(id)]);
      setQuestions(qs);
      setSettings(s);
      setSettingsDraft(s);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddQuestion = async () => {
    setAdding(true);
    try {
      await quizService.addAiQuestion(id);
      const [qs, s] = await Promise.all([quizService.getQuestions(id), quizService.getSettings(id)]);
      setQuestions(qs);
      setSettings(s);
      setSettingsDraft(s);
    } finally { setAdding(false); }
  };

  const handleDelete = async (qId) => {
    if (window.confirm('Delete this question permanently?')) {
      await quizService.deleteQuestion(qId);
      setQuestions(questions.filter(q => q.id !== qId));
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const code = await quizService.publish(id);
      if (code) { setAccessCode(code); }
      else { alert('Quiz published successfully!'); navigate('/quizzes'); }
    } catch (err) { alert('Failed to publish'); }
    finally { setPublishing(false); }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await quizService.updateSettings(id, {
        questionTimeLimitSeconds: parseInt(settingsDraft.questionTimeLimitSeconds),
        timeLimitMinutes: parseInt(settingsDraft.timeLimitMinutes),
        maxTabSwitches: parseInt(settingsDraft.maxTabSwitches),
        maxAttempts: parseInt(settingsDraft.maxAttempts),
        accessType: settingsDraft.accessType
      });
      setSettings(updated);
      setSettingsDraft(updated);
      setShowSettings(false);
    } catch (err) { alert('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  // Auto-recalc total time in draft when q-time or count changes
  const handleSettingChange = (field, value) => {
    const next = { ...settingsDraft, [field]: value };
    if (field === 'questionTimeLimitSeconds') {
      const count = questions.length || 1;
      next.timeLimitMinutes = Math.ceil((parseInt(value) || 30) * count / 60);
    }
    setSettingsDraft(next);
  };

  const updateField = (index, field, value) => {
    const newQs = [...questions]; newQs[index][field] = value; setQuestions(newQs);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    const opts = JSON.parse(newQs[qIndex].optionsJson);
    const oldVal = opts[oIndex];
    opts[oIndex] = value;
    newQs[qIndex].optionsJson = JSON.stringify(opts);
    if (oldVal === newQs[qIndex].correctAnswer) newQs[qIndex].correctAnswer = value;
    setQuestions(newQs);
  };

  const setCorrectAnswer = (qIndex, option) => {
    const newQs = [...questions]; newQs[qIndex].correctAnswer = option; setQuestions(newQs);
  };

  const saveQuestion = (q) => { quizService.updateQuestion(q.id, q); };

  const toggleEdit = (qId) => {
    if (editingId === qId) {
      const q = questions.find(q => q.id === qId);
      if (q) saveQuestion(q);
      setEditingId(null);
    } else {
      if (editingId) { const old = questions.find(q => q.id === editingId); if (old) saveQuestion(old); }
      setEditingId(qId);
    }
  };

  if (loading) return <div className="loader">Loading editor...</div>;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '100px' }}>

      {/* Sticky toolbar */}
      <div className="card" style={{ position: 'sticky', top: '80px', zIndex: 10, marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '2px' }}>Quiz Editor</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {questions.length} questions
            {settings && (
              <span style={{ marginLeft: '12px' }}>
                · <strong>{settings.questionTimeLimitSeconds}s</strong>/q
                · Total <strong>{settings.timeLimitMinutes} min</strong>
                · Max <strong>{settings.maxAttempts}</strong> attempt{settings.maxAttempts !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={() => setShowSettings(!showSettings)} style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            Settings
          </button>
          <button className="btn-secondary" onClick={() => navigate('/quizzes')} style={{ padding: '10px 22px' }}>Back</button>
          <button className="btn-accent" onClick={handlePublish} disabled={publishing} style={{ padding: '10px 28px' }}>
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && settingsDraft && (
        <div className="card" style={{ padding: '28px', marginBottom: '28px', border: '3px solid var(--accent)', background: 'var(--accent-light)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Quiz Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Secs / Question</label>
              <input type="number" value={settingsDraft.questionTimeLimitSeconds} min="5" max="300"
                onChange={e => handleSettingChange('questionTimeLimitSeconds', e.target.value)} />
              <small>Auto-updates total time</small>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Total Time (min)</label>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {Math.ceil((parseInt(settingsDraft.questionTimeLimitSeconds) || 30) * questions.length / 60)} min
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Tab Switch Limit</label>
              <input type="number" value={settingsDraft.maxTabSwitches} min="0"
                onChange={e => handleSettingChange('maxTabSwitches', e.target.value)} />
              <small>0 = unlimited</small>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Max Attempts</label>
              <input type="number" value={settingsDraft.maxAttempts} min="1" max="10"
                onChange={e => handleSettingChange('maxAttempts', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => { setShowSettings(false); setSettingsDraft(settings); }}>Cancel</button>
            <button className="btn-accent" onClick={handleSaveSettings} disabled={savingSettings} style={{ padding: '10px 28px' }}>
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, index) => {
          const isEditing = editingId === q.id;
          const opts = JSON.parse(q.optionsJson || '[]');

          return (
            <div key={q.id} className="card" style={{ padding: '24px' }}>
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <span style={{ background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '0.75rem', padding: '6px 14px', borderRadius: '8px', border: '2px solid var(--border)' }}>
                  Q{index + 1}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={isEditing ? 'btn-accent' : 'btn-outline'} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => toggleEdit(q.id)}>
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                  <button onClick={() => handleDelete(q.id)} style={{ background: '#fef2f2', border: '2px solid var(--red)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: 'var(--red)', fontWeight: 700, fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>
              </div>

              {isEditing ? (
                <textarea value={q.questionText} onChange={e => updateField(index, 'questionText', e.target.value)}
                  style={{ width: '100%', fontSize: '1.05rem', fontWeight: 600, fontFamily: "'Zilla Slab', serif", padding: '12px', border: '3px solid var(--accent)', borderRadius: '10px', background: 'var(--accent-light)', minHeight: '80px', resize: 'vertical' }} autoFocus />
              ) : (
                <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: '1.5', marginBottom: '20px', fontFamily: "'Zilla Slab', serif" }}>{q.questionText}</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                {opts.map((opt, oIdx) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isCorrect ? '#d1fae5' : 'var(--bg-section)', padding: '12px 16px', borderRadius: '10px', border: `2px solid ${isCorrect ? 'var(--green)' : 'var(--border)'}`, fontWeight: 600, fontSize: '0.9rem' }}>
                      <span onClick={() => isEditing && setCorrectAnswer(index, opt)}
                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: isCorrect ? 'var(--green)' : 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: isCorrect ? '#fff' : 'var(--text)', flexShrink: 0, cursor: isEditing ? 'pointer' : 'default', transition: 'all 0.12s' }}
                        title={isEditing ? 'Click to set as correct answer' : ''}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {isEditing ? (
                        <input type="text" value={opt} onChange={e => updateOption(index, oIdx, e.target.value)}
                          style={{ flex: 1, border: '2px solid var(--border)', background: 'var(--bg-card)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', fontWeight: 600 }} />
                      ) : (
                        <span style={{ flex: 1 }}>{opt}</span>
                      )}
                      {isCorrect && <span style={{ color: 'var(--green)', fontWeight: 800 }}>&#10003;</span>}
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Tip: Click the letter badge (A, B, C, D) to change the correct answer.
                </p>
              )}

              <div style={{ marginTop: '16px', padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '2px solid var(--orange)', borderLeft: '6px solid var(--orange)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '4px', letterSpacing: '0.05em' }}>AI Explanation</div>
                {isEditing ? (
                  <textarea value={q.explanation} onChange={e => updateField(index, 'explanation', e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem', padding: '10px', border: '2px solid var(--orange)', borderRadius: '8px', background: '#fff', minHeight: '70px', resize: 'vertical', fontFamily: "'Inter', sans-serif" }} />
                ) : (
                  <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: '1.5' }}>{q.explanation}</p>
                )}
              </div>
            </div>
          );
        })}

        <button onClick={handleAddQuestion} disabled={adding}
          style={{ padding: '24px', border: '3px dashed var(--border)', background: 'var(--bg-section)', borderRadius: 'var(--radius)', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text)', transition: 'all 0.12s', fontFamily: "'Inter', sans-serif" }}
          onMouseOver={e => { e.target.style.background = 'var(--accent-light)'; }}
          onMouseOut={e => { e.target.style.background = 'var(--bg-section)'; }}>
          {adding ? 'AI is generating...' : '+ Add One More AI Question'}
        </button>
      </div>

      {/* Access code modal */}
      {accessCode && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ textAlign: 'center', padding: '48px', maxWidth: '420px' }}>
            <h2 style={{ marginBottom: '8px' }}>Quiz Published!</h2>
            <p className="text-muted" style={{ marginBottom: '28px' }}>Share this access code with your students:</p>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '10px', color: 'var(--accent)', padding: '20px', background: 'var(--accent-light)', borderRadius: '12px', border: '3px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
              {accessCode}
            </div>
            <button className="btn-accent" onClick={() => navigate('/quizzes')} style={{ padding: '14px 40px' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
