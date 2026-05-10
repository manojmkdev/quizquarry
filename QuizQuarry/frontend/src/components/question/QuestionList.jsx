import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../../store/slices/questionSlice';
import { fetchBanks } from '../../store/slices/questionBankSlice';
import QuestionForm from './QuestionForm';
import EmptyState from '../common/EmptyState';

const QuestionList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.question);
  const { items: banks } = useSelector(state => state.questionBank);
  const [showModal, setShowModal] = useState(false);
  const [filterBankId, setFilterBankId] = useState('');

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchBanks());
  }, [dispatch]);

  const filteredItems = filterBankId ? items.filter(q => q.questionBankId === Number(filterBankId)) : items;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '15px' }}>
        <h2>Questions</h2>
        <div>
          <select
            value={filterBankId}
            onChange={(e) => setFilterBankId(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Question Banks</option>
            {banks.map(b => (
              <option key={b.id} value={b.id}>{b.title} (ID: {b.id})</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Generate via AI</button>
        </div>
      </div>
      {loading ? <p>Loading...</p> : filteredItems.length === 0 ? (
        <EmptyState message="No questions generated yet." actionText="Generate via AI" onAction={() => setShowModal(true)} />
      ) : (
        <table className="table">
          <thead><tr><th>Questions</th><th>Difficulty</th><th>Bank ID</th></tr></thead>
          <tbody>
            {filteredItems.map(q => (
              <tr key={q.id}><td>{q.questionText}</td><td>{q.difficultyLevel}</td><td>{q.questionBankId}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && <QuestionForm onClose={() => setShowModal(false)} />}
    </div>
  );
};
export default QuestionList;
