export default function PositionsCard({ positions = [] }) {
  if (!positions || positions.length === 0) {
    return (
      <div style={{
        background: 'rgba(148, 163, 184, 0.1)',
        border: '2px solid #94a3b8',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>No active positions</p>
      </div>
    );
  }

  // Group positions by portfolio
  const groupedByPortfolio = positions.reduce((acc, position) => {
    const portfolio = position.fields.Portfolio || 'Other';
    if (!acc[portfolio]) {
      acc[portfolio] = [];
    }
    acc[portfolio].push(position);
    return acc;
  }, {});

  const calculateGainLoss = (shares, buyPrice, currentPrice) => {
    if (!shares || !buyPrice || !currentPrice) return null;
    return ((currentPrice - buyPrice) * shares);
  };

  const calculateGainLossPercent = (buyPrice, currentPrice) => {
    if (!buyPrice || !currentPrice) return null;
    return (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      {Object.entries(groupedByPortfolio).map(([portfolio, portfolioPositions]) => (
        <div key={portfolio} style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1e293b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {portfolio}
          </h3>
          
          <div style={{
            overflowX: 'auto',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              backgroundColor: '#fff'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  fontWeight: '600'
                }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #e2e8f0' }}>Ticker</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Shares</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Buy Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Current Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Gain/Loss %</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Gain/Loss $</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Stop Loss/Win</th>
                </tr>
              </thead>
              <tbody>
                {portfolioPositions.map((position, idx) => {
                  const fields = position.fields;
                  const shares = parseFloat(fields.Shares) || 0;
                  const buyPrice = parseFloat(fields.Price) || 0;
                  const currentPrice = parseFloat(fields.Price) || 0;
                  const stopLoss = parseFloat(fields['STOP LOSS']) || null;
                  const stopWin = parseFloat(fields['STOP WIN']) || null;
                  const gainLossPercent = calculateGainLossPercent(buyPrice, currentPrice);
                  const gainLossAmount = calculateGainLoss(shares, buyPrice, currentPrice);

                  // Determine status color
                  let statusColor = '#94a3b8';
                  let statusBg = 'rgba(148, 163, 184, 0.1)';
                  
                  if (fields.Status) {
                    if (fields.Status.toLowerCase() === 'active') {
                      statusColor = '#10b981';
                      statusBg = 'rgba(16, 185, 129, 0.1)';
                    } else if (fields.Status.toLowerCase() === 'closed') {
                      statusColor = '#ef4444';
                      statusBg = 'rgba(239, 68, 68, 0.1)';
                    }
                  }

                  return (
                    <tr
                      key={position.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8fafc';
                      }}
                    >
                      <td style={{
                        padding: '12px',
                        fontWeight: '600',
                        color: '#1e293b',
                        borderRight: '1px solid #e2e8f0'
                      }}>
                        {fields.Ticker || 'N/A'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e2e8f0',
                        color: '#475569'
                      }}>
                        {shares.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e2e8f0',
                        color: '#475569'
                      }}>
                        ${buyPrice.toFixed(2)}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e2e8f0',
                        color: '#475569'
                      }}>
                        ${currentPrice.toFixed(2)}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e2e8f0',
                        fontWeight: '600',
                        color: gainLossPercent !== null
                          ? parseFloat(gainLossPercent) >= 0 ? '#10b981' : '#ef4444'
                          : '#94a3b8'
                      }}>
                        {gainLossPercent !== null ? `${gainLossPercent}%` : 'N/A'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        borderRight: '1px solid #e2e8f0',
                        fontWeight: '600',
                        color: gainLossAmount !== null
                          ? gainLossAmount >= 0 ? '#10b981' : '#ef4444'
                          : '#94a3b8'
                      }}>
                        {gainLossAmount !== null ? `$${gainLossAmount.toFixed(2)}` : 'N/A'}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderRight: '1px solid #e2e8f0'
                      }}>
                        {fields.Status ? (
                          <span style={{
                            background: statusBg,
                            color: statusColor,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {fields.Status}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>
                        {stopLoss || stopWin ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {stopLoss && (
                              <span style={{ color: '#ef4444', fontWeight: '500' }}>
                                SL: ${stopLoss.toFixed(2)}
                              </span>
                            )}
                            {stopWin && (
                              <span style={{ color: '#10b981', fontWeight: '500' }}>
                                SW: ${stopWin.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

