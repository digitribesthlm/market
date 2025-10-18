export default function HoldingsBoxes({ positions = [] }) {
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
        <p style={{ fontSize: '16px', fontWeight: '500' }}>No active holdings</p>
      </div>
    );
  }

  const groupedByPortfolio = positions.reduce((acc, position) => {
    const portfolio = position.fields.Portfolio || 'Other';
    if (!acc[portfolio]) {
      acc[portfolio] = [];
    }
    acc[portfolio].push(position);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {Object.entries(groupedByPortfolio).map(([portfolio, portfolioPositions]) => (
        <div key={portfolio}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1e293b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            paddingLeft: '4px'
          }}>
            {portfolio}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {portfolioPositions.map((position) => {
              const fields = position.fields;
              const shares = parseFloat(fields.Shares) || 0;
              const buyPrice = parseFloat(fields.Price) || 0;
              
              // Use new calculated fields if available, otherwise calculate
              const currentPrice = parseFloat(fields.current_price) || parseFloat(fields.Price) || 0;
              const totalInvested = fields.total_invested?.$numberDouble 
                ? parseFloat(fields.total_invested.$numberDouble)
                : fields.total_invested?.$numberInt 
                ? parseInt(fields.total_invested.$numberInt) 
                : parseFloat(fields.total_invested) || shares * buyPrice;
              const currentValue = fields.current_value?.$numberDouble 
                ? parseFloat(fields.current_value.$numberDouble)
                : fields.current_value?.$numberInt 
                ? parseInt(fields.current_value.$numberInt)
                : parseFloat(fields.current_value) || shares * currentPrice;
              const profitLoss = fields.profit_loss?.$numberDouble 
                ? parseFloat(fields.profit_loss.$numberDouble)
                : fields.profit_loss?.$numberInt 
                ? parseInt(fields.profit_loss.$numberInt)
                : parseFloat(fields.profit_loss) || currentValue - totalInvested;
              const percentChange = fields.percent_change?.$numberDouble 
                ? parseFloat(fields.percent_change.$numberDouble)
                : parseFloat(fields.percent_change) || ((currentPrice - buyPrice) / buyPrice * 100);
              
              const stopLoss = fields['STOP LOSS'] ? parseFloat(fields['STOP LOSS'].toString().replace(',', '.')) : null;
              const stopWin = fields['STOP WIN'] ? parseFloat(fields['STOP WIN'].toString().replace(',', '.')) : null;
              const stopStatus = fields.stop_status || fields.Status || null;
              const analysisNote = fields.analysis_note || null;
              
              // Parse Sub Formula
              let subFormulas = [];
              if (fields['Sub Formula']) {
                try {
                  if (typeof fields['Sub Formula'] === 'string') {
                    subFormulas = JSON.parse(fields['Sub Formula']);
                  } else if (Array.isArray(fields['Sub Formula'])) {
                    subFormulas = fields['Sub Formula'];
                  }
                } catch (e) {
                  subFormulas = [];
                }
              }

              return (
                <div
                  key={position.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header: Ticker and Stop Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {fields.Ticker || 'N/A'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '2px'
                      }}>
                        {fields.Name || ''}
                      </div>
                    </div>
                    {stopStatus && (
                      <span style={{
                        background: stopStatus.toLowerCase() === 'holding' 
                          ? 'rgba(59, 130, 246, 0.1)'
                          : stopStatus.toLowerCase() === 'buy'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                        color: stopStatus.toLowerCase() === 'holding'
                          ? '#3b82f6'
                          : stopStatus.toLowerCase() === 'buy'
                          ? '#10b981'
                          : '#ef4444',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {stopStatus}
                      </span>
                    )}
                  </div>

                  {/* Sub Formula Labels */}
                  {subFormulas.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      {subFormulas.map((formula, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {formula}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>
                        Current Price
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                        {currentPrice.toFixed(2)} {fields.Currency || 'USD'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>
                        Shares
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                        {shares.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>
                        Invested
                      </div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {totalInvested.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>
                        Current Value
                      </div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {currentValue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Profit/Loss */}
                  <div style={{
                    background: profitLoss >= 0 
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Profit/Loss
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: profitLoss >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {percentChange.toFixed(2)}%
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: profitLoss >= 0 ? '#10b981' : '#ef4444',
                      marginTop: '4px'
                    }}>
                      {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Stop Loss/Win */}
                  {(stopLoss || stopWin) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '11px',
                      marginBottom: '12px'
                    }}>
                      {stopLoss && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '8px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}>
                          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Stop Loss</div>
                          <div style={{ color: '#ef4444', fontWeight: '600' }}>
                            {stopLoss.toString().replace(',', '.')}
                          </div>
                        </div>
                      )}
                      {stopWin && (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '8px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}>
                          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Stop Win</div>
                          <div style={{ color: '#10b981', fontWeight: '600' }}>
                            {stopWin.toString().replace(',', '.')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analysis Note */}
                  {analysisNote && (
                    <div style={{
                      background: 'rgba(100, 116, 139, 0.05)',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#64748b',
                      lineHeight: '1.4',
                      marginBottom: '12px',
                      fontStyle: 'italic',
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      {analysisNote}
                    </div>
                  )}

                  {/* Buy Date */}
                  {fields.BuyDate && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e2e8f0',
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      Buy Date: {fields.BuyDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
