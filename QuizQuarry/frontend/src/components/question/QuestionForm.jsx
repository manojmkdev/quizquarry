import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../../store/slices/questionSlice';
import { fetchBanks } from '../../store/slices/questionBankSlice';
import questionService from '../../services/questionService';

const QuestionForm = ({ onClose }) => {
  const [bankId, setBankId] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [generating, setGenerating] = useState(false);
  const dispatch = useDispatch();
  const { items: banks } = useSelector(state => state.questionBank);

  useEffect(() => { dispatch(fetchBanks()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await questionService.generateAiQuestions({ bankId, topic, count, difficulty });
      dispatch(fetchQuestions());
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate AI questions');
    }
    setGenerating(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Generate Questions via AI</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question Bank *</label>
            <select value={bankId} onChange={(e) => setBankId(e.target.value)} required>
              <option value="">Select a Bank...</option>
              {banks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="topic">Topic *</label>
            <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. Thermodynamics" />
          </div>
          <div className="form-group flex-row">
            <div style={{flex: 1}}>
              <label>Count</label>
              <input type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" max="20" required />
            </div>
            <div style={{flex: 1}}>
              <label htmlFor="difficulty">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={generating}>
            {generating ? 'AI is generating...' : 'Generate with Gemini AI'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default QuestionForm;
