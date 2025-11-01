import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LynchScore() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const analyzeTicker = async (e) => {
    e.preventDefault();
    
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call our API route instead of directly calling the webhook
      const response = await fetch('/api/lynch-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const tickerResult = data.results[0];
        
        if (tickerResult.Error) {
          setError(`Error analyzing ${ticker}: ${tickerResult.Error}`);
        } else {
          setResult(tickerResult);
        }
      } else {
        setError('No results returned from analysis');
      }
    } catch (err) {
      setError(`Failed to analyze ticker: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getScoreColor = (score) => {
    if (score >= 20) return '#00ff88';
    if (score >= 17) return '#00cc66';
    if (score >= 14) return '#ffaa00';
    if (score >= 11) return '#ff8800';
    if (score >= 8) return '#ff6600';
    return '#ff4444';
  };

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Lynch Score Analyzer</h1>
          <div style={styles.headerRight}>
            <button onClick={() => router.push('/')} style={styles.backButton}>
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Input Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Analyze Stock</h2>
          <form onSubmit={analyzeTicker} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ticker Symbol</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="e.g., AAPL, MSFT, GOOGL"
                style={styles.input}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {error && (
            <div style={styles.errorBox}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.card}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Analyzing {ticker.toUpperCase()}...</p>
              <p style={styles.loadingSubtext}>This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Analysis Results</h2>
            
            {/* Company Header */}
            <div style={styles.companyHeader}>
              <div>
                <h3 style={styles.companyName}>{result['Company Name']}</h3>
                <p style={styles.companyMeta}>
                  {result.Ticker} • {result.Sector} • {result.Industry}
                </p>
              </div>
            </div>

            {/* Lynch Score */}
            <div style={{
              ...styles.scoreBox,
              borderColor: getScoreColor(result['Lynch Score'])
            }}>
              <div style={styles.scoreLabel}>Lynch Score</div>
              <div style={{
                ...styles.scoreValue,
                color: getScoreColor(result['Lynch Score'])
              }}>
                {result['Lynch Score']}
              </div>
              <div style={styles.scoreCategory}>{result['Score Category']}</div>
            </div>

            {/* Score Breakdown */}
            <div style={styles.breakdownGrid}>
              <div style={styles.breakdownItem}>
                <div style={styles.breakdownLabel}>Growth Quality</div>
                <div style={styles.breakdownValue}>{result['Growth Quality Score']}</div>
              </div>
              <div style={styles.breakdownItem}>
                <div style={styles.breakdownLabel}>Quality Foundation</div>
                <div style={styles.breakdownValue}>{result['Quality Foundation Score']}</div>
              </div>
              <div style={styles.breakdownItem}>
                <div style={styles.breakdownLabel}>Momentum</div>
                <div style={styles.breakdownValue}>{result['Momentum Score']}</div>
              </div>
              <div style={styles.breakdownItem}>
                <div style={styles.breakdownLabel}>Thematic</div>
                <div style={styles.breakdownValue}>{result['Thematic Score']}</div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div style={styles.metricsSection}>
              <h3 style={styles.sectionTitle}>Financial Metrics</h3>
              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>P/E Ratio</span>
                  <span style={styles.metricValue}>{result['P/E Ratio']}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>PEG Ratio</span>
                  <span style={styles.metricValue}>{result['PEG Ratio']}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Earnings Growth</span>
                  <span style={styles.metricValue}>{result['Earnings Growth %']}%</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Revenue Growth</span>
                  <span style={styles.metricValue}>{result['Revenue Growth %']}%</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>ROIC</span>
                  <span style={styles.metricValue}>{result['ROIC %']}%</span>
                </div>
              </div>
            </div>

            {/* Analyze Another */}
            <button 
              onClick={() => {
                setTicker('');
                setResult(null);
                setError(null);
              }}
              style={styles.analyzeAnotherButton}
            >
              Analyze Another Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0e27',
    color: '#ffffff',
  },
  header: {
    background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
  },
  backButton: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#ff4444',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#ffffff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
  submitButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  errorBox: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ff6b6b',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '40px 20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  loadingSubtext: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
  },
  companyHeader: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  companyName: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  companyMeta: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scoreBox: {
    textAlign: 'center',
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '2px solid',
    marginBottom: '30px',
  },
  scoreLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  scoreValue: {
    fontSize: '64px',
    fontWeight: 'bold',
    lineHeight: '1',
    marginBottom: '10px',
  },
  scoreCategory: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  breakdownItem: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  breakdownLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '8px',
  },
  breakdownValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  metricsSection: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#ffffff',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  metricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
  },
  metricLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  analyzeAnotherButton: {
    marginTop: '30px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s',
  },
};
