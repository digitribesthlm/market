export default function TradingSignalCard({ signal, isExpanded, onToggle }) {
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
      transition: 'all 0.3s',
      cursor: 'pointer'
    }}
    onClick={onToggle}
    onMouseEnter={(e) => {
      if (!isExpanded) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isExpanded) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      }
    }}>
      {/* Main Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {signal.symbol}
            </h3>
            {signal.count > 1 && (
              <span style={{ fontSize: '18px', opacity: 0.6 }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', opacity: 0.6, margin: '4px 0 0 0' }}>
            {timeAgo}
            {signal.count > 1 && (
              <span style={{ 
                marginLeft: '8px', 
                background: 'rgba(59, 130, 246, 0.2)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                color: '#3b82f6',
                fontWeight: 'bold'
              }}>
                {signal.count} signals
              </span>
            )}
          </p>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
          ${(signal.price?.$numberDouble || signal.price || 0).toFixed(2)}
        </div>
      </div>

      {/* All Unique Signals */}
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

      {/* Expanded View - All Individual Entries */}
      {isExpanded && signal.allEntries && signal.allEntries.length > 1 && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #334155'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', opacity: 0.8 }}>
            Signal History ({signal.allEntries.length} entries)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {signal.allEntries.map((entry, idx) => {
              const entryDate = new Date(entry.timestamp);
              const entryTimeAgo = getTimeAgo(entryDate);
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #334155'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>
                      {entryTimeAgo}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                      ${(entry.price?.$numberDouble || entry.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {entry.signals && entry.signals.map((signalType, sIdx) => {
                      const signalInfo = getSignalInfo(signalType);
                      return (
                        <div
                          key={sIdx}
                          style={{
                            background: signalInfo.bg,
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          {signalInfo.name}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px' }}>
                    {entryDate.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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

