import React, { useState, useEffect } from 'react';
import quizService from '../../services/quizService';

const QuizForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    concepts: '',
    questionTimeLimitSeconds: 30,
    initialQuestionCount: 10,
    accessType: 'PUBLIC',
    maxTabSwitches: 3,
    maxAttempts: 1
  });
  const [loading, setLoading] = useState(false);


  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await quizService.create({
        ...formData,
        timeLimitMinutes: derivedMins,
        questionTimeLimitSeconds: parseInt(formData.questionTimeLimitSeconds),
        initialQuestionCount: parseInt(formData.initialQuestionCount),
        maxTabSwitches: parseInt(formData.maxTabSwitches),
        maxAttempts: parseInt(formData.maxAttempts)
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Derived auto-time display
  const derivedMins = Math.ceil(
    (parseInt(formData.initialQuestionCount) || 1) * (parseInt(formData.questionTimeLimitSeconds) || 30) / 60
  );

  return (
    <div className="modal-overlay">
      <div className="card modal-content" style={{ width: '540px', maxHeight: '92vh', overflowY: 'auto', padding: '36px' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Create AI Quiz</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Let AI generate questions from your topics</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '3px solid var(--border)', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', boxShadow: 'var(--shadow-sm)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>Quiz Title</label>
            <input type="text" placeholder="e.g., Intro to Quantum Physics" value={formData.title}
              onChange={e => handleChange('title', e.target.value)} required />
          </div>

          {/* Concepts */}
          <div className="form-group">
            <label>Concepts / Topics</label>
            <textarea placeholder="Describe what the quiz should cover..." value={formData.concepts}
              onChange={e => handleChange('concepts', e.target.value)} required style={{ minHeight: '90px', resize: 'vertical' }} />
            <small>AI will generate questions based on these concepts.</small>
          </div>

          {/* Question count + per-Q time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Questions</label>
              <input type="number" value={formData.initialQuestionCount}
                onChange={e => handleChange('initialQuestionCount', e.target.value)} required min="1" max="50" />
            </div>
            <div className="form-group">
              <label>Secs / Question</label>
              <input type="number" value={formData.questionTimeLimitSeconds}
                onChange={e => handleChange('questionTimeLimitSeconds', e.target.value)} required min="5" max="300" />
              <small>Per-question timer</small>
            </div>
          </div>

          {/* Total time — auto calculated */}
          <div className="form-group">
            <label style={{ margin: 0, marginBottom: '6px', display: 'block' }}>Total Time (minutes)</label>
            <div style={{ padding: '10px 14px', background: 'var(--accent-light)', border: '2px solid var(--accent)', borderRadius: '10px', fontWeight: 800, fontSize: '1rem' }}>
              {derivedMins} min
              <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                ({formData.initialQuestionCount} q × {formData.questionTimeLimitSeconds}s ÷ 60)
              </span>
            </div>
          </div>

          {/* Access type + Tab switches */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Access Type</label>
              <select value={formData.accessType} onChange={e => handleChange('accessType', e.target.value)}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tab Switch Limit</label>
              <input type="number" value={formData.maxTabSwitches}
                onChange={e => handleChange('maxTabSwitches', e.target.value)} />
              <small>0 = unlimited</small>
            </div>
          </div>

          {/* Max Attempts */}
          <div className="form-group">
            <label>Max Attempts per Student</label>
            <input type="number" value={formData.maxAttempts}
              onChange={e => handleChange('maxAttempts', e.target.value)} required min="1" max="10" />
            <small>Students can attempt this quiz this many times. After reaching the limit, they'll see "Limit Exceeded".</small>
          </div>

          <button type="submit" className="btn-accent" style={{ width: '100%', padding: '16px', marginTop: '12px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'AI is generating questions...' : 'Generate Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;
