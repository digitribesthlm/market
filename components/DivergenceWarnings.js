// DivergenceWarnings.js
// Frontend-only component that detects 1929-style market divergences
// Uses existing data from the backend without requiring backend changes

export default function DivergenceWarnings({ detailedResults, latestData }) {
  if (!detailedResults) return null;

  const warnings = [];

  // Helper function to safely get numeric values
  const getPrice = (data) => data?.price?.$numberDouble || data?.price || 0;
  const getStoch = (data) => data?.stoch_14?.$numberDouble || data?.stoch_14?.$numberInt || data?.stoch_14 || 0;
  const getWarningCount = (data) => data?.warning_count?.$numberInt || data?.warning_count || 0;
  const isAboveEMA = (data) => data?.above_ema || false;

  // Get data for key symbols
  const spy = detailedResults['SPY'];
  const vix = detailedResults['^VIX'];
  const hyg = detailedResults['HYG'];
  const tlt = detailedResults['TLT'];
  const gld = detailedResults['GLD'];
  const xlf = detailedResults['XLF'];
  const xlp = detailedResults['XLP'];
  const xlu = detailedResults['XLU'];
  const xlv = detailedResults['XLV'];
  const xlk = detailedResults['XLK'];
  const xly = detailedResults['XLY'];
  const xle = detailedResults['XLE'];

  // 1. VIX-Market Divergence (Fear rising while market stable)
  if (vix && spy) {
    const vixPrice = getPrice(vix);
    const spyAboveEMA = isAboveEMA(spy);
    const spyWarnings = getWarningCount(spy);
    
    // VIX above 20 while SPY is above EMA = institutional hedging
    if (vixPrice > 20 && spyAboveEMA) {
      warnings.push({
        type: 'divergence',
        severity: 'high',
        title: '⚠️ Fear Rising Despite Market Strength',
        description: `VIX at ${vixPrice.toFixed(1)} while SPY above trend - institutional hedging detected`,
        symbol: '^VIX',
        pattern: '1929'
      });
    }

    // VIX elevated with SPY showing warnings
    if (vixPrice > 18 && spyWarnings > 0) {
      warnings.push({
        type: 'divergence',
        severity: 'medium',
        title: '📊 Volatility Elevated with Market Warnings',
        description: `VIX at ${vixPrice.toFixed(1)} with ${spyWarnings} SPY warning(s) - increased caution`,
        symbol: '^VIX',
        pattern: '1929'
      });
    }
  }

  // 2. Gold-Stock Divergence (Smart money hedging with gold)
  if (gld && spy) {
    const gldAboveEMA = isAboveEMA(gld);
    const spyAboveEMA = isAboveEMA(spy);
    const gldPrice = getPrice(gld);
    const gldWarnings = getWarningCount(gld);
    
    // Gold rising while stocks rise = smart money hedging (1929 pattern)
    if (gldAboveEMA && spyAboveEMA) {
      warnings.push({
        type: 'divergence',
        severity: 'high',
        title: '🥇 Gold-Stock Divergence: 1929 Pattern',
        description: `Gold (${gldPrice.toFixed(2)}) and stocks both rising - smart money accumulating safe havens`,
        symbol: 'GLD',
        pattern: '1929'
      });
    }

    // Gold showing strength with low warnings while market has warnings
    if (gldAboveEMA && spy && getWarningCount(spy) > 0 && gldWarnings === 0) {
      warnings.push({
        type: 'divergence',
        severity: 'medium',
        title: '🏆 Gold Strength During Market Stress',
        description: `Gold above trend with no warnings while SPY shows ${getWarningCount(spy)} warning(s) - flight to safety`,
        symbol: 'GLD',
        pattern: '1929'
      });
    }
  }

  // 3. Bond-Stock Divergence (Flight to safety during rally)
  if (tlt && spy) {
    const tltAboveEMA = isAboveEMA(tlt);
    const spyAboveEMA = isAboveEMA(spy);
    const tltWarnings = getWarningCount(tlt);
    
    // Both bonds and stocks above EMA = divergence
    if (tltAboveEMA && spyAboveEMA) {
      warnings.push({
        type: 'divergence',
        severity: 'high',
        title: '🏛️ Bond-Stock Divergence Detected',
        description: 'Both treasuries and stocks rising - smart money seeking safety during rally',
        symbol: 'TLT',
        pattern: '1929'
      });
    }
  }

  // 4. Credit Stress (High yield weakness)
  if (hyg && spy) {
    const hygWarnings = getWarningCount(hyg);
    const hygAboveEMA = isAboveEMA(hyg);
    const spyAboveEMA = isAboveEMA(spy);
    
    // HYG below EMA while SPY above = credit stress
    if (!hygAboveEMA && spyAboveEMA) {
      warnings.push({
        type: 'credit',
        severity: 'high',
        title: '💳 High Yield Credit Stress',
        description: 'Junk bonds weakening while stocks rise - credit market deterioration',
        symbol: 'HYG',
        pattern: '1929'
      });
    }

    // HYG has warnings while market doesn't
    if (hygWarnings > 0 && spy && getWarningCount(spy) === 0) {
      warnings.push({
        type: 'credit',
        severity: 'medium',
        title: '⚠️ Credit Market Warning Signals',
        description: `High yield bonds showing ${hygWarnings} warning(s) - early stress indicator`,
        symbol: 'HYG',
        pattern: '1929'
      });
    }
  }

  // 5. Financial Sector Weakness (Banking stocks leading decline)
  if (xlf && spy) {
    const xlfWarnings = getWarningCount(xlf);
    const xlfAboveEMA = isAboveEMA(xlf);
    const spyAboveEMA = isAboveEMA(spy);
    const spyWarnings = getWarningCount(spy);
    
    // XLF below EMA while SPY above = financials leading down
    if (!xlfAboveEMA && spyAboveEMA) {
      warnings.push({
        type: 'sector',
        severity: 'high',
        title: '🏦 Banking Sector Leading Decline',
        description: 'Financials weakening while market rises - classic 1929 pattern',
        symbol: 'XLF',
        pattern: '1929'
      });
    }

    // XLF has more warnings than SPY
    if (xlfWarnings > spyWarnings && xlfWarnings > 0) {
      warnings.push({
        type: 'sector',
        severity: 'medium',
        title: '📉 Financial Sector Stress',
        description: `Financials showing ${xlfWarnings} warning(s) vs ${spyWarnings} for market - sector weakness`,
        symbol: 'XLF',
        pattern: '1929'
      });
    }
  }

  // 6. Defensive Sector Rotation (Smart money going defensive)
  if (xlp && xlu && xlv && xlk && xly && xle) {
    const defensiveAboveEMA = [
      isAboveEMA(xlp),
      isAboveEMA(xlu),
      isAboveEMA(xlv)
    ].filter(Boolean).length;

    const cyclicalAboveEMA = [
      isAboveEMA(xlk),
      isAboveEMA(xly),
      isAboveEMA(xle)
    ].filter(Boolean).length;

    // Defensives outperforming cyclicals
    if (defensiveAboveEMA >= 2 && cyclicalAboveEMA <= 1) {
      warnings.push({
        type: 'rotation',
        severity: 'medium',
        title: '🛡️ Defensive Sector Rotation',
        description: `${defensiveAboveEMA}/3 defensive sectors strong vs ${cyclicalAboveEMA}/3 cyclicals - risk-off positioning`,
        symbol: 'Sectors',
        pattern: '1929'
      });
    }
  }

  // 7. Overbought Market with Warnings (Euphoria with cracks)
  if (spy) {
    const spyStoch = getStoch(spy);
    const spyWarnings = getWarningCount(spy);
    const spyOverbought = spy.overbought;

    if (spyOverbought && spyWarnings > 0) {
      warnings.push({
        type: 'technical',
        severity: 'medium',
        title: '📈 Overbought Market with Warning Signals',
        description: `SPY overbought (Stoch: ${spyStoch.toFixed(1)}) with ${spyWarnings} warning(s) - potential reversal`,
        symbol: 'SPY',
        pattern: 'technical'
      });
    }
  }

  // 8. Multiple Sector Warnings (Broad market deterioration)
  const sectorSymbols = ['XLC', 'XLE', 'XLF', 'XLI', 'XLK', 'XLP', 'XLU', 'XLV', 'XLY'];
  const sectorsWithWarnings = sectorSymbols.filter(symbol => {
    const data = detailedResults[symbol];
    return data && getWarningCount(data) > 0;
  });

  if (sectorsWithWarnings.length >= 4) {
    warnings.push({
      type: 'breadth',
      severity: 'high',
      title: '🌐 Broad Market Deterioration',
      description: `${sectorsWithWarnings.length}/9 sectors showing warnings - market breadth weakening`,
      symbol: 'Market',
      pattern: '1929'
    });
  }

  // If no warnings, return null
  if (warnings.length === 0) return null;

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 'bold', marginBottom: '8px' }}>
        🔍 1929-Style Divergence Analysis
      </h2>
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
        Frontend analysis detecting smart money positioning and market divergences similar to pre-1929 crash patterns
      </p>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {warnings.map((warning, idx) => {
          const severityColors = {
            high: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
            medium: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' },
            low: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' }
          };
          
          const colors = severityColors[warning.severity];
          
          return (
            <div
              key={idx}
              style={{
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '16px',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: colors.text }}>
                  {warning.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    background: colors.border,
                    color: '#fff'
                  }}>
                    {warning.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 'bold' }}>
                    {warning.symbol}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
                {warning.description}
              </p>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'rgba(100, 116, 139, 0.1)', 
        borderRadius: '8px',
        fontSize: '12px',
        opacity: 0.8
      }}>
        💡 <strong>Note:</strong> These warnings are calculated client-side using existing market data. 
        They detect divergences and patterns similar to those observed before the 1929 crash.
      </div>
    </div>
  );
}
