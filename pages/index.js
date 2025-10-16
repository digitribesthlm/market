import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import WarningBox from '../components/WarningBox';
import MarketHealthChart from '../components/MarketHealthChart';
import SymbolCard from '../components/SymbolCard';
import SymbolDetailModal from '../components/SymbolDetailModal';
import TradingSignalCard from '../components/TradingSignalCard';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [tradingSignals, setTradingSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [selectedSymbolName, setSelectedSymbolName] = useState(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState(null);
  const [stockAnalysisLoading, setStockAnalysisLoading] = useState(false);
  const [stockAnalysisMessage, setStockAnalysisMessage] = useState(null);
  const [expandedSignal, setExpandedSignal] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    
    fetchMarketData();
    fetchTradingSignals();
    const interval = setInterval(() => {
      fetchMarketData();
      fetchTradingSignals();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [router]);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market-data');
      const result = await response.json();
      
      if (result.success) {
        setMarketData(result.data);
        setLatestData(result.data[result.data.length - 1]);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch market data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingSignals = async () => {
    try {
      const response = await fetch('/api/trading-signals');
      const result = await response.json();
      
      if (result.success) {
        setTradingSignals(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch trading signals:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const triggerWebhook = async () => {
    setWebhookLoading(true);
    setWebhookMessage(null);

    try {
      const response = await fetch('/api/trigger-webhook', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setWebhookMessage({ type: 'success', text: 'Market check triggered successfully!' });
        // Refresh data after webhook
        setTimeout(() => {
          fetchMarketData();
          fetchTradingSignals();
        }, 2000);
      } else {
        setWebhookMessage({ type: 'error', text: data.error || 'Failed to trigger webhook' });
      }
    } catch (err) {
      setWebhookMessage({ type: 'error', text: 'Failed to trigger webhook' });
      console.error(err);
    } finally {
      setWebhookLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setWebhookMessage(null), 5000);
    }
  };

  const triggerStockAnalysis = async () => {
    setStockAnalysisLoading(true);
    setStockAnalysisMessage(null);

    try {
      const response = await fetch('/api/trigger-stock-analysis', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setStockAnalysisMessage({ type: 'success', text: 'Stock analysis triggered successfully!' });
        // Refresh data after webhook
        setTimeout(() => {
          fetchTradingSignals();
        }, 2000);
      } else {
        setStockAnalysisMessage({ type: 'error', text: data.error || 'Failed to trigger stock analysis' });
      }
    } catch (err) {
      setStockAnalysisMessage({ type: 'error', text: 'Failed to trigger stock analysis' });
      console.error(err);
    } finally {
      setStockAnalysisLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setStockAnalysisMessage(null), 5000);
    }
  };

  // Don't render dashboard until user is verified
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '24px'
      }}>
        Loading market data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '24px',
        color: '#ef4444'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!latestData || !latestData.analysis) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '24px'
      }}>
        No market data available
      </div>
    );
  }

  const analysis = latestData.analysis;
  const detailedResults = analysis.detailed_results || {};
  
  // Separate indexes and sectors with full names
  const indexes = ['SPY', 'QQQ', 'DIA', 'IWM'];
  const indexNames = {
    'SPY': 'S&P 500',
    'QQQ': 'Nasdaq 100',
    'DIA': 'Dow Jones',
    'IWM': 'Russell 2000'
  };
  
  const sectors = ['XLC', 'XLE', 'XLF', 'XLI', 'XLK', 'XLP', 'XLU', 'XLV', 'XLY'];
  const sectorNames = {
    'XLC': 'Communication Services',
    'XLE': 'Energy',
    'XLF': 'Financials',
    'XLI': 'Industrials',
    'XLK': 'Technology',
    'XLP': 'Consumer Staples',
    'XLU': 'Utilities',
    'XLV': 'Healthcare',
    'XLY': 'Consumer Discretionary'
  };
  
  const others = ['^VIX', 'HYG', 'TLT'];
  const otherNames = {
    '^VIX': 'Volatility Index',
    'HYG': 'High Yield Bond',
    'TLT': '20+ Year Treasury'
  };

  return (
    <div style={{ minHeight: '100vh', padding: '16px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: 'clamp(24px, 6vw, 48px)', fontWeight: 'bold', marginBottom: '8px' }}>
              Market Analysis Dashboard
            </h1>
            <p style={{ fontSize: 'clamp(12px, 3vw, 18px)', opacity: 0.7 }}>
              Last updated: {new Date(latestData.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Actions Row */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={triggerWebhook}
              disabled={webhookLoading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '2px solid #10b981',
                background: webhookLoading ? '#64748b' : '#10b981',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: webhookLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: webhookLoading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                flex: '1 1 auto',
                minWidth: '140px',
                maxWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!webhookLoading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!webhookLoading) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {webhookLoading ? '⏳ Checking...' : '🔄 Check Market'}
            </button>

            <button
              onClick={triggerStockAnalysis}
              disabled={stockAnalysisLoading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '2px solid #3b82f6',
                background: stockAnalysisLoading ? '#64748b' : '#3b82f6',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: stockAnalysisLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: stockAnalysisLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
                flex: '1 1 auto',
                minWidth: '140px',
                maxWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!stockAnalysisLoading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!stockAnalysisLoading) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {stockAnalysisLoading ? '⏳ Analyzing...' : '📊 Analyze Stocks'}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #ef4444',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: '0 1 auto',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              Logout
            </button>
          </div>

          {/* User Info */}
          <div style={{ textAlign: 'center', fontSize: '14px', opacity: 0.7 }}>
            <span>{user.email}</span>
            <span style={{ margin: '0 8px', color: '#334155' }}>•</span>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{user.role}</span>
          </div>

          {/* Webhook Status Messages */}
          {webhookMessage && (
            <div style={{
              background: webhookMessage.type === 'success' 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${webhookMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '16px',
              color: webhookMessage.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {webhookMessage.text}
            </div>
          )}
          {stockAnalysisMessage && (
            <div style={{
              background: stockAnalysisMessage.type === 'success' 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${stockAnalysisMessage.type === 'success' ? '#3b82f6' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '16px',
              color: stockAnalysisMessage.type === 'success' ? '#3b82f6' : '#ef4444',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {stockAnalysisMessage.text}
            </div>
          )}
        </div>

        {/* Trading Signals */}
        {tradingSignals.length > 0 && (() => {
          // Group signals by symbol, keeping the most recent one
          const groupedSignals = tradingSignals.reduce((acc, signal) => {
            const symbol = signal.symbol;
            if (!acc[symbol]) {
              acc[symbol] = {
                ...signal,
                allSignals: [...signal.signals],
                count: 1,
                allEntries: [signal] // Store all original entries
              };
            } else {
              // Merge signals and update if this one is newer
              const existingDate = new Date(acc[symbol].timestamp);
              const currentDate = new Date(signal.timestamp);
              
              // Add all unique signals
              signal.signals.forEach(sig => {
                if (!acc[symbol].allSignals.includes(sig)) {
                  acc[symbol].allSignals.push(sig);
                }
              });
              
              // Keep the latest price and timestamp
              if (currentDate > existingDate) {
                acc[symbol].timestamp = signal.timestamp;
                acc[symbol].price = signal.price;
              }
              
              acc[symbol].count++;
              acc[symbol].allEntries.push(signal);
            }
            return acc;
          }, {});

          // Convert back to array and sort by most recent
          const mergedSignals = Object.values(groupedSignals)
            .map(signal => ({
              ...signal,
              signals: signal.allSignals,
              // Sort all entries chronologically (newest first)
              allEntries: signal.allEntries.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
              )
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          return (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', marginBottom: '16px' }}>
                🎯 Active Trading Signals ({mergedSignals.length})
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {mergedSignals.map((signal, idx) => (
                  <TradingSignalCard 
                    key={signal.symbol} 
                    signal={signal}
                    isExpanded={expandedSignal === signal.symbol}
                    onToggle={() => setExpandedSignal(
                      expandedSignal === signal.symbol ? null : signal.symbol
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Warning Box */}
        <div style={{ marginBottom: '32px' }}>
          <WarningBox
            level={analysis.warning_level}
            score={analysis.market_health_score?.$numberInt || analysis.market_health_score || 0}
            emoji={analysis.emoji}
            indexWarnings={analysis.index_warnings?.$numberInt || analysis.index_warnings || 0}
            sectorWarnings={analysis.sector_warnings?.$numberInt || analysis.sector_warnings || 0}
            signals={analysis.warning_signals || []}
          />
        </div>

        {/* Market Health Chart */}
        {marketData.length > 1 && (
          <div style={{ marginBottom: '32px' }}>
            <MarketHealthChart data={marketData} />
          </div>
        )}

        {/* Major Indexes */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Major Indexes
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {indexes.map(symbol => (
              detailedResults[symbol] && (
                <SymbolCard 
                  key={symbol} 
                  symbol={symbol} 
                  data={detailedResults[symbol]} 
                  fullName={indexNames[symbol]}
                  onClick={() => {
                    setSelectedSymbol(symbol);
                    setSelectedSymbolName(indexNames[symbol]);
                  }}
                />
              )
            ))}
          </div>
        </div>

        {/* Sectors */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Sector ETFs
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {sectors.map(symbol => (
              detailedResults[symbol] && (
                <SymbolCard 
                  key={symbol} 
                  symbol={symbol} 
                  data={detailedResults[symbol]} 
                  fullName={sectorNames[symbol]}
                  onClick={() => {
                    setSelectedSymbol(symbol);
                    setSelectedSymbolName(sectorNames[symbol]);
                  }}
                />
              )
            ))}
          </div>
        </div>

        {/* Other Indicators */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', marginBottom: '16px' }}>
            Other Indicators
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {others.map(symbol => (
              detailedResults[symbol] && (
                <SymbolCard 
                  key={symbol} 
                  symbol={symbol} 
                  data={detailedResults[symbol]} 
                  fullName={otherNames[symbol]}
                  onClick={() => {
                    setSelectedSymbol(symbol);
                    setSelectedSymbolName(otherNames[symbol]);
                  }}
                />
              )
            ))}
          </div>
        </div>

        {/* Symbol Detail Modal */}
        {selectedSymbol && (
          <SymbolDetailModal
            symbol={selectedSymbol}
            fullName={selectedSymbolName}
            data={marketData}
            onClose={() => setSelectedSymbol(null)}
          />
        )}
      </div>
    </div>
  );
}

