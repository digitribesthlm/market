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
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
                Market Analysis Dashboard
              </h1>
              <p style={{ fontSize: '18px', opacity: 0.7 }}>
                Last updated: {new Date(latestData.timestamp).toLocaleString()}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Logged in as</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user.email}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, color: '#3b82f6' }}>{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid #ef4444',
                  background: 'transparent',
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
          </div>
        </div>

        {/* Trading Signals */}
        {tradingSignals.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
              🎯 Active Trading Signals
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {tradingSignals.slice(0, 12).map((signal, idx) => (
                <TradingSignalCard key={idx} signal={signal} />
              ))}
            </div>
          </div>
        )}

        {/* Warning Box */}
        <div style={{ marginBottom: '40px' }}>
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
          <div style={{ marginBottom: '40px' }}>
            <MarketHealthChart data={marketData} />
          </div>
        )}

        {/* Major Indexes */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
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
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
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
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
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

