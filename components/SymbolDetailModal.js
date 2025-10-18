import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SymbolDetailModal({ symbol, fullName, data, onClose }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = data.map(entry => {
    const symbolData = entry.analysis?.detailed_results?.[symbol];
    if (!symbolData) return null;
    
    const date = new Date(entry.timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleString(),
      price: symbolData.price?.$numberDouble || symbolData.price || 0,
      stoch_14: symbolData.stoch_14?.$numberDouble || symbolData.stoch_14?.$numberInt || symbolData.stoch_14 || 0,
      above_ema: symbolData.above_ema,
      overbought: symbolData.overbought,
      warnings: symbolData.warning_count?.$numberInt || symbolData.warning_count || 0
    };
  }).filter(item => item !== null);

  const latestData = chartData[chartData.length - 1];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '12px' }}>
            {payload[0].payload.fullDate}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '12px' }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '2px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
              {symbol}
            </h2>
            {fullName && (
              <p style={{ fontSize: '18px', opacity: 0.7, margin: 0 }}>{fullName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #334155',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '24px',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            ×
          </button>
        </div>

        {/* Current Stats */}
        {latestData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Current Price</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                ${latestData.price.toFixed(2)}
              </div>
            </div>
            
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Stochastic 14</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {latestData.stoch_14.toFixed(1)}
              </div>
            </div>
            
            <div style={{
              background: `rgba(${latestData.above_ema ? '16, 185, 129' : '239, 68, 68'}, 0.1)`,
              border: `1px solid ${latestData.above_ema ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Above EMA</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: latestData.above_ema ? '#10b981' : '#ef4444' }}>
                {latestData.above_ema ? 'YES' : 'NO'}
              </div>
            </div>
            
            <div style={{
              background: `rgba(${latestData.overbought ? '245, 158, 11' : '16, 185, 129'}, 0.1)`,
              border: `1px solid ${latestData.overbought ? '#f59e0b' : '#10b981'}`,
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Overbought</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: latestData.overbought ? '#f59e0b' : '#10b981' }}>
                {latestData.overbought ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        )}

        {/* Price Chart */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Price Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                name="Price ($)"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stochastic Chart */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Stochastic Oscillator (14)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* Overbought/Oversold zones */}
              <Line 
                type="monotone" 
                dataKey={() => 80} 
                name="Overbought (80)"
                stroke="#ef4444" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey={() => 20} 
                name="Oversold (20)"
                stroke="#10b981" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="stoch_14" 
                name="Stochastic 14"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


