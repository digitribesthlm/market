export default function TradingSignalCard({ signal }) {
  const signalColors = {
    'bull_flag': { bg: '#10b981', name: '🚩 Bull Flag' },
    'bear_flag': { bg: '#ef4444', name: '🚩 Bear Flag' },
    'golden_cross': { bg: '#fbbf24', name: '✨ Golden Cross' },
    'death_cross': { bg: '#991b1b', name: '💀 Death Cross' },
    'breakout': { bg: '#3b82f6', name: '🚀 Breakout' },
    'breakdown': { bg: '#dc2626', name: '📉 Breakdown' },
    'reversal': { bg: '#8b5cf6', name: '🔄 Reversal' },
    'support': { bg: '#059669', name: '🛡️ Support' },
    'resistance': { bg: '#ea580c', name: '⛔ Resistance' }
  };

  const getSignalInfo = (signalType) => {
    return signalColors[signalType] || { bg: '#64748b', name: `📊 ${signalType}` };
  };

  const date = new Date(signal.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '2px solid #334155',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
            {signal.symbol}
          </h3>
          <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>{timeAgo}</p>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
          ${(signal.price?.$numberDouble || signal.price || 0).toFixed(2)}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {signal.signals && signal.signals.map((signalType, idx) => {
          const signalInfo = getSignalInfo(signalType);
          return (
            <div
              key={idx}
              style={{
                background: signalInfo.bg,
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: `0 2px 8px ${signalInfo.bg}44`
              }}
            >
              {signalInfo.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

