import React from 'react';

const StatCards = ({ items }) => (
  <div className="stats-container">
    {items.map((stat, idx) => (
      <div key={idx} className="stat-card">
        <div className="stat-label">{stat.label}</div>
        <div className="stat-value">{stat.value}</div>
      </div>
    ))}
  </div>
);
export default StatCards;
