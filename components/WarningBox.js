export default function WarningBox({ level, score, emoji, indexWarnings, sectorWarnings, signals }) {
  const colors = {
    HEALTHY: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: '#34d399',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
    },
    MODERATE: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      border: '#fbbf24',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
    },
    DANGER: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      border: '#f87171',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
    }
  };

  const currentColor = colors[level] || colors.MODERATE;

  return (
    <div
      style={{
        background: currentColor.bg,
        border: `2px solid ${currentColor.border}`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: currentColor.shadow,
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          {level}
        </h2>
        <span style={{ fontSize: '48px' }}>{emoji}</span>
      </div>
      
      <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '8px 0' }}>
        {score}
      </div>
      
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        <div>Index Warnings: {indexWarnings}</div>
        <div>Sector Warnings: {sectorWarnings}</div>
      </div>

      {signals && signals.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.95 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Warning Signals:</div>
          {signals.map((signal, idx) => (
            <div key={idx}>{signal}</div>
          ))}
        </div>
      )}
    </div>
  );
}



