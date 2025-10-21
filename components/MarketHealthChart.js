import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MarketHealthChart({ data }) {
  const chartData = data.map(entry => {
    const date = new Date(entry.timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      score: entry.analysis?.market_health_score?.$numberInt || entry.analysis?.market_health_score || 0,
      indexWarnings: entry.analysis?.index_warnings?.$numberInt || entry.analysis?.index_warnings || 0,
      sectorWarnings: entry.analysis?.sector_warnings?.$numberInt || entry.analysis?.sector_warnings || 0
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {payload[0].payload.date} {payload[0].payload.time}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '2px solid #334155',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Market Health Score Over Time
      </h2>
      <ResponsiveContainer width="100%" height={400}>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            name="Health Score"
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="indexWarnings" 
            name="Index Warnings"
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="sectorWarnings" 
            name="Sector Warnings"
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}



