import React from 'react';

const EmptyState = ({ message, actionText, onAction }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ width: '80px', height: '80px', background: 'var(--accent-light)', border: '3px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.2rem', fontWeight: 900, boxShadow: 'var(--shadow-sm)' }}>
      ?
    </div>
    <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>
      {message || 'No records found.'}
    </p>
    {actionText && onAction && (
      <button className="btn-accent" onClick={onAction}>{actionText}</button>
    )}
  </div>
);
export default EmptyState;
