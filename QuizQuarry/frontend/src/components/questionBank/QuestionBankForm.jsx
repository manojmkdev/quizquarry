import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchBanks } from '../../store/slices/questionBankSlice';
import questionBankService from '../../services/questionBankService';

const QuestionBankForm = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await questionBankService.create({ title, subjectArea });
    dispatch(fetchBanks());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Question Bank</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Advanced Biology" />
          </div>
          <div className="form-group">
            <label>Subject Area *</label>
            <input value={subjectArea} onChange={(e) => setSubjectArea(e.target.value)} required placeholder="e.g. Science" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Bank</button>
        </form>
      </div>
    </div>
  );
};
export default QuestionBankForm;
