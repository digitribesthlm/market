import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MarketHealthChart({ data }) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let chartData = data.map(entry => {
    const date = new Date(entry.timestamp);
    return {
      // Use a numeric x-value so Recharts can scale time properly across days
      timestampMs: date.getTime(),
      fullDate: date.toLocaleString('en-US', { timeZone: userTimeZone, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: entry.analysis?.market_health_score?.$numberInt || entry.analysis?.market_health_score || 0,
      indexWarnings: entry.analysis?.index_warnings?.$numberInt || entry.analysis?.index_warnings || 0,
      sectorWarnings: entry.analysis?.sector_warnings?.$numberInt || entry.analysis?.sector_warnings || 0,
      // Pull SPY price if available; null will create gaps instead of zeroes
      spyPrice: (() => {
        const spy = entry.analysis?.detailed_results?.SPY;
        const price = spy?.price?.$numberDouble || spy?.price || null;
        return price !== null ? Number(price) : null;
      })()
    };
  });

  // Compute SPY percent change from the first available SPY price within the window
  const firstSpyPrice = chartData.find(d => d.spyPrice !== null && d.spyPrice !== undefined)?.spyPrice;
  const spyPctChanges = chartData.map(d => (firstSpyPrice && d.spyPrice !== null && d.spyPrice !== undefined)
    ? ((d.spyPrice / firstSpyPrice) - 1) * 100
    : null
  );

  const finiteChanges = spyPctChanges.filter(v => typeof v === 'number' && isFinite(v));
  const minChange = finiteChanges.length ? Math.min(...finiteChanges) : 0;
  const maxChange = finiteChanges.length ? Math.max(...finiteChanges) : 0;
  const absMax = Math.max(Math.abs(minChange), Math.abs(maxChange), 1e-6);

  // Normalize percent change to 0..100 with 50 as 0% baseline
  chartData = chartData.map((d, i) => {
    const pct = spyPctChanges[i];
    const norm = (typeof pct === 'number' && isFinite(pct)) ? Math.max(0, Math.min(100, 50 + (pct / absMax) * 50)) : null;
    return { ...d, spyPctChange: pct, spyPctNorm: norm };
  });

  // Correlation controls
  const [lag, setLag] = useState(0); // -1: SPY lags, 0: aligned, +1: SPY leads
  const [windowSize, setWindowSize] = useState(20);

  const correlation = useMemo(() => {
    if (!chartData || chartData.length < 3) return null;
    const pairs = [];
    const n = chartData.length;
    for (let i = Math.max(0, n - windowSize); i < n; i++) {
      const spyIndex = i + lag;
      if (spyIndex < 0 || spyIndex >= n) continue;
      const score = chartData[i]?.score;
      const spyPct = chartData[spyIndex]?.spyPctChange;
      if (typeof score === 'number' && typeof spyPct === 'number' && isFinite(score) && isFinite(spyPct)) {
        pairs.push([score, spyPct]);
      }
    }
    if (pairs.length < 3) return null;
    const xs = pairs.map(p => p[0]);
    const ys = pairs.map(p => p[1]);
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0, dx2 = 0, dy2 = 0;
    for (let k = 0; k < pairs.length; k++) {
      const dx = xs[k] - mx;
      const dy = ys[k] - my;
      num += dx * dy;
      dx2 += dx * dx;
      dy2 += dy * dy;
    }
    const den = Math.sqrt(dx2 * dy2);
    if (den === 0) return null;
    return num / den;
  }, [chartData, lag, windowSize]);

  // Create a display dataset where the SPY normalized series is shifted by `lag`
  const displayData = useMemo(() => {
    const n = chartData.length;
    return chartData.map((d, i) => {
      const j = i + lag;
      const spyPctNormLagged = (j >= 0 && j < n) ? chartData[j].spyPctNorm : null;
      return { ...d, spyPctNormLagged };
    });
  }, [chartData, lag]);

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
            {payload[0].payload.fullDate}
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
      {/* Correlation and controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Correlation last {Math.min(windowSize, chartData.length)} pts (lag {lag}):{' '}
          <span style={{
            fontWeight: 'bold',
            color: correlation == null ? '#94a3b8' : (correlation > 0.5 ? '#10b981' : (correlation < -0.5 ? '#ef4444' : '#f59e0b'))
          }}>
            {correlation == null ? 'n/a' : correlation.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Lag</label>
          <select value={lag} onChange={e => setLag(parseInt(e.target.value, 10))} style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }}>
            <option value={-1}>-1</option>
            <option value={0}>0</option>
            <option value={1}>+1</option>
          </select>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Window</label>
          <select value={windowSize} onChange={e => setWindowSize(parseInt(e.target.value, 10))} style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px', padding: '4px 6px', fontSize: '12px' }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="timestampMs"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickFormatter={(ms) => new Date(ms).toLocaleString('en-US', { timeZone: userTimeZone, month: 'short', day: 'numeric', hour: '2-digit' })}
          />
          {/* Left axis for scores/warnings */}
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          {/* Right axis for SPY price */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
            allowDecimals={false}
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
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="indexWarnings" 
            name="Index Warnings"
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            yAxisId="left"
          />
          <Line 
            type="monotone" 
            dataKey="sectorWarnings" 
            name="Sector Warnings"
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
            yAxisId="left"
          />
          {/* SPY percent change normalized to 0..100 (50 = 0%) */}
          <Line 
            type="monotone" 
            dataKey="spyPctNormLagged" 
            name="SPY % (normalized)"
            stroke="#a78bfa" 
            strokeWidth={2}
            dot={{ fill: '#a78bfa', r: 2 }}
            strokeDasharray="4 2"
            yAxisId="left"
            connectNulls
          />
          {/* SPY price line */}
          <Line 
            type="monotone" 
            dataKey="spyPrice" 
            name="SPY Price ($)"
            stroke="#60a5fa" 
            strokeWidth={2}
            dot={{ fill: '#60a5fa', r: 2 }}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}



