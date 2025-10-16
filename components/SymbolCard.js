export default function SymbolCard({ symbol, data, fullName, onClick }) {
  const warningColor = data.warning_count?.$numberInt > 0 || data.warning_count > 0 ? '#ef4444' : '#10b981';
  const overboughtColor = data.overbought ? '#f59e0b' : '#64748b';
  const emaColor = data.above_ema ? '#10b981' : '#ef4444';

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid #334155',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onClick={onClick}
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
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>{symbol}</h3>
          {fullName && (
            <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>{fullName}</p>
          )}
        </div>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: warningColor,
          boxShadow: `0 0 8px ${warningColor}`,
          flexShrink: 0,
          marginTop: '4px'
        }} />
      </div>
      
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
        ${(data.price?.$numberDouble || data.price || 0).toFixed(2)}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
        <div>
          <span style={{ opacity: 0.7 }}>Stoch 14: </span>
          <span style={{ fontWeight: 'bold' }}>
            {(data.stoch_14?.$numberDouble || data.stoch_14?.$numberInt || data.stoch_14 || 0).toFixed(1)}
          </span>
        </div>
        
        <div>
          <span style={{ opacity: 0.7 }}>Warnings: </span>
          <span style={{ fontWeight: 'bold', color: warningColor }}>
            {data.warning_count?.$numberInt || data.warning_count || 0}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ opacity: 0.7 }}>Above EMA: </span>
          <span style={{ color: emaColor, fontWeight: 'bold' }}>
            {data.above_ema ? '✓' : '✗'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ opacity: 0.7 }}>Overbought: </span>
          <span style={{ color: overboughtColor, fontWeight: 'bold' }}>
            {data.overbought ? '⚠' : '✓'}
          </span>
        </div>
      </div>
    </div>
  );
}

