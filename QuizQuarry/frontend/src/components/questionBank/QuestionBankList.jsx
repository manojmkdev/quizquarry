import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanks } from '../../store/slices/questionBankSlice';
import QuestionBankForm from './QuestionBankForm';
import EmptyState from '../common/EmptyState';

const QuestionBankList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.questionBank);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { dispatch(fetchBanks()); }, [dispatch]);

  return (
    <div className="card">
      <div className="flex-between">
        <h2>Question Banks</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Bank</button>
      </div>
      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <EmptyState message="You haven't created any question banks yet." actionText="+ Create First Bank" onAction={() => setShowModal(true)} />
      ) : (
        <table className="table">
          <thead><tr><th>ID</th><th>Title</th><th>Subject Area</th></tr></thead>
          <tbody>
            {items.map(b => (
              <tr key={b.id}><td>{b.id}</td><td>{b.title}</td><td>{b.subjectArea}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && <QuestionBankForm onClose={() => setShowModal(false)} />}
    </div>
  );
};
export default QuestionBankList;
