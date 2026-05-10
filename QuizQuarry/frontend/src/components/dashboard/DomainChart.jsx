import React from 'react';

const DomainChart = ({ title, data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barColors = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--purple)'];

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </div>
            <div style={{ flex: 1, background: 'var(--bg-section)', height: '28px', borderRadius: '8px', border: '2px solid var(--border)', overflow: 'hidden' }}>
              <div style={{
                width: `${(item.value / maxVal) * 100}%`,
                background: barColors[idx % barColors.length],
                height: '100%',
                borderRadius: '6px',
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8px'
              }}>
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>{item.value}</span>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-muted">No data available yet.</p>}
      </div>
    </div>
  );
};
export default DomainChart;
